import { auth } from "@clerk/nextjs/server"
import { and, eq, ilike, or, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { bowlingCenters, users } from "@/drizzle/schema"
import { db } from "@/lib/db"
import { calculateDistance } from "@/lib/geo-utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    // Filters
    const search = searchParams.get("search")
    const state = searchParams.get("state")
    const city = searchParams.get("city")
    const verified = searchParams.get("verified")

    // Proximity search
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") // in miles

    // Build where conditions
    const conditions = []

    if (search) {
      conditions.push(
        or(
          ilike(bowlingCenters.name, `%${search}%`),
          ilike(bowlingCenters.city, `%${search}%`),
          ilike(bowlingCenters.address, `%${search}%`)
        )
      )
    }

    if (state) {
      conditions.push(eq(bowlingCenters.state, state))
    }

    if (city) {
      conditions.push(ilike(bowlingCenters.city, city))
    }

    if (verified === "true") {
      conditions.push(eq(bowlingCenters.verified, true))
    }

    // Query database
    let query = db.select().from(bowlingCenters)

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query
    }

    const centers = await query.limit(limit).offset(offset)

    // Calculate distances if proximity search is enabled
    let centersWithDistance = centers
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      const maxRadius = radius ? parseFloat(radius) : null

      centersWithDistance = centers
        .map((center) => {
          if (!center.latitude || !center.longitude) {
            return { ...center, distance: null }
          }

          const distance = calculateDistance(
            userLat,
            userLng,
            parseFloat(center.latitude),
            parseFloat(center.longitude)
          )

          return {
            ...center,
            distance,
          }
        })
        .filter((center) => {
          // Filter by radius if specified
          if (maxRadius && center.distance !== null) {
            return center.distance <= maxRadius
          }
          return true
        })
        .sort((a, b) => {
          // Sort by distance
          if (a.distance === null) return 1
          if (b.distance === null) return -1
          return a.distance - b.distance
        })
    }

    // Get total count for pagination
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(bowlingCenters)
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as typeof countQuery
    }
    const countResult = await countQuery
    const totalCount = countResult[0]?.count ?? 0

    return NextResponse.json({
      centers: centersWithDistance,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching bowling centers:", error)
    return NextResponse.json({ error: "Failed to fetch bowling centers" }, { status: 500 })
  }
}

export async function POST(_request: NextRequest) {
  try {
    // Public center records are trusted directory data. Community changes should
    // go through /api/bowling-centers/[id]/suggest-edit; verified creation is
    // handled by /api/admin/centers after permission checks.
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        error:
          "Direct bowling center creation is restricted. Submit edits for review or use the admin center workflow.",
      },
      { status: 403 }
    )
  } catch (error) {
    console.error("Error creating bowling center:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create bowling center" }, { status: 500 })
  }
}
