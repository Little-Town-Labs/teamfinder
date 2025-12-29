import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { users } from "@/drizzle/schema";
import { db } from "@/lib/db";

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
  if (user?.playerProfile && !Array.isArray(user.playerProfile) && user.playerProfile.profileComplete) {
    redirect("/dashboard");
  }

  return (
    <>
      <Header />
      <section className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-12 sm:py-20 lg:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl dark:from-white dark:to-gray-300">
              Welcome to TeamFinder!
            </h1>
            <p className="mb-8 text-base font-medium text-gray-600 md:text-lg lg:text-xl dark:text-gray-400">
              Let&apos;s set up your bowling profile to help you find the perfect team
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-8 shadow-lg dark:from-gray-900 dark:to-gray-800/50">
              <OnboardingForm userId={userId} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
