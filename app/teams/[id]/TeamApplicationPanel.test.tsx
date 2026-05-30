import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TeamApplicationPanel } from "./TeamApplicationPanel"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

describe("TeamApplicationPanel", () => {
  it("shows the application form for eligible players", () => {
    render(<TeamApplicationPanel teamId="team_1" teamName="Team One" state={{ status: "eligible" }} />)

    expect(screen.getByRole("heading", { name: "Apply to join" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Submit application" })).toBeInTheDocument()
  })

  it("shows pending status without a duplicate submit action", () => {
    render(<TeamApplicationPanel teamId="team_1" teamName="Team One" state={{ status: "pending" }} />)

    expect(screen.getByText("Application pending")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Submit application" })).not.toBeInTheDocument()
  })

  it("shows unavailable status for teams that are not recruiting", () => {
    render(<TeamApplicationPanel teamId="team_1" teamName="Team One" state={{ status: "not_recruiting" }} />)

    expect(screen.getByText("Applications unavailable")).toBeInTheDocument()
  })
})
