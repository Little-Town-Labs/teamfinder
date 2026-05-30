import { auth } from "@clerk/nextjs/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { db } from "@/lib/db"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
}))

vi.mock("@/lib/email", () => ({
  emailTemplates: {
    welcome: vi.fn().mockResolvedValue({ from: "test@example.com", to: "user@example.com" }),
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
      playerProfiles: { findFirst: vi.fn() },
      users: { findFirst: vi.fn() },
    },
    transaction: vi.fn(),
  },
}))

describe("POST /api/onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uses a transaction for profile, consent, and user privacy updates", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_1" } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      firstName: "Test",
    } as Awaited<ReturnType<typeof db.query.users.findFirst>>)
    vi.mocked(db.query.playerProfiles.findFirst).mockResolvedValue(undefined)
    vi.mocked(db.transaction).mockImplementation(async (callback) =>
      callback({
        insert: vi
          .fn()
          .mockReturnValueOnce({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: "profile_1" }]),
            }),
          })
          .mockReturnValueOnce({
            values: vi.fn().mockResolvedValue(undefined),
          }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      } as never)
    )
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://test.local/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          usbcMemberId: "12345",
          gender: "male",
          bowlingHand: "right",
          acceptPrivacyPolicy: true,
          acceptTermsOfService: true,
        }),
      })
    )

    expect(response.status).toBe(201)
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })
})
