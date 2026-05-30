import { auth } from "@clerk/nextjs/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { db } from "@/lib/db"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
  },
}))

describe("POST /api/bowling-centers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects unauthenticated center creation", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>)
    const { POST } = await import("./route")

    const response = await POST(new Request("http://test.local/api/bowling-centers") as never)

    expect(response.status).toBe(401)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it("rejects authenticated non-admin direct creation without inserting a verified center", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk_user_1" } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ id: "user_1" } as Awaited<
      ReturnType<typeof db.query.users.findFirst>
    >)
    const { POST } = await import("./route")

    const response = await POST(new Request("http://test.local/api/bowling-centers") as never)
    const body = (await response.json()) as { error: string }

    expect(response.status).toBe(403)
    expect(body.error).toContain("restricted")
    expect(db.insert).not.toHaveBeenCalled()
  })
})
