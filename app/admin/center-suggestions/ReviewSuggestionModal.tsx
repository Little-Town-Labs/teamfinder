"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { CenterEditSuggestion } from "@/drizzle/schema";

interface ReviewSuggestionModalProps {
  suggestion: CenterEditSuggestion & {
    bowlingCenter: { id: string; name: string; city: string; state: string };
    suggestor: { id: string; name: string; email: string };
  };
  onClose: () => void;
  onReviewComplete: () => void;
}

export default function ReviewSuggestionModal({
  suggestion,
  onClose,
  onReviewComplete,
}: ReviewSuggestionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleSubmit = async (reviewAction: "approve" | "reject") => {
    setIsSubmitting(true);
    setAction(reviewAction);

    try {
      const response = await fetch(`/api/admin/center-suggestions/${suggestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reviewAction,
          reviewNotes: reviewNotes || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error: string };
        throw new Error(data.error || "Failed to review suggestion");
      }

      toast.success(
        reviewAction === "approve"
          ? "Suggestion approved and changes applied!"
          : "Suggestion rejected",
      );
      onReviewComplete();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
      setAction(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedChanges = suggestion.suggestedChanges as Record<string, string | string[]>;

  // Fetch current center data to compare
  const [currentData, setCurrentData] = useState<Record<string, string | string[] | null>>({});
  const [loadingData, setLoadingData] = useState(true);

  useState(() => {
    const fetchCenterData = async () => {
      try {
        const response = await fetch(`/api/bowling-centers/${suggestion.bowlingCenterId}`);
        if (response.ok) {
          const data = (await response.json()) as { center: Record<string, string | string[] | null> };
          setCurrentData(data.center);
        }
      } catch (error) {
        console.error("Error fetching center data:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchCenterData();
  });

  const formatValue = (value: string | string[] | null | undefined): string => {
    if (value === null || value === undefined || value === "") return "(empty)";
    if (Array.isArray(value)) return value.join(", ");
    return value;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Review Edit Suggestion
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium">Center:</span> {suggestion.bowlingCenter.name}
            </p>
            <p>
              <span className="font-medium">Suggested by:</span> {suggestion.suggestor.name}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Notes from suggestor */}
          {suggestion.notes && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h3 className="mb-2 font-medium text-blue-900 dark:text-blue-200">
                Suggestor's Notes:
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">{suggestion.notes}</p>
            </div>
          )}

          {/* Changes Comparison */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Proposed Changes
            </h3>

            {loadingData ? (
              <div className="text-center text-gray-600 dark:text-gray-400">Loading current data...</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(suggestedChanges).map(([field, suggestedValue]) => (
                  <div
                    key={field}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <h4 className="mb-2 font-medium capitalize text-gray-900 dark:text-white">
                      {field.replace(/([A-Z])/g, " $1").trim()}
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                          Current Value
                        </div>
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-900 dark:bg-red-900/20 dark:text-red-200">
                          {formatValue(currentData[field])}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                          Suggested Value
                        </div>
                        <div className="rounded-md bg-green-50 p-3 text-sm text-green-900 dark:bg-green-900/20 dark:text-green-200">
                          {formatValue(suggestedValue)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Notes */}
          <div className="mb-6">
            <label
              htmlFor="reviewNotes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Review Notes (optional)
            </label>
            <textarea
              id="reviewNotes"
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any notes about your decision..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("reject")}
              disabled={isSubmitting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting && action === "reject" ? "Rejecting..." : "Reject"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("approve")}
              disabled={isSubmitting}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting && action === "approve" ? "Approving..." : "Approve & Apply Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
