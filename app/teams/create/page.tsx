import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { Header } from "@/components/Header/Header";
import { playerProfiles, users } from "@/drizzle/schema";
import { db } from "@/lib/db";

import CreateTeamForm from "./create-team-form";

export default async function CreateTeamPage() {
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
  const profile = await db.query.playerProfiles.findFirst({
    where: eq(playerProfiles.userId, user.id),
  });

  // If profile not complete, redirect to onboarding
  if (!profile || !profile.profileComplete) {
    redirect("/onboarding");
  }

  return (
    <>
      <Header />
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
              Create a Team
            </h1>
            <p className="mb-8 font-light text-gray-500 md:text-lg lg:text-xl dark:text-gray-400">
              Start building your bowling team and recruit talented players
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-900">
              <CreateTeamForm userId={user.id} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
