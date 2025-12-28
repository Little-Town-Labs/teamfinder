import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { users } from "@/drizzle/schema";
import { logUsbcVerification } from "@/lib/admin/audit-logger";
import { getClerkUser } from "@/lib/admin/clerk-integration";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

const verifyUsbcSchema = z.object({
  usbcId: z.string().min(1, "USBC ID is required"),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check permission
    await requirePermission(adminClerkUserId, "verify_usbc");

    // 3. Get target user ID
    const { id: targetClerkUserId } = await params;

    // 4. Validate request body
    const body = (await request.json()) as unknown;
    const validationResult = verifyUsbcSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { usbcId, notes } = validationResult.data;

    // 5. Get user info
    const targetUser = await getClerkUser(targetClerkUserId);
    const targetUserName =
      [targetUser.firstName, targetUser.lastName].filter(Boolean).join(" ") ||
      targetUser.emailAddresses[0]?.emailAddress ||
      "Unknown";

    const adminUser = await getClerkUser(adminClerkUserId);
    const adminName =
      [adminUser.firstName, adminUser.lastName].filter(Boolean).join(" ") ||
      adminUser.emailAddresses[0]?.emailAddress ||
      "Unknown";

    // 6. Get database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkUserId, targetClerkUserId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User has not completed onboarding" },
        { status: 404 }
      );
    }

    // 7. Update user's USBC verification
    await db
      .update(users)
      .set({
        usbcVerificationNotes: notes || null,
        lastVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, dbUser.id));

    // 8. Log admin action
    await logUsbcVerification({
      adminClerkUserId,
      adminName,
      targetUserId: targetClerkUserId,
      targetUserName,
      usbcId,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: "USBC membership verified successfully",
    });
  } catch (error) {
    console.error("Error verifying USBC:", error);

    if (error instanceof Error && error.message.includes("Permission denied")) {
      return NextResponse.json(
        { error: "You do not have permission to verify USBC memberships" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify USBC membership" },
      { status: 500 }
    );
  }
}
