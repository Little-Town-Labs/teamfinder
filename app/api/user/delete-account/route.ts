import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import {
  activityLogs,
  affiliations,
  messages,
  playerProfiles,
  privacyConsents,
  teamMembers,
  users,
} from "@/drizzle/schema";
import { db } from "@/lib/db";

/**
 * POST /api/user/delete-account
 * Permanently delete user account and all associated data (GDPR Right to Erasure)
 */
export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user data in transaction (database cascade should handle most relationships)
    await db.transaction(async (tx) => {
      // Delete related records that might not have cascade configured
      await tx.delete(activityLogs).where(eq(activityLogs.userId, user.id));
      await tx.delete(messages).where(eq(messages.senderId, user.id));
      await tx.delete(teamMembers).where(eq(teamMembers.userId, user.id));
      await tx.delete(affiliations).where(eq(affiliations.userId, user.id));
      await tx.delete(privacyConsents).where(eq(privacyConsents.userId, user.id));
      await tx.delete(playerProfiles).where(eq(playerProfiles.userId, user.id));

      // Delete the user record (this will cascade to other relationships)
      await tx.delete(users).where(eq(users.id, user.id));
    });

    // Delete from Clerk
    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
