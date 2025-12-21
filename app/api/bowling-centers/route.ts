import { auth } from "@clerk/nextjs/server";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { bowlingCenters, users } from "@/drizzle/schema";
import { logBowlingCenterAdded } from "@/lib/activity-logger";
import { db } from "@/lib/db";
import { calculateDistance, geocodeAddress } from "@/lib/geo-utils";

export const dynamic = "force-dynamic";

// Validation schema for creating a bowling center
const createCenterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().default("USA"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  numberOfLanes: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const verified = searchParams.get("verified");

    // Proximity search
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius"); // in miles

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(bowlingCenters.name, `%${search}%`),
          ilike(bowlingCenters.city, `%${search}%`),
          ilike(bowlingCenters.address, `%${search}%`),
        ),
      );
    }

    if (state) {
      conditions.push(eq(bowlingCenters.state, state));
    }

    if (city) {
      conditions.push(ilike(bowlingCenters.city, city));
    }

    if (verified === "true") {
      conditions.push(eq(bowlingCenters.verified, true));
    }

    // Query database
    let query = db.select().from(bowlingCenters);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const centers = await query.limit(limit).offset(offset);

    // Calculate distances if proximity search is enabled
    let centersWithDistance = centers;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = radius ? parseFloat(radius) : null;

      centersWithDistance = centers
        .map((center) => {
          if (!center.latitude || !center.longitude) {
            return { ...center, distance: null };
          }

          const distance = calculateDistance(
            userLat,
            userLng,
            parseFloat(center.latitude),
            parseFloat(center.longitude),
          );

          return {
            ...center,
            distance,
          };
        })
        .filter((center) => {
          // Filter by radius if specified
          if (maxRadius && center.distance !== null) {
            return center.distance <= maxRadius;
          }
          return true;
        })
        .sort((a, b) => {
          // Sort by distance
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
    }

    // Get total count for pagination
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(bowlingCenters);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }
    const countResult = await countQuery;
    const totalCount = countResult[0]?.count ?? 0;

    return NextResponse.json({
      centers: centersWithDistance,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bowling centers:", error);
    return NextResponse.json({ error: "Failed to fetch bowling centers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Check if user is admin (check publicMetadata.role === "admin")
    // For now, we'll skip admin check for Phase 1 and add it in Phase 5
    // TODO: Add admin role check

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCenterSchema.parse(body);

    // Auto-geocode if lat/lng not provided
    let latitude = validatedData.latitude;
    let longitude = validatedData.longitude;

    if (!latitude || !longitude) {
      const fullAddress = `${validatedData.address}, ${validatedData.city}, ${validatedData.state} ${validatedData.zipCode}`;
      const coordinates = await geocodeAddress(fullAddress);

      if (coordinates) {
        latitude = coordinates.latitude;
        longitude = coordinates.longitude;
      }
    }

    // Create bowling center
    const result = await db
      .insert(bowlingCenters)
      .values({
        name: validatedData.name,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        country: validatedData.country,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        website: validatedData.website || null,
        latitude: latitude ? latitude.toString() : null,
        longitude: longitude ? longitude.toString() : null,
        numberOfLanes: validatedData.numberOfLanes || null,
        amenities: validatedData.amenities || null,
        verified: true, // Auto-verify admin-added centers
      })
      .returning();

    const newCenter = result[0];
    if (!newCenter) {
      return NextResponse.json({ error: "Failed to create bowling center" }, { status: 500 });
    }

    // Log activity
    await logBowlingCenterAdded({
      userId: user.id,
      centerId: newCenter.id,
      centerName: newCenter.name,
    });

    return NextResponse.json(newCenter, { status: 201 });
  } catch (error) {
    console.error("Error creating bowling center:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create bowling center" }, { status: 500 });
  }
}
