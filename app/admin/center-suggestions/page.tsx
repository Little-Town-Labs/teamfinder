import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

import { centerEditSuggestions } from "@/drizzle/schema/center-edit-suggestions";
import { requirePermission } from "@/lib/admin/permissions";
import { db } from "@/lib/db";

import CenterSuggestionsClient from "./CenterSuggestionsClient";

export const dynamic = "force-dynamic";

export default async function AdminCenterSuggestionsPage() {
  const { userId: clerkUserId } = await auth();
  await requirePermission(clerkUserId!, "review_center_suggestions");

  // Fetch pending suggestions with related data
  const suggestions = await db.query.centerEditSuggestions.findMany({
    where: eq(centerEditSuggestions.status, "pending"),
    with: {
      bowlingCenter: {
        columns: {
          id: true,
          name: true,
          city: true,
          state: true,
        },
      },
      suggestor: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      reviewer: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [desc(centerEditSuggestions.createdAt)],
  });

  // Transform to match expected format
  const initialSuggestions = suggestions.map((s) => ({
    ...s,
    bowlingCenter: s.bowlingCenter,
    suggestor: {
      id: s.suggestor.id,
      name: [s.suggestor.firstName, s.suggestor.lastName].filter(Boolean).join(" "),
      email: s.suggestor.email,
    },
    reviewer: s.reviewer
      ? {
          id: s.reviewer.id,
          name: [s.reviewer.firstName, s.reviewer.lastName].filter(Boolean).join(" "),
        }
      : null,
  }));

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
