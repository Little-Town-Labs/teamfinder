import { auth } from "@clerk/nextjs/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { privacyConsents } from "@/drizzle/schema"
import { db } from "@/lib/db"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      activityLogs: { findMany: vi.fn() },
      messages: { findMany: vi.fn() },
      playerProfiles: { findFirst: vi.fn() },
      privacyConsents: { findMany: vi.fn() },
      teamMembers: { findMany: vi.fn() },
      users: { findFirst: vi.fn() },
    },
  },
}))

describe("GET /api/user/export-data", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("exports privacy consents for the authenticated user and includes sent and received messages", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_1" } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      id: "user_1",
      clerkUserId: "clerk_user_1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      imageUrl: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
    } as Awaited<ReturnType<typeof db.query.users.findFirst>>)
    vi.mocked(db.query.playerProfiles.findFirst).mockResolvedValue({ id: "profile_1" } as Awaited<
      ReturnType<typeof db.query.playerProfiles.findFirst>
    >)
    vi.mocked(db.query.teamMembers.findMany).mockResolvedValue([])
    vi.mocked(db.query.messages.findMany)
      .mockResolvedValueOnce([{ id: "sent_1", senderId: "user_1" }] as Awaited<
        ReturnType<typeof db.query.messages.findMany>
      >)
      .mockResolvedValueOnce([{ id: "received_1", recipientId: "user_1" }] as Awaited<
        ReturnType<typeof db.query.messages.findMany>
      >)
    vi.mocked(db.query.activityLogs.findMany).mockResolvedValue([])
    vi.mocked(db.query.privacyConsents.findMany).mockResolvedValue([{ id: "consent_1", userId: "user_1" }] as Awaited<
      ReturnType<typeof db.query.privacyConsents.findMany>
    >)
    const { GET } = await import("./route")

    const response = await GET()
    const body = (await response.json()) as {
      messages: { sent: unknown[]; received: unknown[]; all: unknown[] }
      privacyConsents: Array<{ id: string; userId: string }>
    }

    expect(response.status).toBe(200)
    const where = vi.mocked(db.query.privacyConsents.findMany).mock.calls[0]?.[0]?.where as
      | { queryChunks?: Array<{ value?: unknown }> }
      | undefined
    expect(where?.queryChunks?.some((chunk) => chunk === privacyConsents.userId)).toBe(true)
    expect(where?.queryChunks?.some((chunk) => chunk.value === "user_1")).toBe(true)
    expect(body.messages.sent).toHaveLength(1)
    expect(body.messages.received).toHaveLength(1)
    expect(body.messages.all).toHaveLength(2)
    expect(body.privacyConsents).toEqual([{ id: "consent_1", userId: "user_1" }])
  })
})
