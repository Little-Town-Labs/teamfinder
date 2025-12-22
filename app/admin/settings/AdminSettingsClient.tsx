"use client";

import { Shield, Trash2, UserPlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Admin {
  id: string;
  userId: string | null;
  role: string;
  assignedAt: Date;
  notes: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userEmail: string | null;
  userClerkUserId: string | null;
  clerkEmail?: string;
  clerkImageUrl?: string;
}

interface AdminSettingsClientProps {
  admins: Admin[];
  currentAdminClerkUserId: string;
}

export function AdminSettingsClient({ admins, currentAdminClerkUserId }: AdminSettingsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssignRole = async () => {
    const email = prompt("Enter the email address of the user to make admin:");
    if (!email) return;

    const role = prompt(
      "Select role:\n1. super_admin (full access)\n2. moderator (user/team management)\n3. content_reviewer (review reports)\n4. support (read-only)\n\nEnter role name:",
    );
    if (!role || !["super_admin", "moderator", "content_reviewer", "support"].includes(role)) {
      alert("Invalid role selected");
      return;
    }

    const notes = prompt("Optional notes about this admin assignment:");

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/settings/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, notes }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to assign admin role");
      }

      router.refresh();
      alert("Admin role assigned successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeRole = async (adminId: string, adminName: string) => {
    const confirmation = prompt(
      `Type "${adminName}" to confirm revoking admin access:`,
    );
    if (confirmation !== adminName) {
      alert("Name does not match. Revocation cancelled.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/settings/admins/${adminId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to revoke admin role");
      }

      router.refresh();
      alert("Admin role revoked successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "moderator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "content_reviewer":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "support":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div>
      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Add Admin Button */}
      <div className="mb-6">
        <button
          onClick={handleAssignRole}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <UserPlus className="h-4 w-4" />
          Assign Admin Role
        </button>
      </div>

      {/* Admins List */}
      {admins.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No admin users
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Get started by assigning your first admin role.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {admins.map((admin) => {
            const name =
              [admin.userFirstName, admin.userLastName].filter(Boolean).join(" ") ||
              admin.clerkEmail ||
              admin.userEmail ||
              "Unknown";

            const isCurrentUser = admin.userClerkUserId === currentAdminClerkUserId;

            return (
              <div
                key={admin.id}
                className="rounded-lg bg-white p-6 shadow hover:shadow-md dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {admin.clerkImageUrl && (
                      <Image
                        src={admin.clerkImageUrl}
                        alt={name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {name}
                          {isCurrentUser && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              (You)
                            </span>
                          )}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(admin.role)}`}
                        >
                          {formatRole(admin.role)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {admin.clerkEmail || admin.userEmail}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Assigned on {admin.assignedAt.toLocaleDateString()}
                      </p>
                      {admin.notes && (
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Notes:</span> {admin.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isCurrentUser && (
                    <button
                      onClick={() => handleRevokeRole(admin.id, name)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
