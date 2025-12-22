import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { adminRoles } from "@/drizzle/schema/admin-roles";
import { users } from "@/drizzle/schema/users";
import { assignAdminRole, getClerkUser, searchUsers } from "@/lib/admin/clerk-integration";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(adminClerkUserId, "manage_admins");

    const body = (await request.json()) as { email: string; role: string; notes?: string };
    const { email, role, notes } = body;

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    if (!["super_admin", "moderator", "content_reviewer", "support"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Find user by email in Clerk
    const clerkUsers = await searchUsers(email, 1);
    if (clerkUsers.data.length === 0) {
      return NextResponse.json({ error: "User not found with that email" }, { status: 404 });
    }

    const clerkUser = clerkUsers.data[0]!;

    // Get or create database user
    let [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1);

    if (!dbUser) {
      // Create user in database if they don't exist
      [dbUser] = await db
        .insert(users)
        .values({
          clerkUserId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
        })
        .returning();

      if (!dbUser) {
        return NextResponse.json({ error: "Failed to create user in database" }, { status: 500 });
      }
    }

    // Check if user already has an admin role
    const [existingRole] = await db
      .select()
      .from(adminRoles)
      .where(eq(adminRoles.userId, dbUser.id))
      .limit(1);

    if (existingRole) {
      return NextResponse.json(
        { error: "User already has an admin role. Revoke it first to change roles." },
        { status: 400 },
      );
    }

    // Get assigner info
    const [assignerUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, adminClerkUserId))
      .limit(1);

    // Assign role in Clerk (publicMetadata)
    await assignAdminRole(clerkUser.id, role as "super_admin" | "moderator" | "content_reviewer" | "support");

    // Create admin role record in database
    await db.insert(adminRoles).values({
      userId: dbUser.id,
      role: role as "super_admin" | "moderator" | "content_reviewer" | "support",
      assignedBy: assignerUser?.id || null,
      notes: notes || null,
    });

    // Get admin info for logging
    const adminUser = await getClerkUser(adminClerkUserId);
    const adminName =
      [adminUser.firstName, adminUser.lastName].filter(Boolean).join(" ") ||
      adminUser.emailAddresses[0]?.emailAddress ||
      "Unknown";

    // Log action
    await logAdminAction({
      adminClerkUserId,
      adminName,
      actionType: "admin_role_assigned",
      targetType: "user",
      targetId: dbUser.id,
      targetDescription: `User: ${email}`,
      reason: notes || `Assigned ${role} role`,
      newValue: { role },
    });

    return NextResponse.json({
      success: true,
      message: "Admin role assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning admin role:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to assign admin role" },
      { status: 500 },
    );
  }
}
