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
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
        <div className="relative mx-auto max-w-(--breakpoint-xl) px-4 py-12 sm:py-20 lg:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-block rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-semibold text-white">🎳 Team Builder</span>
            </div>
            <h1 className="mb-6 text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
              Create a Team
            </h1>
            <p className="mx-auto max-w-2xl text-xl font-medium text-white/90 drop-shadow-md md:text-2xl">
              Start building your bowling team and recruit talented players
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-[2px] shadow-2xl">
              <div className="rounded-3xl bg-white p-8 dark:bg-gray-900">
                <CreateTeamForm userId={user.id} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
