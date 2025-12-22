import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { banUser, getClerkUser } from "@/lib/admin/clerk-integration";
import { logUserBan } from "@/lib/admin/audit-logger";
import { requirePermission } from "@/lib/admin/permissions";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Check authentication
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check permission
    await requirePermission(adminClerkUserId, "ban_users");

    // 3. Get target user ID
    const { id: targetClerkUserId } = await params;

    // 4. Get user info for logging
    const targetUser = await getClerkUser(targetClerkUserId);
    const targetUserName =
      [targetUser.firstName, targetUser.lastName].filter(Boolean).join(" ") || targetUser.emailAddresses[0]?.emailAddress || "Unknown";

    // Get admin info
    const adminUser = await getClerkUser(adminClerkUserId);
    const adminName =
      [adminUser.firstName, adminUser.lastName].filter(Boolean).join(" ") || adminUser.emailAddresses[0]?.emailAddress || "Unknown";

    // 5. Get reason from request body
    const body = (await request.json()) as { reason?: string };
    const reason = body.reason || "No reason provided";

    // 6. Ban user via Clerk API
    await banUser(targetClerkUserId);

    // 7. Log admin action
    await logUserBan({
      adminClerkUserId,
      adminName,
      targetUserId: targetClerkUserId,
      targetUserName,
      reason,
    });

    return NextResponse.json({ success: true, message: "User banned successfully" });
  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to ban user" },
      { status: 500 },
    );
  }
}
