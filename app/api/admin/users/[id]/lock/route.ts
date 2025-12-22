import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getClerkUser, lockUser } from "@/lib/admin/clerk-integration";
import { logUserLock } from "@/lib/admin/audit-logger";
import { requirePermission } from "@/lib/admin/permissions";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: adminClerkUserId } = await auth();
    if (!adminClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(adminClerkUserId, "lock_users");

    const { id: targetClerkUserId } = await params;

    const targetUser = await getClerkUser(targetClerkUserId);
    const targetUserName =
      [targetUser.firstName, targetUser.lastName].filter(Boolean).join(" ") || targetUser.emailAddresses[0]?.emailAddress || "Unknown";

    const adminUser = await getClerkUser(adminClerkUserId);
    const adminName =
      [adminUser.firstName, adminUser.lastName].filter(Boolean).join(" ") || adminUser.emailAddresses[0]?.emailAddress || "Unknown";

    const body = (await request.json()) as { reason?: string };
    const reason = body.reason || "No reason provided";

    await lockUser(targetClerkUserId);

    await logUserLock({
      adminClerkUserId,
      adminName,
      targetUserId: targetClerkUserId,
      targetUserName,
      reason,
    });

    return NextResponse.json({ success: true, message: "User locked successfully" });
  } catch (error) {
    console.error("Error locking user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to lock user" },
      { status: 500 },
    );
  }
}
