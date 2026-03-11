"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface VerifyUsbcClientProps {
  clerkUserId: string;
  dbUserId: string | null;
  userName: string;
  currentUsbcId: string | null;
  currentNotes: string | null;
  lastVerifiedAt: string | null;
}

export function VerifyUsbcClient({
  clerkUserId,
  dbUserId,
  userName,
  currentUsbcId,
  currentNotes,
  lastVerifiedAt,
}: VerifyUsbcClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [usbcId, setUsbcId] = useState(currentUsbcId || "");
  const [notes, setNotes] = useState(currentNotes || "");

  const handleOpenUsbcLookup = () => {
    // Open USBC member search in new tab
    window.open("https://webapps.bowl.com/USBCFindA/Home/Member", "_blank");

    // If user has entered a USBC ID, copy it to clipboard for easy pasting
    if (usbcId.trim()) {
      navigator.clipboard
        .writeText(usbcId.trim())
        .then(() => {
          toast.success("USBC ID copied to clipboard! Paste it in the USBC search.");
        })
        .catch(() => {
          toast("USBC search opened in new tab", { icon: "🔍" });
        });
    } else {
      toast("USBC search opened in new tab", { icon: "🔍" });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usbcId.trim()) {
      toast.error("USBC ID is required");
      return;
    }

    if (!dbUserId) {
      toast.error("User must complete onboarding first");
      return;
    }

    setLoading(true);

    const toastId = toast.loading("Verifying USBC membership...");

    try {
      const response = await fetch(`/api/admin/users/${clerkUserId}/verify-usbc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usbcId: usbcId.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to verify USBC");
      }

      toast.success("USBC membership verified successfully", { id: toastId });
      router.push(`/admin/users/${clerkUserId}`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Current Status */}
      {lastVerifiedAt && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              This user was last verified on {new Date(lastVerifiedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {!dbUserId && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            ⚠️ This user has not completed onboarding yet. They must create a profile before USBC
            verification can be completed.
          </p>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Verification Details
        </h2>

        <div className="space-y-6">
          {/* User Info */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">User</h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{userName}</p>
          </div>

          {/* USBC ID Input */}
          <div>
            <label
              htmlFor="usbcId"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              USBC ID <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="usbcId"
                value={usbcId}
                onChange={(e) => setUsbcId(e.target.value)}
                placeholder="e.g., 1234-5678"
                required
                disabled={loading || !dbUserId}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800"
              />
              <button
                type="button"
                onClick={handleOpenUsbcLookup}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                title="Open USBC member search in new tab"
              >
                <ExternalLink className="h-4 w-4" />
                Lookup
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter the user's USBC membership ID number, or click "Lookup" to search USBC
              database
            </p>
          </div>

          {/* Verification Notes */}
          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Verification Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the verification process..."
              rows={4}
              disabled={loading || !dbUserId}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional notes for internal reference (e.g., verification method, documents checked)
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-6 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !dbUserId || !usbcId.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <ShieldCheck className="h-4 w-4" />
              {loading ? "Verifying..." : "Verify USBC"}
            </button>
          </div>
        </div>
      </form>

      {/* Instructions */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
          Verification Guidelines
        </h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>Click "Lookup" to search the official USBC member database</li>
          <li>Verify the USBC ID matches official USBC records</li>
          <li>Cross-reference the user's name and bowling statistics</li>
          <li>Document your verification method in the notes field</li>
          <li>The USBC ID will be copied to your clipboard for easy searching</li>
        </ul>
      </div>
    </div>
  );
}
