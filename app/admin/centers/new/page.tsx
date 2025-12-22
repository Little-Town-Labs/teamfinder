import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { requirePermission } from "@/lib/admin/permissions";
import { CenterForm } from "../CenterForm";

export default async function NewCenterPage() {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "create_centers");

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/centers"
          className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← Back to Centers
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Bowling Center</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new bowling center in the directory
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <CenterForm mode="create" adminClerkUserId={clerkUserId!} />
      </div>
    </div>
  );
}
