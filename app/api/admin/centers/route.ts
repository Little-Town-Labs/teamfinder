import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { bowlingCenters } from "@/drizzle/schema/bowling-centers";
import { users } from "@/drizzle/schema/users";
import { getClerkUser } from "@/lib/admin/clerk-integration";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(adminClerkUserId, "create_centers");

    // Get admin user info
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, adminClerkUserId))
      .limit(1);

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    const clerkUser = await getClerkUser(adminClerkUserId);
    const adminName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "Unknown";

    const body = (await request.json()) as {
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      phoneNumber?: string | null;
      website?: string | null;
      laneCount?: number | null;
      isVerified?: boolean;
    };
    const { name, address, city, state, zipCode, phoneNumber, website, laneCount, isVerified } =
      body;

    // Validate required fields
    if (!name || !address || !city || !state || !zipCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create center
    const [newCenter] = await db
      .insert(bowlingCenters)
      .values({
        name,
        address,
        city,
        state,
        zipCode,
        phone: phoneNumber || null,
        website: website || null,
        numberOfLanes: laneCount?.toString() || null,
        verified: isVerified || false,
        addedBy: adminUser.id,
        lastVerifiedBy: isVerified ? adminUser.id : null,
        lastVerifiedAt: isVerified ? new Date() : null,
      })
      .returning();

    if (!newCenter) {
      return NextResponse.json({ error: "Failed to create center" }, { status: 500 });
    }

    // Log action
    await logAdminAction({
      adminClerkUserId,
      adminName,
      actionType: "center_created",
      targetType: "center",
      targetId: newCenter.id,
      targetDescription: `Center: ${name}`,
      reason: "Created new bowling center",
      newValue: { name, city, state, isVerified },
    });

    return NextResponse.json({
      success: true,
      message: "Center created successfully",
      center: newCenter,
    });
  } catch (error) {
    console.error("Error creating center:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create center" },
      { status: 500 },
    );
  }
}
