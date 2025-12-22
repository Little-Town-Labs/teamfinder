import { auth } from "@clerk/nextjs/server";

import { requirePermission } from "@/lib/admin/permissions";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

export default async function AnalyticsPage() {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "view_analytics");

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View insights and trends across the platform
        </p>
      </div>

      {/* Dashboard */}
      <AnalyticsDashboard />
    </div>
  );
}
