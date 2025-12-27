import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { users } from "@/drizzle/schema";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";
import { FeatureFlags, getSetting, updateSetting } from "@/lib/settings";

/**
 * GET /api/admin/settings
 * Get all feature flags and settings
 */
export async function GET() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permission
  await requirePermission(clerkUserId, "manage_admins");

  const cookieBannerEnabled = await getSetting(FeatureFlags.COOKIE_BANNER_ENABLED);

  return NextResponse.json({
    settings: {
      cookieBannerEnabled: cookieBannerEnabled === "true",
    },
  });
}

/**
 * PUT /api/admin/settings
 * Update feature flags and settings
 */
const updateSettingsSchema = z.object({
  cookieBannerEnabled: z.boolean().optional(),
});

export async function PUT(request: NextRequest) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get database user
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check permission
  await requirePermission(clerkUserId, "manage_admins");

  const body = (await request.json()) as unknown;
  const validationResult = updateSettingsSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: "Invalid request data", details: validationResult.error.errors },
      { status: 400 }
    );
  }

  const { cookieBannerEnabled } = validationResult.data;

  // Update cookie banner setting if provided
  if (cookieBannerEnabled !== undefined) {
    const oldValue = await getSetting(FeatureFlags.COOKIE_BANNER_ENABLED);

    await updateSetting(
      FeatureFlags.COOKIE_BANNER_ENABLED,
      cookieBannerEnabled ? "true" : "false",
      "Enable/disable the GetTerms cookie consent banner"
    );

    // Log the admin action
    await logAdminAction({
      adminClerkUserId: clerkUserId,
      adminName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown",
      actionType: "settings_update",
      targetType: "setting",
      targetId: FeatureFlags.COOKIE_BANNER_ENABLED,
      targetDescription: "Cookie Banner Feature Flag",
      previousValue: { value: oldValue },
      newValue: { value: cookieBannerEnabled ? "true" : "false" },
      metadata: {
        settingKey: FeatureFlags.COOKIE_BANNER_ENABLED,
      },
    });
  }

  return NextResponse.json({
    success: true,
    message: "Settings updated successfully",
  });
}
