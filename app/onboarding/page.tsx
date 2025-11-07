import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, playerProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user already has a complete profile
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
    with: {
      playerProfile: true,
    },
  });

  // If profile is complete, redirect to dashboard
  if (user?.playerProfile?.profileComplete) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to TeamFinder!</h1>
          <p className="mt-2 text-lg text-gray-600">
            Let's set up your bowling profile to help you find the perfect team
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          <OnboardingForm userId={userId} />
        </div>
      </div>
    </div>
  );
}
