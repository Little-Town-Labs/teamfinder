import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CenterForm } from "../../CenterForm";
import { bowlingCenters } from "@/drizzle/schema/bowling-centers";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

interface EditCenterPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCenterPage({ params }: EditCenterPageProps) {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "edit_centers");

  const { id: centerId } = await params;

  // Fetch center data
  const [centerData] = await db
    .select()
    .from(bowlingCenters)
    .where(eq(bowlingCenters.id, centerId))
    .limit(1);

  if (!centerData) {
    redirect("/admin/centers");
  }

  // Transform database fields to CenterForm interface
  const formData = {
    id: centerData.id,
    name: centerData.name,
    address: centerData.address,
    city: centerData.city,
    state: centerData.state,
    zipCode: centerData.zipCode,
    phoneNumber: centerData.phone,
    website: centerData.website,
    laneCount: centerData.numberOfLanes ? parseInt(centerData.numberOfLanes, 10) : null,
    isVerified: centerData.verified,
  };

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Bowling Center</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Update center information</p>
      </div>

      {/* Form */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <CenterForm mode="edit" adminClerkUserId={clerkUserId!} initialData={formData} />
      </div>
    </div>
  );
}
