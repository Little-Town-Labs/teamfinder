import { eq } from "drizzle-orm";
import { cache } from "react";
import { settings } from "@/drizzle/schema";
import { db } from "@/lib/db";

/**
 * Get a setting value by key
 * Cached to avoid repeated database queries during SSR
 */
export const getSetting = cache(async (key: string): Promise<string | null> => {
  const setting = await db.query.settings.findFirst({
    where: eq(settings.key, key),
  });

  return setting?.value || null;
});

/**
 * Check if a boolean setting is enabled
 * Returns false if setting doesn't exist or is not "true"
 */
export const isSettingEnabled = cache(async (key: string): Promise<boolean> => {
  const value = await getSetting(key);
  return value === "true";
});

/**
 * Update a setting value
 * Creates the setting if it doesn't exist
 */
export async function updateSetting(
  key: string,
  value: string,
  description?: string
): Promise<void> {
  await db
    .insert(settings)
    .values({
      key,
      value,
      description: description || null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value,
        updatedAt: new Date(),
      },
    });
}

/**
 * Feature flag keys (for type safety)
 */
export const FeatureFlags = {
  COOKIE_BANNER_ENABLED: "cookie_banner_enabled",
} as const;
