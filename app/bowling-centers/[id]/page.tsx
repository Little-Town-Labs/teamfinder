import Link from "next/link";
import { notFound } from "next/navigation";

import { ErrorBoundary } from "@/app/bowling-centers/ErrorBoundary";
import { Header } from "@/components/Header/Header";

import CenterDetailClient from "./CenterDetailClient";
import CenterDetailMapWrapper from "./CenterDetailMapWrapper";

export const dynamic = "force-dynamic";

interface CenterDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CenterDetailPage({ params }: CenterDetailPageProps) {
  const { id } = await params;

  // Fetch center details from API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/bowling-centers/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const data = (await response.json()) as {
    center: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone: string | null;
      email: string | null;
      website: string | null;
      numberOfLanes: string | null;
      amenities: string[] | null;
      verified: boolean;
      latitude: string | null;
      longitude: string | null;
    };
    teams: {
      items: Array<{
        id: string;
        name: string;
        teamType: string;
        captain: { id: string; firstName: string | null; lastName: string | null };
      }>;
      total: number;
    };
    leagues: {
      items: Array<{
        id: string;
        name: string;
        dayOfWeek: string;
        startTime: string;
      }>;
      total: number;
    };
    players: {
      items: Array<{
        id: string;
        user: { id: string; firstName: string | null; lastName: string | null };
        currentAverage: number | null;
      }>;
      total: number;
    };
  };

  const { center, teams, leagues, players } = data;

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
                  {center.name}
                </h1>
                {center.verified && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified Center
                  </span>
                )}
              </div>
              <CenterDetailClient center={center} />
            </div>

            <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
              {center.address}
              <br />
              {center.city}, {center.state} {center.zipCode}
            </p>
          </div>
        </div>
      </section>

      {/* Contact & Info Section */}
      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Contact Information */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                Contact Information
              </h2>
              <div className="space-y-3">
                {center.phone && (
                  <p className="flex items-center text-gray-700 dark:text-gray-300">
                    <svg
                      className="mr-3 h-5 w-5 text-gray-500"
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
                    <a href={`tel:${center.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {center.phone}
                    </a>
                  </p>
                )}
                {center.email && (
                  <p className="flex items-center text-gray-700 dark:text-gray-300">
                    <svg
                      className="mr-3 h-5 w-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={`mailto:${center.email}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {center.email}
                    </a>
                  </p>
                )}
                {center.website && (
                  <p className="flex items-center text-gray-700 dark:text-gray-300">
                    <svg
                      className="mr-3 h-5 w-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    <a
                      href={center.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Visit Website
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Map */}
            {center.latitude && center.longitude && (
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Location</h2>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    Get Directions
                  </a>
                </div>
                <ErrorBoundary>
                  <CenterDetailMapWrapper
                    latitude={center.latitude}
                    longitude={center.longitude}
                    verified={center.verified}
                  />
                </ErrorBoundary>
              </div>
            )}

            {/* Facility Details */}
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Facility Details</h2>
              <div className="space-y-2">
                {center.numberOfLanes && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Lanes:</span> {center.numberOfLanes}
                  </p>
                )}
                {center.amenities && center.amenities.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Amenities:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {center.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-900">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{teams.total}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Teams</div>
              </div>
              <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-900">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{leagues.total}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Leagues</div>
              </div>
              <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-900">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{players.total}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Players</div>
              </div>
            </div>

            {/* Teams */}
            {teams.items.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                  Teams ({teams.total})
                </h2>
                <div className="space-y-3">
                  {teams.items.map((team) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{team.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Captain: {`${team.captain.firstName || ""} ${team.captain.lastName || ""}`.trim() || "Unknown"}
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Leagues */}
            {leagues.items.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                  Leagues ({leagues.total})
                </h2>
                <div className="space-y-3">
                  {leagues.items.map((league) => (
                    <div
                      key={league.id}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white">{league.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {league.dayOfWeek}s at {league.startTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Players */}
            {players.items.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                  Players ({players.total})
                </h2>
                <div className="space-y-3">
                  {players.items.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {`${player.user.firstName || ""} ${player.user.lastName || ""}`.trim() || "Unknown"}
                        </h3>
                        {player.currentAverage && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Average: {player.currentAverage}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
