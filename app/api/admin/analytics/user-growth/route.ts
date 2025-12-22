import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getAllUsers } from "@/lib/admin/clerk-integration";
import { requirePermission } from "@/lib/admin/permissions";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requirePermission(clerkUserId, "view_analytics");

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all users from Clerk (with pagination if needed)
    const allUsers = await getAllUsers(1000, 0); // Get up to 1000 users

    // Group users by creation date
    const usersByDate = new Map<string, number>();

    // Initialize all dates in range with 0
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0]!;
      usersByDate.set(dateStr, 0);
    }

    // Count users by creation date
    allUsers.data.forEach((user) => {
      const createdDate = new Date(user.createdAt);
      if (createdDate >= startDate && createdDate <= endDate) {
        const dateStr = createdDate.toISOString().split("T")[0]!;
        usersByDate.set(dateStr, (usersByDate.get(dateStr) || 0) + 1);
      }
    });

    // Convert to array for chart
    const data = Array.from(usersByDate.entries())
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching user growth:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch user growth data" },
      { status: 500 },
    );
  }
}
