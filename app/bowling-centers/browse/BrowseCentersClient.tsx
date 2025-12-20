"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { BowlingCenter } from "@/drizzle/schema";

import CenterFilters from "./CenterFilters";
import CenterList from "./CenterList";

// Dynamically import CenterMap to avoid SSR issues with Mapbox
const CenterMap = dynamic(() => import("./CenterMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="text-gray-600 dark:text-gray-400">Loading map...</div>
    </div>
  ),
});

interface BrowseCentersClientProps {
  initialCenters: BowlingCenter[];
}

export interface CenterFilters {
  search: string;
  state: string;
  city: string;
  verified: boolean | null;
  useLocation: boolean;
  radius: number | null;
  userLat: number | null;
  userLng: number | null;
}

export default function BrowseCentersClient({ initialCenters }: BrowseCentersClientProps) {
  const [centers, setCenters] = useState<BowlingCenter[]>(initialCenters);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalResults, setTotalResults] = useState(initialCenters.length);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const [filters, setFilters] = useState<CenterFilters>({
    search: "",
    state: "",
    city: "",
    verified: null,
    useLocation: false,
    radius: null,
    userLat: null,
    userLng: null,
  });

  // Fetch centers whenever filters change
  useEffect(() => {
    const fetchCenters = async () => {
      setLoading(true);
      setCurrentPage(1);

      try {
        // Build query params
        const params = new URLSearchParams();
        params.append("page", "1");
        params.append("limit", "20");

        if (filters.search) params.append("search", filters.search);
        if (filters.state) params.append("state", filters.state);
        if (filters.city) params.append("city", filters.city);
        if (filters.verified !== null) params.append("verified", filters.verified.toString());
        if (filters.useLocation && filters.userLat && filters.userLng) {
          params.append("lat", filters.userLat.toString());
          params.append("lng", filters.userLng.toString());
          if (filters.radius) params.append("radius", filters.radius.toString());
        }

        const response = await fetch(`/api/bowling-centers?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch centers");
        }

        const data = (await response.json()) as {
          centers: BowlingCenter[];
          pagination: { total: number; page: number; totalPages: number };
        };

        setCenters(data.centers);
        setTotalResults(data.pagination.total);
        setHasMore(data.pagination.page < data.pagination.totalPages);
      } catch (error) {
        console.error("Error fetching centers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, [filters]);

  // Load more centers
  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const params = new URLSearchParams();
      params.append("page", nextPage.toString());
      params.append("limit", "20");

      if (filters.search) params.append("search", filters.search);
      if (filters.state) params.append("state", filters.state);
      if (filters.city) params.append("city", filters.city);
      if (filters.verified !== null) params.append("verified", filters.verified.toString());
      if (filters.useLocation && filters.userLat && filters.userLng) {
        params.append("lat", filters.userLat.toString());
        params.append("lng", filters.userLng.toString());
        if (filters.radius) params.append("radius", filters.radius.toString());
      }

      const response = await fetch(`/api/bowling-centers?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch centers");
      }

      const data = (await response.json()) as {
        centers: BowlingCenter[];
        pagination: { total: number; page: number; totalPages: number };
      };

      setCenters((prev) => [...prev, ...data.centers]);
      setCurrentPage(nextPage);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error("Error loading more centers:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <CenterFilters filters={filters} setFilters={setFilters} />

      {/* View Toggle and Result Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {loading ? (
            <span>Loading...</span>
          ) : (
            <div className="flex items-center gap-2">
              <span>
                Found <span className="font-semibold text-gray-900 dark:text-white">{totalResults}</span> bowling{" "}
                {totalResults === 1 ? "center" : "centers"}
              </span>
              {filters.useLocation && filters.userLat && filters.userLng && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sorted by distance
                </span>
              )}
            </div>
          )}
        </div>

        {/* View Toggle Buttons */}
        <div className="flex rounded-lg bg-white shadow-sm dark:bg-gray-900">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 rounded-l-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            List View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 rounded-r-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "map"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Map View
          </button>
        </div>
      </div>

      {/* Centers List or Map */}
      {viewMode === "list" ? (
        <>
          <CenterList centers={centers} loading={loading} />
          {!loading && hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {loadingMore ? "Loading..." : "Load More Centers"}
              </button>
            </div>
          )}
        </>
      ) : (
        <CenterMap centers={centers} userLat={filters.userLat} userLng={filters.userLng} />
      )}
    </div>
  );
}
