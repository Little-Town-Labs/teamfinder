"use client";

import { Cookie, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface FeatureTogglesProps {
  initialCookieBannerEnabled: boolean;
}

export function FeatureToggles({ initialCookieBannerEnabled }: FeatureTogglesProps) {
  const router = useRouter();
  const [cookieBannerEnabled, setCookieBannerEnabled] = useState(initialCookieBannerEnabled);
  const [loading, setLoading] = useState(false);

  const handleToggleCookieBanner = async (enabled: boolean) => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookieBannerEnabled: enabled }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to update setting");
      }

      setCookieBannerEnabled(enabled);
      toast.success(`Cookie banner ${enabled ? "enabled" : "disabled"}`);

      // Refresh to re-render the page with the new setting
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update setting");
      // Revert the toggle on error
      setCookieBannerEnabled(!enabled);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center gap-2">
        <Cookie className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feature Toggles</h2>
      </div>

      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Enable or disable features across the entire application.
      </p>

      {/* Cookie Banner Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Cookie Consent Banner</h3>
              {cookieBannerEnabled && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              GetTerms cookie consent banner (GDPR/CCPA compliance)
            </p>
            {!cookieBannerEnabled && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Banner is disabled - users will not see cookie consent options
              </p>
            )}
          </div>

          <div className="ml-4 flex items-center gap-3">
            {loading && <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />}

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={cookieBannerEnabled}
                onChange={(e) => handleToggleCookieBanner(e.target.checked)}
                disabled={loading}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"></div>
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Changes take effect immediately. Users will need to refresh their
            browser to see the banner appear/disappear.
          </p>
        </div>
      </div>
    </div>
  );
}
