import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { Button } from "@/components/Button/Button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { isAdmin } from "@/lib/admin/permissions"
import { MobileMenuButton } from "./MobileMenuButton"

export async function Header() {
  const { userId } = await auth()
  const userIsAdmin = userId ? await isAdmin(userId) : false

  return (
    <header className="relative border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <nav className="mx-auto flex max-w-(--breakpoint-xl) items-center justify-between px-4 py-4 lg:px-6">
        <Link href="/" className="flex items-center">
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">TeamFinder</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileMenuButton>
            <SignedOut>
              <Button href="/sign-in" intent="secondary" size="sm">
                Sign In
              </Button>
              <Button href="/sign-up" size="sm">
                Sign Up
              </Button>
            </SignedOut>
            <SignedIn>
              <Button href="/dashboard" intent="secondary" size="sm">
                Dashboard
              </Button>
              <Button href="/feedback" intent="secondary" size="sm">
                Feedback
              </Button>
              {userIsAdmin && (
                <Button href="/admin" intent="secondary" size="sm">
                  Admin Panel
                </Button>
              )}
              <UserButton />
            </SignedIn>
          </MobileMenuButton>
        </div>
      </nav>
    </header>
  )
}
