"use client";

import { Ban, Lock, ShieldCheck, Unlock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UserData {
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  banned: boolean;
  locked: boolean;
  createdAt: Date;
  lastSignInAt: Date | null;
  dbUserId: string | null;
  usbcVerificationNotes: string | null;
  lastVerifiedAt: Date | null;
}

interface UserDetailClientProps {
  userData: UserData;
  adminClerkUserId: string;
}

export function UserDetailClient({ userData, adminClerkUserId: _adminClerkUserId }: UserDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(" ") || "No name";

  const handleAction = async (action: "ban" | "unban" | "lock" | "unlock", reason?: string) => {
    setLoading(true);
    setError(null);

    const toastId = toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}ing user...`);

    try {
      const response = await fetch(`/api/admin/users/${userData.clerkUserId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || `${action} via admin panel` }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || `Failed to ${action} user`);
      }

      toast.success(`User ${action}ned successfully`, { id: toastId });
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message, { id: toastId });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← Back to Users
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={userData.imageUrl}
              alt={fullName}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{userData.email}</p>
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
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Status</div>
          <div className="mt-2">
            {userData.banned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                <Ban className="h-4 w-4" />
                Banned
              </span>
            )}
            {userData.locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                <Lock className="h-4 w-4" />
                Locked
              </span>
            )}
            {!userData.banned && !userData.locked && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">USBC Verification</div>
          <div className="mt-2">
            {userData.lastVerifiedAt ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                <ShieldCheck className="h-4 w-4" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                Not Verified
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</div>
          <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {userData.createdAt.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">User Details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Clerk User ID</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{userData.clerkUserId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Database User ID</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{userData.dbUserId || "Not synced"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{userData.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Sign In</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData.lastSignInAt ? userData.lastSignInAt.toLocaleString() : "Never"}
            </dd>
          </div>
          {userData.usbcVerificationNotes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">USBC Verification Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{userData.usbcVerificationNotes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Actions */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Admin Actions</h2>
        <div className="flex flex-wrap gap-3">
          {!userData.banned && (
            <button
              onClick={() => {
                const reason = prompt("Reason for banning this user:");
                if (reason) handleAction("ban", reason);
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
            >
              <Ban className="h-4 w-4" />
              Ban User
            </button>
          )}

          {userData.banned && (
            <button
              onClick={() => {
                const reason = prompt("Reason for unbanning this user:");
                if (reason) handleAction("unban", reason);
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <Unlock className="h-4 w-4" />
              Unban User
            </button>
          )}

          {!userData.locked && !userData.banned && (
            <button
              onClick={() => {
                const reason = prompt("Reason for locking this user:");
                if (reason) handleAction("lock", reason);
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 dark:bg-orange-700 dark:hover:bg-orange-800"
            >
              <Lock className="h-4 w-4" />
              Lock User
            </button>
          )}

          {userData.locked && (
            <button
              onClick={() => {
                const reason = prompt("Reason for unlocking this user:");
                if (reason) handleAction("unlock", reason);
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <Unlock className="h-4 w-4" />
              Unlock User
            </button>
          )}

          <Link
            href={`/admin/users/${userData.clerkUserId}/verify-usbc`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <ShieldCheck className="h-4 w-4" />
            Verify USBC
          </Link>
        </div>
      </div>
    </div>
  );
}
