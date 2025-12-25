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
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
              Welcome to TeamFinder!
            </h1>
            <p className="mb-8 font-light text-gray-500 md:text-lg lg:text-xl dark:text-gray-400">
              Let&apos;s set up your bowling profile to help you find the perfect team
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-900">
              <OnboardingForm userId={userId} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
