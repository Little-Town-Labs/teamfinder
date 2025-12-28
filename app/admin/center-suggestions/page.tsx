import { auth } from "@clerk/nextjs/server";
import type { CenterEditSuggestion } from "@/drizzle/schema";
import { requirePermission } from "@/lib/admin/permissions";
import CenterSuggestionsClient from "./CenterSuggestionsClient";

export const dynamic = "force-dynamic";

export default async function AdminCenterSuggestionsPage() {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "review_center_suggestions");

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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Center Edit Suggestions
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Review and approve or reject user-submitted edits to bowling center information
        </p>
      </div>

      <CenterSuggestionsClient initialSuggestions={initialSuggestions} />
    </div>
  );
}
