import { auth } from "@clerk/nextjs/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { db } from "@/lib/db"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/email", () => ({
  emailTemplates: {
    applicationStatusUpdate: vi.fn().mockResolvedValue({ from: "test@example.com", to: "user@example.com" }),
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
      teams: { findFirst: vi.fn() },
      users: { findFirst: vi.fn() },
    },
    transaction: vi.fn(),
  },
}))

describe("POST /api/applications/[applicationId]/respond", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uses a transaction when accepting an application", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "captain_clerk" } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(db.query.users.findFirst)
      .mockResolvedValueOnce({ id: "captain_1" } as Awaited<ReturnType<typeof db.query.users.findFirst>>)
      .mockResolvedValueOnce({
        id: "applicant_1",
        email: "applicant@example.com",
        firstName: "A",
      } as Awaited<ReturnType<typeof db.query.users.findFirst>>)
    vi.mocked(db.query.playerApplications.findFirst).mockResolvedValue({
      id: "application_1",
      teamId: "team_1",
      applicantUserId: "applicant_1",
      status: "pending",
    } as Awaited<ReturnType<typeof db.query.playerApplications.findFirst>>)
    vi.mocked(db.query.teams.findFirst).mockResolvedValue({
      id: "team_1",
      captainId: "captain_1",
      name: "Team One",
    } as Awaited<ReturnType<typeof db.query.teams.findFirst>>)
    vi.mocked(db.transaction).mockImplementation(async (callback) =>
      callback({
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: "application_1", status: "accepted" }]),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        }),
      } as never)
    )
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://test.local/api/applications/application_1/respond", {
        method: "POST",
        body: JSON.stringify({ status: "accepted" }),
      }) as never,
      { params: Promise.resolve({ applicationId: "application_1" }) }
    )

    expect(response.status).toBe(200)
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })
})
