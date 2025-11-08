import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { type PlayerProfile, playerProfiles, users } from "@/drizzle/schema";
import { db } from "@/lib/db";

import EditProfileForm from "./edit-profile-form";

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (!user) {
    redirect("/sign-in");
  }

  // Get player profile
  const profile = (await db.query.playerProfiles.findFirst({
    where: eq(playerProfiles.userId, user.id),
  })) as PlayerProfile | undefined;

  // If no profile exists, redirect to onboarding
  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <EditProfileForm profile={profile} userId={user.id} />
        </div>
      </main>
    </div>
  );
}
