"use client";

import Link from "next/link";

import type { BowlingCenter } from "@/drizzle/schema";
import { formatDistance } from "@/lib/geo-utils";

interface CenterListProps {
  centers: BowlingCenter[];
  loading: boolean;
}

export default function CenterList({ centers, loading }: CenterListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 p-6 shadow-lg dark:from-gray-700 dark:to-gray-800"
          >
            <div className="mb-2 h-6 rounded bg-gray-300 dark:bg-gray-600" />
            <div className="mb-4 h-4 rounded bg-gray-300 dark:bg-gray-600" />
            <div className="h-4 w-2/3 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    );
  }

  if (centers.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-12 text-center shadow-lg dark:from-gray-900 dark:to-gray-800/50">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">No centers found</h3>
        <p className="font-medium text-gray-600 dark:text-gray-400">
          Try adjusting your filters, expanding your search radius, or changing your search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {centers.map((center) => (
        <div
          key={center.id}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-[2px] shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-orange-500/50"
        >
          <Link
            href={`/bowling-centers/${center.id}`}
            className="block h-full rounded-3xl bg-white p-6 transition-all dark:bg-gray-900"
          >
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {center.name}
            </h3>
            {center.verified && (
              <span className="ml-2 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-blue-200/50 px-2.5 py-0.5 text-xs font-semibold text-blue-800 shadow-sm dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-200">
                <svg
                  className="-ml-0.5 mr-1 h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </span>
            )}
          </div>

          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>{center.address}</p>
            <p>
              {center.city}, {center.state} {center.zipCode}
            </p>

            {center.phone && (
              <p className="flex items-center">
                <svg
                  className="mr-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {center.phone}
              </p>
            )}

            {center.numberOfLanes && (
              <p className="flex items-center text-gray-500 dark:text-gray-500">
                <svg
                  className="mr-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {center.numberOfLanes} lanes
              </p>
            )}

            {/* Show distance if available */}
            {"distance" in center && center.distance !== null && (
              <p className="flex items-center font-medium text-blue-600 dark:text-blue-400">
                <svg
                  className="mr-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {formatDistance(center.distance as number)}
              </p>
            )}
          </div>
        </Link>
        </div>
      ))}
    </div>
  );
}
