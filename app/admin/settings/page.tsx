import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { Shield } from "lucide-react";

import { adminRoles } from "@/drizzle/schema/admin-roles";
import { users } from "@/drizzle/schema/users";
import { getClerkUser } from "@/lib/admin/clerk-integration";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";
import { AdminSettingsClient } from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "manage_admins");

  // Fetch all admin roles with user info
  const adminRolesData = await db
    .select({
      id: adminRoles.id,
      userId: adminRoles.userId,
      role: adminRoles.role,
      assignedAt: adminRoles.assignedAt,
      notes: adminRoles.notes,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userEmail: users.email,
      userClerkUserId: users.clerkUserId,
    })
    .from(adminRoles)
    .leftJoin(users, eq(adminRoles.userId, users.id))
    .orderBy(desc(adminRoles.assignedAt));

  // Enrich with Clerk data
  const enrichedAdmins = await Promise.all(
    adminRolesData.map(async (admin) => {
      if (!admin.userClerkUserId) return admin;

      try {
        const clerkUser = await getClerkUser(admin.userClerkUserId);
        return {
          ...admin,
          clerkEmail: clerkUser.emailAddresses[0]?.emailAddress,
          clerkImageUrl: clerkUser.imageUrl,
        };
      } catch {
        return admin;
      }
    }),
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage admin users and their permissions
            </p>
          </div>
          <Shield className="h-16 w-16 text-blue-600" />
        </div>
      </div>

      {/* Admin List */}
      <AdminSettingsClient admins={enrichedAdmins} currentAdminClerkUserId={clerkUserId!} />
    </div>
  );
}
