"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import type { FormEvent } from "react"

import type { ViewerApplicationState } from "./types"

type TeamApplicationPanelProps = {
  teamId: string
  teamName: string
  state: ViewerApplicationState
}

const statusCopy: Record<ViewerApplicationState["status"], { title: string; description: string }> = {
  accepted: {
    title: "Application accepted",
    description: "You are on this team's roster.",
  },
  captain: {
    title: "You captain this team",
    description: "Use the captain review panel to manage player applications.",
  },
  declined: {
    title: "Application declined",
    description: "This team has already reviewed your application.",
  },
  eligible: {
    title: "Apply to join",
    description: "Send the captain a short note about your bowling experience and availability.",
  },
  member: {
    title: "You are on this team",
    description: "No application is needed for current team members.",
  },
  not_recruiting: {
    title: "Applications unavailable",
    description: "This team is not accepting applications right now.",
  },
  pending: {
    title: "Application pending",
    description: "The captain has your application and can accept or decline it.",
  },
}

export function TeamApplicationPanel({ teamId, teamName, state }: TeamApplicationPanelProps) {
  const router = useRouter()
  const [coverLetter, setCoverLetter] = useState("")
  const [status, setStatus] = useState(state.status)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const copy = statusCopy[status]

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/teams/${teamId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter }),
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(data.error ?? "Application could not be submitted.")
        return
      }

      setStatus("pending")
      setCoverLetter("")
      router.refresh()
    } catch {
      setError("Application could not be submitted. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 lg:px-6">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{copy.title}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{copy.description}</p>

          {status === "eligible" && (
            <form onSubmit={submitApplication} className="mt-5 space-y-4">
              <div>
                <label htmlFor="coverLetter" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Message to {teamName}
                </label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                  maxLength={2000}
                  rows={5}
                  className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  placeholder="Share your bowling experience, availability, and what you are looking for in a team."
                />
              </div>

              {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:enabled:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit application"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
