import { auth } from "@clerk/nextjs/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { db } from "@/lib/db"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/activity-logger", () => ({
  logTeamCreated: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: { findFirst: vi.fn() },
    },
    transaction: vi.fn(),
  },
}))

describe("POST /api/teams/create", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uses a transaction for team creation and captain membership", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_1" } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      id: "00000000-0000-0000-0000-000000000001",
      clerkUserId: "clerk_user_1",
    } as Awaited<ReturnType<typeof db.query.users.findFirst>>)
    vi.mocked(db.transaction).mockImplementation(async (callback) =>
      callback({
        insert: vi
          .fn()
          .mockReturnValueOnce({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: "00000000-0000-0000-0000-000000000002", name: "Team One" }]),
            }),
          })
          .mockReturnValueOnce({
            values: vi.fn().mockResolvedValue(undefined),
          }),
      } as never)
    )
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://test.local/api/teams/create", {
        method: "POST",
        body: JSON.stringify({
          userId: "00000000-0000-0000-0000-000000000001",
          name: "Team One",
          teamType: "team",
          genderType: "male",
          competitionLevel: "league",
        }),
      })
    )

    expect(response.status).toBe(201)
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })
})
