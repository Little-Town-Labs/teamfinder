import { auth, clerkClient } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { centerEditSuggestions } from "@/drizzle/schema";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user metadata from Clerk to check admin role
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    const isAdmin = clerkUser.publicMetadata?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Get filter from query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending";

    // Query suggestions with related data
    const suggestions = await db.query.centerEditSuggestions.findMany({
      where: eq(centerEditSuggestions.status, status as "pending" | "approved" | "rejected"),
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
            name: true,
            email: true,
          },
        },
        reviewer: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [desc(centerEditSuggestions.createdAt)],
      limit: 50,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching center suggestions:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}
