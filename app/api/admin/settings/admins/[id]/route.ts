import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { adminRoles } from "@/drizzle/schema/admin-roles";
import { users } from "@/drizzle/schema/users";
import { getClerkUser, revokeAdminRole } from "@/lib/admin/clerk-integration";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(adminClerkUserId, "manage_admins");

    const { id: adminRoleId } = await params;

    // Get admin role info before deletion
    const [adminRole] = await db
      .select({
        id: adminRoles.id,
        role: adminRoles.role,
        userId: adminRoles.userId,
        userEmail: users.email,
        userClerkUserId: users.clerkUserId,
      })
      .from(adminRoles)
      .leftJoin(users, eq(adminRoles.userId, users.id))
      .where(eq(adminRoles.id, adminRoleId))
      .limit(1);

    if (!adminRole) {
      return NextResponse.json({ error: "Admin role not found" }, { status: 404 });
    }

    // Prevent self-revocation
    if (adminRole.userClerkUserId === adminClerkUserId) {
      return NextResponse.json(
        { error: "You cannot revoke your own admin role" },
        { status: 400 },
      );
    }

    // Revoke role in Clerk (publicMetadata)
    if (adminRole.userClerkUserId) {
      await revokeAdminRole(adminRole.userClerkUserId);
    }

    // Delete admin role record from database
    await db.delete(adminRoles).where(eq(adminRoles.id, adminRoleId));

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
      actionType: "admin_role_revoked",
      targetType: "user",
      targetId: adminRole.userId || "",
      targetDescription: `User: ${adminRole.userEmail}`,
      reason: "Revoked admin role",
      previousValue: { role: adminRole.role },
    });

    return NextResponse.json({
      success: true,
      message: "Admin role revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking admin role:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to revoke admin role" },
      { status: 500 },
    );
  }
}
