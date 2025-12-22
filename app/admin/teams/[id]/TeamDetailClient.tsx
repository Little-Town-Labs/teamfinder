"use client";

import { Flag, Shield, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TeamData {
  id: string;
  name: string;
  description: string | null;
  teamType: string;
  genderType: string;
  competitionLevel: string;
  isActive: boolean;
  flaggedForReview: boolean;
  flaggedReason: string | null;
  flaggedAt: Date | null;
  moderationNotes: string | null;
  moderatedAt: Date | null;
  currentRosterSize: number;
  maxRosterSize: number;
  lookingForPlayers: boolean;
  teamAverage: number | null;
  currentStanding: string | null;
  seasonsActive: number | null;
  achievements: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  captainId: string | null;
  captainFirstName: string | null;
  captainLastName: string | null;
  captainEmail: string | null;
  captainClerkUserId: string | null;
}

interface TeamDetailClientProps {
  teamData: TeamData;
  adminClerkUserId: string;
}

export function TeamDetailClient({ teamData, adminClerkUserId }: TeamDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captainName =
    [teamData.captainFirstName, teamData.captainLastName].filter(Boolean).join(" ") ||
    teamData.captainEmail ||
    "Unknown";

  const handleFlag = async () => {
    const reason = prompt("Reason for flagging this team:");
    if (!reason) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/teams/${teamData.id}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to flag team");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUnflag = async () => {
    const reason = prompt("Reason for unflagging this team:");
    if (!reason) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/teams/${teamData.id}/unflag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to unflag team");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmText = `Type "${teamData.name}" to confirm deletion:`;
    const confirmation = prompt(confirmText);
    if (confirmation !== teamData.name) {
      alert("Team name does not match. Deletion cancelled.");
      return;
    }

    const reason = prompt("Reason for deleting this team:");
    if (!reason) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/teams/${teamData.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to delete team");
      }

      router.push("/admin/teams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/teams"
          className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← Back to Teams
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Shield className="h-16 w-16 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{teamData.name}</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {teamData.teamType} · {teamData.competitionLevel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Status Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</div>
          <div className="mt-2">
            {teamData.isActive ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                Inactive
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Moderation</div>
          <div className="mt-2">
            {teamData.flaggedForReview ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                <Flag className="h-4 w-4" />
                Flagged
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                Clear
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Roster</div>
          <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {teamData.currentRosterSize} / {teamData.maxRosterSize}
          </div>
          {teamData.lookingForPlayers && (
            <div className="mt-1 text-sm text-green-600 dark:text-green-400">Recruiting</div>
          )}
        </div>
      </div>

      {/* Flagged Alert */}
      {teamData.flaggedForReview && (
        <div className="mb-8 rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-red-900 dark:text-red-200">
            <Flag className="h-5 w-5" />
            Flagged for Review
          </h3>
          {teamData.flaggedReason && (
            <p className="mt-2 text-sm text-red-800 dark:text-red-300">
              <span className="font-medium">Reason:</span> {teamData.flaggedReason}
            </p>
          )}
          {teamData.flaggedAt && (
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">
              Flagged on {teamData.flaggedAt.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Team Details */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Team Details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Team ID</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{teamData.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Captain</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {captainName}
              {teamData.captainClerkUserId && (
                <Link
                  href={`/admin/users/${teamData.captainClerkUserId}`}
                  className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View →
                </Link>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Type</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{teamData.teamType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender Type</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{teamData.genderType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Competition Level</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{teamData.competitionLevel}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Average</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {teamData.teamAverage ?? "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Seasons Active</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {teamData.seasonsActive ?? 0}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {teamData.createdAt.toLocaleDateString()}
            </dd>
          </div>
          {teamData.description && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{teamData.description}</dd>
            </div>
          )}
          {teamData.moderationNotes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Moderation Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{teamData.moderationNotes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Admin Actions */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Admin Actions</h2>
        <div className="flex flex-wrap gap-3">
          {!teamData.flaggedForReview ? (
            <button
              onClick={handleFlag}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 dark:bg-orange-700 dark:hover:bg-orange-800"
            >
              <Flag className="h-4 w-4" />
              Flag for Review
            </button>
          ) : (
            <button
              onClick={handleUnflag}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <Flag className="h-4 w-4" />
              Unflag Team
            </button>
          )}

          <Link
            href={`/teams/${teamData.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <Shield className="h-4 w-4" />
            View Public Page
          </Link>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
          >
            <Trash2 className="h-4 w-4" />
            Delete Team
          </button>
        </div>
      </div>
    </div>
  );
}
