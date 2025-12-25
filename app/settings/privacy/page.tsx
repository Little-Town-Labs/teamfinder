import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { users } from "@/drizzle/schema";
import { db } from "@/lib/db";

import { PrivacySettingsClient } from "./PrivacySettingsClient";

export const metadata = {
  title: "Privacy Settings - TeamFinder",
  description: "Manage your privacy settings and data preferences",
};

export default async function PrivacySettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (!user) {
    redirect("/onboarding");
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Privacy Settings
        </h1>

        <PrivacySettingsClient
          marketingOptIn={user.marketingEmailsOptIn || false}
          cookieConsentGiven={user.cookieConsentGiven || false}
          privacyPolicyVersion={user.privacyPolicyVersion || "Not accepted"}
          termsVersion={user.termsVersion || "Not accepted"}
          privacyPolicyAcceptedAt={user.privacyPolicyAcceptedAt?.toISOString() || null}
          termsAcceptedAt={user.termsAcceptedAt?.toISOString() || null}
        />
      </div>

      <Footer />
    </>
  );
}
