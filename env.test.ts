import { spawnSync } from "node:child_process"
import { describe, expect, it } from "vitest"

describe("env", () => {
  it("allows validation to be skipped for CI tooling", () => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      SKIP_ENV_VALIDATION: "true",
    }
    delete env.DATABASE_URL
    delete env.CLERK_SECRET_KEY
    delete env.CLERK_WEBHOOK_SECRET
    delete env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    delete env.NEXT_PUBLIC_MAPBOX_TOKEN
    delete env.RESEND_API_KEY

    const result = spawnSync(process.execPath, ["--input-type=module", "-e", "import('./env.mjs')"], {
      cwd: process.cwd(),
      env,
      encoding: "utf8",
    })

    expect(result.status).toBe(0)
  })

  it("requires NEXT_PUBLIC_MAPBOX_TOKEN", () => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      DATABASE_URL: "postgresql://user:password@localhost:5432/teamfinder",
      CLERK_SECRET_KEY: "sk_test_mock",
      CLERK_WEBHOOK_SECRET: "whsec_mock",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_mock",
      RESEND_API_KEY: "re_mock",
    }
    delete env.SKIP_ENV_VALIDATION
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
