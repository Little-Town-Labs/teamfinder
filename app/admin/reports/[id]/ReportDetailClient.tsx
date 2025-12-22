"use client";

import { AlertTriangle, CheckCircle, ExternalLink, Flag, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ReportData {
  id: string;
  reportType: string;
  reason: string;
  description: string;
  status: string;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  actionTaken: string | null;
  reporterId: string | null;
  reporterFirstName: string | null;
  reporterLastName: string | null;
  reporterEmail: string | null;
  reporterClerkUserId: string | null;
}

interface ReportedContent {
  type: string;
  id: string;
  description: string;
  link?: string;
}

interface ReportDetailClientProps {
  reportData: ReportData;
  reportedContent: ReportedContent | null;
  adminClerkUserId: string;
}

export function ReportDetailClient({
  reportData,
  reportedContent,
  adminClerkUserId: _adminClerkUserId,
}: ReportDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reporterName =
    [reportData.reporterFirstName, reportData.reporterLastName].filter(Boolean).join(" ") ||
    reportData.reporterEmail ||
    "Unknown";

  const formatReportType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatReason = (reason: string) => {
    return reason
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleUpdateStatus = async (newStatus: string) => {
    const notes = prompt(`Update status to "${newStatus}". Add review notes (optional):`);
    if (notes === null) return; // User cancelled

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports/${reportData.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reviewNotes: notes }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to update status");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    const notes = prompt("Resolution notes:");
    if (!notes) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports/${reportData.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNotes: notes }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to resolve report");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    const notes = prompt("Reason for dismissing this report:");
    if (!notes) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports/${reportData.id}/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNotes: notes }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to dismiss report");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    investigating: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    dismissed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/reports"
          className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← Back to Reports
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report Details</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Review and take action on this report
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
              statusColors[reportData.status as keyof typeof statusColors]
            }`}
          >
            {reportData.status.charAt(0).toUpperCase() + reportData.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Report Information */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Report Information
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Report Type</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formatReportType(reportData.reportType)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formatReason(reportData.reason)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Reported By</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {reporterName}
              {reportData.reporterClerkUserId && (
                <Link
                  href={`/admin/users/${reportData.reporterClerkUserId}`}
                  className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View →
                </Link>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {reportData.createdAt.toLocaleString()}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{reportData.description}</dd>
          </div>
        </dl>
      </div>

      {/* Reported Content */}
      {reportedContent && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Reported Content
          </h2>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {reportedContent.type}
              </div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">
                {reportedContent.description}
              </div>
            </div>
            {reportedContent.link && (
              <Link
                href={reportedContent.link}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View Content <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Review Information */}
      {(reportData.reviewedAt || reportData.reviewNotes || reportData.actionTaken) && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Review Information
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {reportData.reviewedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Reviewed At
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {reportData.reviewedAt.toLocaleString()}
                </dd>
              </div>
            )}
            {reportData.actionTaken && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Action Taken
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {reportData.actionTaken}
                </dd>
              </div>
            )}
            {reportData.reviewNotes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Review Notes
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {reportData.reviewNotes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Actions */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {reportData.status === "pending" && (
            <>
              <button
                onClick={() => handleUpdateStatus("investigating")}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                <AlertTriangle className="h-4 w-4" />
                Mark as Investigating
              </button>
              <button
                onClick={handleResolve}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
              >
                <CheckCircle className="h-4 w-4" />
                Resolve Report
              </button>
              <button
                onClick={handleDismiss}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-800"
              >
                <XCircle className="h-4 w-4" />
                Dismiss Report
              </button>
            </>
          )}

          {reportData.status === "investigating" && (
            <>
              <button
                onClick={handleResolve}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
              >
                <CheckCircle className="h-4 w-4" />
                Resolve Report
              </button>
              <button
                onClick={handleDismiss}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-800"
              >
                <XCircle className="h-4 w-4" />
                Dismiss Report
              </button>
              <button
                onClick={() => handleUpdateStatus("pending")}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <Flag className="h-4 w-4" />
                Return to Pending
              </button>
            </>
          )}

          {(reportData.status === "resolved" || reportData.status === "dismissed") && (
            <button
              onClick={() => handleUpdateStatus("pending")}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <Flag className="h-4 w-4" />
              Reopen Report
            </button>
          )}

          {reportedContent?.link && (
            <Link
              href={reportedContent.link}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <ExternalLink className="h-4 w-4" />
              View {reportedContent.type}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
