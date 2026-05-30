# Implementation Plan: Team Recruiting Workflow

**Branch**: `002-team-recruiting-workflow` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-team-recruiting-workflow/spec.md`

## Summary

Complete the core team recruiting loop by adding user-facing application submission and captain review surfaces around the existing player application data, routes, roster membership, and email notification hooks. The implementation will reuse the current Next.js App Router, Clerk-authenticated users, Drizzle/PostgreSQL schemas, existing application APIs, and current team detail surfaces while tightening authorization, duplicate prevention, and transactional roster updates where needed.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Next.js 15 App Router

**Primary Dependencies**: Clerk auth, Drizzle ORM, PostgreSQL, Zod, React server/client components, existing email helper built on Resend/React Email

**Storage**: PostgreSQL through existing Drizzle schemas for teams, team members, player applications, and users

**Testing**: Vitest route/unit tests, TypeScript check, ESLint, production build; Playwright only if the final UI path needs browser verification beyond route/component coverage

**Target Platform**: Vercel-hosted web application

**Project Type**: Full-stack web application

**Performance Goals**: Team detail and captain review pages should avoid unnecessary broad table scans and should load application state alongside team data with narrow team/user filters.

**Constraints**: Preserve existing Clerk identity mapping; do not leak applicant cover letters or email addresses through logs or unauthorized surfaces; keep application acceptance plus roster membership transactional.

**Scale/Scope**: One MVP workflow covering player applications and captain review. Team invitations and full messaging remain later slices.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Authorization Before Mutation**: PASS. Apply and respond routes already require Clerk auth; plan requires eligible-player checks and captain-only review controls.
- **User Data Accuracy And Privacy**: PASS. Applicant messages are shown only to team captains; logs must avoid payload/body details.
- **Atomic State Changes**: PASS. Acceptance must keep application status and roster membership in one transaction; any fixes to capacity or duplicate-member handling must preserve this.
- **Verified Quality Gates**: PASS. Route tests are required for eligibility, authorization, duplicate, accept, and decline behavior; UI status tests are included where practical.
- **Configuration And Tooling Reproducibility**: PASS. No new runtime configuration is planned.

## Project Structure

### Documentation (this feature)

```text
specs/002-team-recruiting-workflow/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── apply.md
│   └── review-applications.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── teams/[teamId]/apply/route.ts
│   └── applications/[applicationId]/respond/route.ts
├── teams/[id]/
│   ├── page.tsx
│   ├── TeamApplicationPanel.tsx
│   └── CaptainApplicationsPanel.tsx
└── dashboard/page.tsx

drizzle/schema/
├── player-applications.ts
├── team-members.ts
├── teams.ts
└── relations.ts

lib/
├── db.ts
└── email.ts
```

**Structure Decision**: Use the existing single Next.js application layout. Add focused team-detail child components for player and captain workflows, reuse existing API route locations, and add schema relations only where they simplify narrow application queries.

## Complexity Tracking

No constitution violations or unusual complexity are required.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [contracts/apply.md](./contracts/apply.md), [contracts/review-applications.md](./contracts/review-applications.md), and [quickstart.md](./quickstart.md).

## Constitution Check Re-evaluation

- **Authorization Before Mutation**: PASS. Contracts require captain-only review and eligible-player submit checks.
- **User Data Accuracy And Privacy**: PASS. Design limits application details to applicants and captains.
- **Atomic State Changes**: PASS. Data model requires application acceptance and member creation to remain transactional.
- **Verified Quality Gates**: PASS. Task list will include focused route tests and validation commands.
- **Configuration And Tooling Reproducibility**: PASS. No new environment or tooling requirements.
