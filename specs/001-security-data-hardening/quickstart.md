# Quickstart: Security And Data Hardening

## Prerequisites

- Install dependencies with pnpm after the `tsc` placeholder dependency is
  removed.
- Provide `.env.local` values matching `.env.example`, including Mapbox.

## Validation Commands

```bash
pnpm run type-check
pnpm run test
pnpm run prettier
pnpm run build
```

`NEXT_PUBLIC_MAPBOX_TOKEN` is now required by typed environment validation. Local
lint/build commands must have it in `.env.local` or in the command environment,
for example:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.mock pnpm run lint
```

As of this work, the repository-wide `pnpm run prettier` command still reports
pre-existing formatting drift outside the touched files. The changed files were
checked directly with Prettier.

If Corepack cannot write to its cache in a constrained environment, use local
binaries for diagnosis and record the blocker:

```bash
node node_modules/typescript/bin/tsc --noEmit --pretty false
./node_modules/.bin/vitest run --passWithNoTests
```

## Manual Verification

1. Sign in as a regular user and attempt to create a verified bowling center
   through the non-admin API. Confirm no verified center is created.
2. Sign in as an admin with `create_centers` permission and create a center
   through the admin flow. Confirm the center is created and admin logging works.
3. Create sent and received messages plus privacy consents for a test user.
   Export data and confirm all exported records belong to that user.
4. Exercise onboarding, team creation, and application acceptance happy paths.
5. Force a downstream write failure in tests and confirm transactional rollback.
