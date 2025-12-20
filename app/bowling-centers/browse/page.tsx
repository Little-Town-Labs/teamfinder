import { ErrorBoundary } from "@/app/bowling-centers/ErrorBoundary";
import { Header } from "@/components/Header/Header";
import { bowlingCenters } from "@/drizzle/schema";
import { db } from "@/lib/db";

import BrowseCentersClient from "./BrowseCentersClient";

export default async function BrowseCentersPage() {
  // Fetch initial centers (first 20)
  const initialCenters = await db.select().from(bowlingCenters).limit(20);

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
              Bowling Center Directory
            </h1>
            <p className="mb-8 font-light text-gray-500 md:text-lg lg:text-xl dark:text-gray-400">
              Discover bowling centers near you, find leagues, and connect with local teams
            </p>
          </div>
        </div>
      </section>

      {/* Browse Section */}
      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <ErrorBoundary>
            <BrowseCentersClient initialCenters={initialCenters} />
          </ErrorBoundary>
        </div>
      </section>
    </>
  );
}
