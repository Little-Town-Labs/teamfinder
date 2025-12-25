import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { users } from "@/drizzle/schema";
import { db } from "@/lib/db";

const privacySettingsSchema = z.object({
  marketingEmailsOptIn: z.boolean().optional(),
  cookieConsentGiven: z.boolean().optional(),
});

/**
 * PUT /api/user/privacy-settings
 * Update user privacy settings (marketing opt-in, cookie consent, etc.)
 */
export async function PUT(request: Request) {
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

    const body = privacySettingsSchema.parse(await request.json());

    // Update privacy settings
    const updateData: Record<string, unknown> = {};

    if (body.marketingEmailsOptIn !== undefined) {
      updateData.marketingEmailsOptIn = body.marketingEmailsOptIn;
    }

    if (body.cookieConsentGiven !== undefined) {
      updateData.cookieConsentGiven = body.cookieConsentGiven;
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, user.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating privacy settings:", error);
    return NextResponse.json(
      { error: "Failed to update privacy settings" },
      { status: 500 }
    );
  }
}
