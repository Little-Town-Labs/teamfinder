import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Header } from "@/components/Header/Header";
import type { CenterEditSuggestion } from "@/drizzle/schema";

import CenterSuggestionsClient from "./CenterSuggestionsClient";

export const dynamic = "force-dynamic";

export default async function AdminCenterSuggestionsPage() {
  // Check authentication
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  // Check admin role
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);
  const isAdmin = clerkUser.publicMetadata?.role === "admin";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Fetch initial suggestions (pending)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/admin/center-suggestions?status=pending`, {
    cache: "no-store",
    headers: {
      Cookie: `__session=${clerkUserId}`, // Pass auth
    },
  });

  type SuggestionWithRelations = CenterEditSuggestion & {
    bowlingCenter: { id: string; name: string; city: string; state: string };
    suggestor: { id: string; name: string; email: string };
    reviewer: { id: string; name: string } | null;
  };

  let initialSuggestions: SuggestionWithRelations[] = [];
  if (response.ok) {
    const data = (await response.json()) as { suggestions: SuggestionWithRelations[] };
    initialSuggestions = data.suggestions;
  }

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
              Review Center Edit Suggestions
            </h1>
            <p className="mb-8 font-light text-gray-500 md:text-lg lg:text-xl dark:text-gray-400">
              Review and approve or reject user-submitted edits to bowling center information
            </p>
          </div>
        </div>
      </section>

      {/* Suggestions Section */}
      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <CenterSuggestionsClient initialSuggestions={initialSuggestions} />
        </div>
      </section>
    </>
  );
}
