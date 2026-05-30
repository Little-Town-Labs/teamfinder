"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import type { PendingApplication } from "./types"

type CaptainApplicationsPanelProps = {
  applications: PendingApplication[]
}

function applicantName(application: PendingApplication) {
  const name = [application.applicant.firstName, application.applicant.lastName].filter(Boolean).join(" ")
  return name || "TeamFinder player"
}

export function CaptainApplicationsPanel({ applications }: CaptainApplicationsPanelProps) {
  const router = useRouter()
  const [pendingApplications, setPendingApplications] = useState(applications)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const respond = async (applicationId: string, status: "accepted" | "declined") => {
    setActiveId(applicationId)
    setError(null)

    try {
      const response = await fetch(`/api/applications/${applicationId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(data.error ?? "Application could not be reviewed.")
        return
      }

      setPendingApplications((current) => current.filter((application) => application.id !== applicationId))
      router.refresh()
    } catch {
      setError("Application could not be reviewed. Please try again.")
    } finally {
      setActiveId(null)
    }
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-800">
      <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 lg:px-6">
        <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Applications</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Review players who want to join your roster.
            </p>
          </div>

          {error && <p className="mb-4 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

          {pendingApplications.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
              <p className="font-medium text-gray-700 dark:text-gray-200">No pending applications</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">New player applications will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <article key={application.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        {application.applicant.imageUrl && (
                          <Image
                            src={application.applicant.imageUrl}
                            alt={applicantName(application)}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{applicantName(application)}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {application.coverLetter && (
                        <p className="mt-3 text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                          {application.coverLetter}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={activeId === application.id}
                        onClick={() => respond(application.id, "accepted")}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-green-600 bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:enabled:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={activeId === application.id}
                        onClick={() => respond(application.id, "declined")}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:enabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:enabled:bg-gray-700"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
