# Implementation Plan: Security And Data Hardening

**Branch**: `001-security-data-hardening` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-security-data-hardening/spec.md`

## Summary

Harden existing TeamFinder security, privacy, transaction, configuration, and
quality-gate behavior without redesigning the product. The implementation will
reuse Clerk authentication, existing admin permission helpers, Drizzle
transactions, typed T3 environment validation, Vitest route/unit coverage, and
the current GitHub Actions check workflow.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Next.js 15 App Router, Node 20-24 supported by engines

**Primary Dependencies**: Clerk, Drizzle ORM, postgres, Zod, T3 Env, Resend, Vitest, Playwright

**Storage**: PostgreSQL via Drizzle schema and migrations already present

**Testing**: Vitest for focused route/service tests; TypeScript compiler for type checking; existing Playwright remains for broader e2e

**Target Platform**: Next.js web application deployed on Vercel-style Node runtime with PostgreSQL, Clerk, Resend, and Mapbox configuration

**Project Type**: Full-stack web application with App Router pages and route handlers under `app/`

**Performance Goals**: Preserve current route behavior; data export and center listing should remain bounded by existing query patterns

**Constraints**: Do not change authentication provider, database ORM, public page routes, or user-facing workflows beyond fixing unsafe/incomplete behavior

**Scale/Scope**: Existing TeamFinder app with admin panel, teams, player profiles, messages, privacy settings, bowling centers, and email notifications

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Authorization Before Mutation**: PASS. Mutating trusted center creation will use existing admin permission helpers or be removed from public API.
- **User Data Accuracy And Privacy**: PASS. Data export and logging changes are explicit requirements with targeted tests.
- **Atomic State Changes**: PASS. Multi-step application, onboarding, and team creation writes will use database transactions.
- **Verified Quality Gates**: PASS. The plan includes focused automated coverage plus TypeScript checks.
- **Configuration And Tooling Reproducibility**: PASS. Package metadata, `tsc` dependency, type-check script, CI, and Mapbox env validation are in scope.

Post-design check: PASS. The design artifacts preserve these gates and assign
verification tasks for each principle.

## Project Structure

### Documentation (this feature)

```text
specs/001-security-data-hardening/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── admin-centers.md
│   ├── user-export.md
│   ├── application-response.md
│   ├── onboarding.md
│   └── team-create.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── admin/centers/route.ts
│   ├── applications/[applicationId]/respond/route.ts
│   ├── bowling-centers/route.ts
│   ├── messages/route.ts
│   ├── onboarding/route.ts
│   ├── teams/create/route.ts
│   └── user/export-data/route.ts
├── bowling-centers/
│   ├── browse/CenterMap.tsx
│   └── [id]/CenterDetailMap.tsx
drizzle/schema/
env.mjs
lib/
├── admin/permissions.ts
├── db.ts
└── geo-utils.ts
.github/workflows/check.yml
package.json
README.md
SETUP.md
```

**Structure Decision**: Use the existing single Next.js app structure. Route
handlers remain under `app/api`, shared helpers remain under `lib`, schemas
remain under `drizzle/schema`, and tests will be added near the current Vitest
setup without introducing a new app/package boundary.

## Complexity Tracking

No constitution violations or additional architectural complexity are required.
