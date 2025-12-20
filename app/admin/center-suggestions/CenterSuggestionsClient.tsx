"use client";

import Link from "next/link";
import { useState } from "react";

import type { CenterEditSuggestion } from "@/drizzle/schema";

import ReviewSuggestionModal from "./ReviewSuggestionModal";

interface CenterSuggestionsClientProps {
  initialSuggestions: Array<
    CenterEditSuggestion & {
      bowlingCenter: { id: string; name: string; city: string; state: string };
      suggestor: { id: string; name: string; email: string };
      reviewer: { id: string; name: string } | null;
    }
  >;
}

export default function CenterSuggestionsClient({ initialSuggestions }: CenterSuggestionsClientProps) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [selectedSuggestion, setSelectedSuggestion] = useState<(typeof suggestions)[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (status: "pending" | "approved" | "rejected") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/center-suggestions?status=${status}`);
      if (response.ok) {
        const data = (await response.json()) as { suggestions: typeof suggestions };
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status: "pending" | "approved" | "rejected") => {
    setStatusFilter(status);
    fetchSuggestions(status);
  };

  const handleReviewComplete = () => {
    setSelectedSuggestion(null);
    fetchSuggestions(statusFilter);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusFilterChange("pending")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Pending
            {statusFilter === "pending" && ` (${suggestions.length})`}
          </button>
          <button
            onClick={() => handleStatusFilterChange("approved")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "approved"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Approved
            {statusFilter === "approved" && ` (${suggestions.length})`}
          </button>
          <button
            onClick={() => handleStatusFilterChange("rejected")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "rejected"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Rejected
            {statusFilter === "rejected" && ` (${suggestions.length})`}
          </button>
        </div>

        {/* Suggestions List */}
        {loading ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md dark:bg-gray-900">
            <div className="text-gray-600 dark:text-gray-400">Loading...</div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md dark:bg-gray-900">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              No {statusFilter} suggestions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === "pending"
                ? "There are no pending suggestions to review"
                : `There are no ${statusFilter} suggestions`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <Link
                        href={`/bowling-centers/${suggestion.bowlingCenterId}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {suggestion.bowlingCenter.name}
                      </Link>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {suggestion.bowlingCenter.city}, {suggestion.bowlingCenter.state}
                      </span>
                    </div>

                    <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Suggested by:</span> {suggestion.suggestor.name} (
                      {suggestion.suggestor.email})
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Submitted:</span>{" "}
                      {new Date(suggestion.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {suggestion.notes && (
                      <div className="mt-3 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Notes:</span> {suggestion.notes}
                        </p>
                      </div>
                    )}

                    {suggestion.status !== "pending" && suggestion.reviewedAt && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Reviewed:</span>{" "}
                        {new Date(suggestion.reviewedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        by {suggestion.reviewer?.name}
                        {suggestion.reviewNotes && (
                          <div className="mt-2 rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                            <span className="font-medium">Review notes:</span> {suggestion.reviewNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {suggestion.status === "pending" && (
                    <button
                      onClick={() => setSelectedSuggestion(suggestion)}
                      className="ml-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSuggestion && (
        <ReviewSuggestionModal
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </>
  );
}
