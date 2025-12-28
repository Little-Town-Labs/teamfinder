import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { users } from "@/drizzle/schema";
import { getClerkUser } from "@/lib/admin/clerk-integration";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";
import { VerifyUsbcClient } from "./VerifyUsbcClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VerifyUsbcPage({ params }: PageProps) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  // Check permission
  await requirePermission(clerkUserId, "verify_usbc");

  const { id } = await params;

  // Get Clerk user data
  const clerkUser = await getClerkUser(id);

  // Get database user
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, id),
    with: {
      playerProfile: true,
    },
  });

  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "No name";

  return (
    <div>
      <div className="mb-8">
        <a
          href={`/admin/users/${id}`}
          className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← Back to User Details
        </a>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verify USBC Membership</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Verify {fullName}'s USBC membership details
        </p>
      </div>

      <VerifyUsbcClient
        clerkUserId={id}
        dbUserId={dbUser?.id || null}
        userName={fullName}
        currentUsbcId={dbUser?.playerProfile && !Array.isArray(dbUser.playerProfile) ? dbUser.playerProfile.usbcMemberId : null}
        currentNotes={dbUser?.usbcVerificationNotes || null}
        lastVerifiedAt={dbUser?.lastVerifiedAt?.toISOString() || null}
      />
    </div>
  );
}
