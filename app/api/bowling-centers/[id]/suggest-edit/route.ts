import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { bowlingCenters, centerEditSuggestions, users } from "@/drizzle/schema";
import { logCenterEditSuggested } from "@/lib/activity-logger";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Validation schema for suggesting edits
const suggestEditSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  zipCode: z.string().min(1).optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  numberOfLanes: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: centerId } = await params;

    // Check authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the bowling center
    const center = await db.query.bowlingCenters.findFirst({
      where: eq(bowlingCenters.id, centerId),
    });

    if (!center) {
      return NextResponse.json({ error: "Bowling center not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { notes, ...suggestedChanges } = suggestEditSchema.parse(body);

    // Filter out empty values and unchanged fields
    const filteredChanges: Record<string, string | string[] | undefined> = {};
    Object.entries(suggestedChanges).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        // Only include if different from current value
        const currentValue = center[key as keyof typeof center];
        if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
          filteredChanges[key] = value;
        }
      }
    });

    // Check if there are any actual changes
    if (Object.keys(filteredChanges).length === 0) {
      return NextResponse.json({ error: "No changes detected" }, { status: 400 });
    }

    // Create suggestion
    const [suggestion] = await db
      .insert(centerEditSuggestions)
      .values({
        bowlingCenterId: centerId,
        suggestedBy: user.id,
        suggestedChanges: filteredChanges,
        notes: notes || null,
        status: "pending",
      })
      .returning();

    // Log activity
    await logCenterEditSuggested({
      userId: user.id,
      centerId: centerId,
      centerName: center.name,
    });

    return NextResponse.json(suggestion, { status: 201 });
  } catch (error) {
    console.error("Error creating edit suggestion:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create edit suggestion" }, { status: 500 });
  }
}
