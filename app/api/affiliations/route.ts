import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { affiliations, type NewAffiliation, users } from "@/drizzle/schema";
import { db } from "@/lib/db";

const affiliationSchema = z.object({
  type: z.enum(["college", "company", "organization", "other"]),
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
  startYear: z.string().optional(),
  endYear: z.string().optional(),
});

// GET - Get all affiliations for the current user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all affiliations for the user
    const userAffiliations = await db.query.affiliations.findMany({
      where: eq(affiliations.userId, user.id),
      orderBy: (affiliations, { desc }) => [desc(affiliations.createdAt)],
    });

    return NextResponse.json({ affiliations: userAffiliations }, { status: 200 });
  } catch (error) {
    console.error("Get affiliations error:", error);
    return NextResponse.json(
      { error: "Failed to get affiliations" },
      { status: 500 },
    );
  }
}

// POST - Create a new affiliation
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await request.json();
    const body = affiliationSchema.parse(rawBody);

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create affiliation
    const affiliationData: NewAffiliation = {
      userId: user.id,
      type: body.type,
      name: body.name,
      role: body.role || null,
      startYear: body.startYear || null,
      endYear: body.endYear || null,
    };

    const [affiliation] = await db
      .insert(affiliations)
      .values(affiliationData)
      .returning();

    return NextResponse.json({ affiliation }, { status: 201 });
  } catch (error) {
    console.error("Create affiliation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid affiliation data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create affiliation" },
      { status: 500 },
    );
  }
}

// DELETE - Delete an affiliation
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const affiliationId = searchParams.get("id");

    if (!affiliationId) {
      return NextResponse.json(
        { error: "Affiliation ID is required" },
        { status: 400 },
      );
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete affiliation (only if it belongs to the user)
    await db
      .delete(affiliations)
      .where(
        and(
          eq(affiliations.id, affiliationId),
          eq(affiliations.userId, user.id),
        ),
      );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete affiliation error:", error);
    return NextResponse.json(
      { error: "Failed to delete affiliation" },
      { status: 500 },
    );
  }
}
