"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/Button/Button"; // For policy page links

interface PrivacySettingsClientProps {
  marketingOptIn: boolean;
  cookieConsentGiven: boolean;
  privacyPolicyVersion: string;
  termsVersion: string;
  privacyPolicyAcceptedAt: string | null;
  termsAcceptedAt: string | null;
}

export function PrivacySettingsClient({
  marketingOptIn,
  cookieConsentGiven,
  privacyPolicyVersion,
  termsVersion,
  privacyPolicyAcceptedAt,
  termsAcceptedAt,
}: PrivacySettingsClientProps) {
  const router = useRouter();
  const [optIn, setOptIn] = useState(marketingOptIn);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarketingToggle = async () => {
    setIsUpdating(true);

    try {
      const response = await fetch("/api/user/privacy-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingEmailsOptIn: !optIn }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to update settings");
      }

      setOptIn(!optIn);
      toast.success("Privacy settings updated");
      router.refresh();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportData = async () => {
    toast.loading("Preparing your data...", { id: "export" });

    try {
      // Trigger download
      window.location.href = "/api/user/export-data";

      // Dismiss loading toast after a delay
      setTimeout(() => {
        toast.success("Data export started", { id: "export" });
      }, 2000);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data", { id: "export" });
    }
  };

  const handleDeleteAccount = async () => {
    // First confirmation
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
    );

    if (!confirmed) return;

    // Second confirmation with typing DELETE
    const confirmation = window.prompt(
      'To confirm account deletion, please type "DELETE" (all caps):'
    );

    if (confirmation !== "DELETE") {
      toast.error("Account deletion cancelled");
      return;
    }

    setIsUpdating(true);
    toast.loading("Deleting account...", { id: "delete" });

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully. Redirecting...", {
        id: "delete",
      });

      // Redirect to home page after a delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account", { id: "delete" });
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not accepted";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Marketing Preferences */}
      <section className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Marketing Preferences
        </h2>
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={optIn}
            onChange={handleMarketingToggle}
            disabled={isUpdating}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
          />
          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
            Receive updates and news about TeamFinder via email
          </span>
        </label>
      </section>

      {/* Policy Versions */}
      <section className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Your Agreements
        </h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Privacy Policy
            </p>
            <p>Version: {privacyPolicyVersion}</p>
            <p>Accepted: {formatDate(privacyPolicyAcceptedAt)}</p>
          </div>
          <div className="pt-2">
            <p className="font-medium text-gray-900 dark:text-white">
              Terms of Service
            </p>
            <p>Version: {termsVersion}</p>
            <p>Accepted: {formatDate(termsAcceptedAt)}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/privacy" intent="secondary" size="sm">
            View Privacy Policy
          </Button>
          <Button href="/terms" intent="secondary" size="sm">
            View Terms
          </Button>
          <Button href="/cookies" intent="secondary" size="sm">
            View Cookie Policy
          </Button>
        </div>
      </section>

      {/* Cookie Consent */}
      <section className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Cookie Consent
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Cookie consent status: {cookieConsentGiven ? "Given" : "Not given"}
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          You can manage your cookie preferences through the cookie banner. If
          you don't see the banner, you may need to clear your browser cookies
          and revisit the site.
        </p>
      </section>

      {/* Data Rights (GDPR) */}
      <section className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Your Data Rights
        </h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Under GDPR and CCPA, you have the right to access, export, and delete
          your personal data.
        </p>

        <div className="space-y-6">
          {/* Export Data */}
          <div>
            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
              Download Your Data
            </h3>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Get a complete copy of all your data in JSON format, including
              your profile, teams, messages, and activity history.
            </p>
            <button
              onClick={handleExportData}
              disabled={isUpdating}
              className="inline-flex items-center rounded-xl border border-blue-400 bg-transparent px-4 py-1.5 text-sm text-blue-400 transition-colors delay-50 hover:enabled:bg-blue-400 hover:enabled:text-white disabled:opacity-50"
            >
              Export Data
            </button>
          </div>

          {/* Delete Account */}
          <div className="border-t pt-6 dark:border-gray-700">
            <h3 className="mb-2 font-medium text-red-600 dark:text-red-400">
              Delete Your Account
            </h3>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={isUpdating}
              className="inline-flex items-center rounded-xl border border-red-600 bg-transparent px-4 py-1.5 text-sm text-red-600 transition-colors delay-50 hover:enabled:bg-red-50 disabled:opacity-50 dark:border-red-400 dark:text-red-400 dark:hover:enabled:bg-red-900/20"
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
