import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { UserDetailClient } from "./UserDetailClient";
import { users } from "@/drizzle/schema/users";
import { getClerkUser } from "@/lib/admin/clerk-integration";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId: adminClerkUserId } = await auth();
  await requirePermission(adminClerkUserId!, "view_users");

  const { id: clerkUserId } = await params;

  // Fetch user from Clerk
  let clerkUser;
  try {
    clerkUser = await getClerkUser(clerkUserId);
  } catch (error) {
    notFound();
  }

  // Fetch user from database
  const [dbUser] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);

  // Combine data
  const userData = {
    // Clerk data
    clerkUserId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || "No email",
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    banned: clerkUser.banned,
    locked: clerkUser.locked,
    createdAt: new Date(clerkUser.createdAt),
    lastSignInAt: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : null,

    // Database data
    dbUserId: dbUser?.id || null,
    usbcVerificationNotes: dbUser?.usbcVerificationNotes || null,
    lastVerifiedAt: dbUser?.lastVerifiedAt || null,
  };

  return <UserDetailClient userData={userData} adminClerkUserId={adminClerkUserId!} />;
}
