import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { bowlingCenters } from "@/drizzle/schema/bowling-centers";
import { users } from "@/drizzle/schema/users";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { getClerkUser } from "@/lib/admin/clerk-integration";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(adminClerkUserId, "edit_centers");

    const { id: centerId } = await params;

    // Get center info before update
    const [center] = await db
      .select()
      .from(bowlingCenters)
      .where(eq(bowlingCenters.id, centerId))
      .limit(1);

    if (!center) {
      return NextResponse.json({ error: "Center not found" }, { status: 404 });
    }

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

    const updateData: Record<string, unknown> = {
      name,
      address,
      city,
      state,
      zipCode,
      phone: phoneNumber || null,
      website: website || null,
      numberOfLanes: laneCount?.toString() || null,
      verified: isVerified || false,
      updatedAt: new Date(),
    };

    // If verifying center, update verification fields
    if (isVerified && !center.verified) {
      updateData.lastVerifiedBy = adminUser.id;
      updateData.lastVerifiedAt = new Date();
    }

    // Update center
    const [updatedCenter] = await db
      .update(bowlingCenters)
      .set(updateData)
      .where(eq(bowlingCenters.id, centerId))
      .returning();

    // Log action
    await logAdminAction({
      adminClerkUserId,
      adminName,
      actionType: "center_edited",
      targetType: "center",
      targetId: centerId,
      targetDescription: `Center: ${name}`,
      reason: "Updated center information",
      previousValue: {
        name: center.name,
        city: center.city,
        state: center.state,
        isVerified: center.verified,
      },
      newValue: { name, city, state, isVerified },
    });

    return NextResponse.json({
      success: true,
      message: "Center updated successfully",
      center: updatedCenter,
    });
  } catch (error) {
    console.error("Error updating center:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update center" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(adminClerkUserId, "delete_centers");

    const { id: centerId } = await params;

    // Get center info before deletion
    const [center] = await db
      .select()
      .from(bowlingCenters)
      .where(eq(bowlingCenters.id, centerId))
      .limit(1);

    if (!center) {
      return NextResponse.json({ error: "Center not found" }, { status: 404 });
    }

    const clerkUser = await getClerkUser(adminClerkUserId);
    const adminName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "Unknown";

    const body = (await request.json()) as { reason?: string };
    const reason = body.reason || "No reason provided";

    // Delete center
    await db.delete(bowlingCenters).where(eq(bowlingCenters.id, centerId));

    // Log action
    await logAdminAction({
      adminClerkUserId,
      adminName,
      actionType: "center_deleted",
      targetType: "center",
      targetId: centerId,
      targetDescription: `Center: ${center.name}`,
      reason,
      previousValue: { name: center.name, city: center.city, state: center.state },
    });

    return NextResponse.json({ success: true, message: "Center deleted successfully" });
  } catch (error) {
    console.error("Error deleting center:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete center" },
      { status: 500 },
    );
  }
}
