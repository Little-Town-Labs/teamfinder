import { spawnSync } from "node:child_process"
import { describe, expect, it } from "vitest"

describe("env", () => {
  it("requires NEXT_PUBLIC_MAPBOX_TOKEN", () => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      DATABASE_URL: "postgresql://user:password@localhost:5432/teamfinder",
      CLERK_SECRET_KEY: "sk_test_mock",
      CLERK_WEBHOOK_SECRET: "whsec_mock",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_mock",
      RESEND_API_KEY: "re_mock",
    }
    delete env.NEXT_PUBLIC_MAPBOX_TOKEN

    const result = spawnSync(process.execPath, ["--input-type=module", "-e", "import('./env.mjs')"], {
      cwd: process.cwd(),
      env,
      encoding: "utf8",
    })

    expect(result.status).not.toBe(0)
    expect(`${result.stdout}${result.stderr}`).toContain("Invalid environment variables")
  })
})
