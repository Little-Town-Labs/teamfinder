import { auth } from "@clerk/nextjs/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { db } from "@/lib/db"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/email", () => ({
  emailTemplates: {
    applicationReceived: vi.fn().mockResolvedValue({ from: "test@example.com", to: "captain@example.com" }),
  },
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}))

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      playerApplications: { findFirst: vi.fn() },
      teamMembers: { findFirst: vi.fn() },
      teams: { findFirst: vi.fn() },
      users: { findFirst: vi.fn() },
    },
    insert: vi.fn(),
  },
}))

const applyRequest = (body: unknown = {}) =>
  new Request("http://test.local/api/teams/team_1/apply", {
    method: "POST",
    body: JSON.stringify(body),
  }) as never

const params = { params: Promise.resolve({ teamId: "team_1" }) }

const mockApplicantAndCaptain = () => {
  vi.mocked(auth).mockResolvedValue({ userId: "applicant_clerk" } as Awaited<ReturnType<typeof auth>>)
  vi.mocked(db.query.users.findFirst)
    .mockResolvedValueOnce({ id: "applicant_1", firstName: "Applicant" } as Awaited<
      ReturnType<typeof db.query.users.findFirst>
    >)
    .mockResolvedValueOnce({ id: "captain_1", email: "captain@example.com", firstName: "Captain" } as Awaited<
      ReturnType<typeof db.query.users.findFirst>
    >)
}

const recruitingTeam = {
  id: "team_1",
  captainId: "captain_1",
  currentRosterSize: 2,
  lookingForPlayers: true,
  maxRosterSize: 5,
  name: "Team One",
  openPositions: 3,
}

describe("POST /api/teams/[teamId]/apply", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects applications for non-recruiting teams", async () => {
    mockApplicantAndCaptain()
    vi.mocked(db.query.teams.findFirst).mockResolvedValue({
      ...recruitingTeam,
      lookingForPlayers: false,
      openPositions: 0,
    } as Awaited<ReturnType<typeof db.query.teams.findFirst>>)
    const { POST } = await import("./route")

    const response = await POST(applyRequest({ coverLetter: "I can bowl Tuesdays." }), params)

    expect(response.status).toBe(400)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it("rejects captain self-applications", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "captain_clerk" } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(db.query.users.findFirst)
      .mockResolvedValueOnce({ id: "captain_1" } as Awaited<ReturnType<typeof db.query.users.findFirst>>)
      .mockResolvedValueOnce({ id: "captain_1", email: "captain@example.com" } as Awaited<
        ReturnType<typeof db.query.users.findFirst>
      >)
    vi.mocked(db.query.teams.findFirst).mockResolvedValue(
      recruitingTeam as Awaited<ReturnType<typeof db.query.teams.findFirst>>
    )
    const { POST } = await import("./route")

    const response = await POST(applyRequest(), params)

    expect(response.status).toBe(400)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it("rejects current team members", async () => {
    mockApplicantAndCaptain()
    vi.mocked(db.query.teams.findFirst).mockResolvedValue(
      recruitingTeam as Awaited<ReturnType<typeof db.query.teams.findFirst>>
    )
    vi.mocked(db.query.teamMembers.findFirst).mockResolvedValue({ id: "member_1" } as Awaited<
      ReturnType<typeof db.query.teamMembers.findFirst>
    >)
    const { POST } = await import("./route")

    const response = await POST(applyRequest(), params)

    expect(response.status).toBe(400)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it("rejects duplicate pending applications", async () => {
    mockApplicantAndCaptain()
    vi.mocked(db.query.teams.findFirst).mockResolvedValue(
      recruitingTeam as Awaited<ReturnType<typeof db.query.teams.findFirst>>
    )
    vi.mocked(db.query.teamMembers.findFirst).mockResolvedValue(undefined)
    vi.mocked(db.query.playerApplications.findFirst).mockResolvedValue({ id: "application_1" } as Awaited<
      ReturnType<typeof db.query.playerApplications.findFirst>
    >)
    const { POST } = await import("./route")

    const response = await POST(applyRequest(), params)

    expect(response.status).toBe(400)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it("creates a pending application for an eligible player", async () => {
    mockApplicantAndCaptain()
    vi.mocked(db.query.teams.findFirst).mockResolvedValue(
      recruitingTeam as Awaited<ReturnType<typeof db.query.teams.findFirst>>
    )
    vi.mocked(db.query.teamMembers.findFirst).mockResolvedValue(undefined)
    vi.mocked(db.query.playerApplications.findFirst).mockResolvedValue(undefined)
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "application_1", status: "pending" }]),
      }),
    } as never)
    const { POST } = await import("./route")

    const response = await POST(applyRequest({ coverLetter: "I can bowl Tuesdays." }), params)

    expect(response.status).toBe(201)
    expect(db.insert).toHaveBeenCalled()
  })
})
