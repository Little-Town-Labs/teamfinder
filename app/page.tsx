import { Metadata } from "next"
import { Button } from "components/Button/Button"

import { LP_GRID_ITEMS } from "lp-items"

export const metadata: Metadata = {
  title: "TeamFinder - Find Your Perfect Bowling Team",
  description: "Connect bowlers with teams. Find teammates, recruit players, and join the bowling community.",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    title: "TeamFinder - Connect Bowlers & Teams",
    description: "The premier platform for bowling team matchmaking. Find your perfect team or recruit talented bowlers.",
    url: "https://teamfinder.vercel.app/",
  },
}

export default function Web() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto grid max-w-(--breakpoint-xl) px-4 py-8 text-center lg:py-16">
          <div className="mx-auto place-self-center">
            <h1 className="mb-4 max-w-2xl text-4xl leading-none font-extrabold tracking-tight md:text-5xl xl:text-6xl dark:text-white">
              Find Your Perfect Bowling Team
            </h1>
            <p className="mb-6 max-w-2xl font-light text-gray-500 md:text-lg lg:mb-8 lg:text-xl dark:text-gray-400">
              Connect with bowlers and teams in your area. Whether you&apos;re looking to join a league team or
              recruiting talented players, TeamFinder makes it easy to find your perfect match.
            </p>
            <Button href="/sign-up" className="mr-3">
              Get Started Free
            </Button>
            <Button href="/teams" intent="secondary">
              Browse Teams
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mb-8 text-center lg:mb-16">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Everything You Need to Connect
            </h2>
            <p className="font-light text-gray-500 sm:text-xl dark:text-gray-400">
              Powerful features designed specifically for the bowling community
            </p>
          </div>
          <div className="justify-center space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0 lg:grid-cols-3">
            {LP_GRID_ITEMS.map((singleItem) => (
              <div key={singleItem.title} className="flex flex-col items-center justify-center text-center">
                <div className="bg-primary-100 dark:bg-primary-900 mb-4 flex size-10 items-center justify-center rounded-full p-1.5 text-blue-700 lg:size-12">
                  {singleItem.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold dark:text-white">{singleItem.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{singleItem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 sm:py-16 lg:px-6">
          <div className="mb-8 text-center lg:mb-16">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="font-light text-gray-500 sm:text-xl dark:text-gray-400">
              Get started in three simple steps
            </p>
          </div>
          <div className="space-y-8 md:grid md:grid-cols-3 md:gap-12 md:space-y-0">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">Create Your Profile</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Sign up and add your USBC ID, bowling stats, and availability. Tell teams what you&apos;re looking for.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">Find Your Match</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Browse teams looking for players or discover bowlers seeking teams. Filter by skill level, location, and schedule.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">Start Bowling</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Connect directly through our messaging system, join the team, and hit the lanes together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 dark:bg-blue-800">
        <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 text-center sm:py-16 lg:px-6">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-white">
            Ready to Find Your Team?
          </h2>
          <p className="mb-8 font-light text-blue-100 sm:text-xl">
            Join TeamFinder today and connect with the bowling community. It&apos;s free to get started.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/sign-up" className="bg-white text-blue-700 border-white hover:enabled:bg-gray-100">
              Create Your Profile
            </Button>
            <Button href="/teams" intent="secondary" className="border-white text-white hover:enabled:bg-blue-600">
              Explore Teams
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
