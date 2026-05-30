import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CaptainApplicationsPanel } from "./CaptainApplicationsPanel"
import type { PendingApplication } from "./types"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

const application: PendingApplication = {
  applicant: {
    firstName: "Alex",
    id: "user_1",
    imageUrl: null,
    lastName: "Bowler",
  },
  applicantUserId: "user_1",
  coverLetter: "I can bowl on Tuesday nights.",
  createdAt: new Date("2026-05-30T00:00:00.000Z"),
  id: "application_1",
  message: null,
  reviewedAt: null,
  reviewedByUserId: null,
  status: "pending",
  teamId: "team_1",
  updatedAt: new Date("2026-05-30T00:00:00.000Z"),
}

describe("CaptainApplicationsPanel", () => {
  it("shows an empty state with no pending applications", () => {
    render(<CaptainApplicationsPanel applications={[]} />)

    expect(screen.getByText("No pending applications")).toBeInTheDocument()
  })

  it("shows applicant details and review actions", () => {
    render(<CaptainApplicationsPanel applications={[application]} />)

    expect(screen.getByText("Alex Bowler")).toBeInTheDocument()
    expect(screen.getByText("I can bowl on Tuesday nights.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Decline" })).toBeInTheDocument()
  })
})
