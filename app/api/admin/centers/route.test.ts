import { auth } from "@clerk/nextjs/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { requirePermission } from "@/lib/admin/permissions"
import { db } from "@/lib/db"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/admin/audit-logger", () => ({
  logAdminAction: vi.fn(),
}))

vi.mock("@/lib/admin/clerk-integration", () => ({
  getClerkUser: vi.fn().mockResolvedValue({
    firstName: "Admin",
    lastName: "User",
    emailAddresses: [{ emailAddress: "admin@example.com" }],
  }),
}))

vi.mock("@/lib/admin/permissions", () => ({
  requirePermission: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
  },
}))

describe("POST /api/admin/centers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("requires create_centers permission before creating an admin center", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "admin_clerk" } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(requirePermission).mockResolvedValue(undefined)
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "admin_user_1" }]),
        }),
      }),
    } as never)
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "center_1", name: "Center One" }]),
      }),
    } as never)
    const { POST } = await import("./route")

    const response = await POST(
      new Request("http://test.local/api/admin/centers", {
        method: "POST",
        body: JSON.stringify({
          name: "Center One",
          address: "1 Main St",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
        }),
      }) as never
    )

    expect(response.status).toBe(200)
    expect(requirePermission).toHaveBeenCalledWith("admin_clerk", "create_centers")
    expect(db.insert).toHaveBeenCalled()
  })
})
