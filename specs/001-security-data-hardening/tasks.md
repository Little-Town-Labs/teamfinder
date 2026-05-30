# Tasks: Security And Data Hardening

**Input**: Design documents from `/specs/001-security-data-hardening/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Targeted automated regression tests are required by FR-013 and the
project constitution.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish project-specific quality gates and test harness support.

- [x] T001 Remove the placeholder `tsc` dependency from `package.json` and refresh `pnpm-lock.yaml`
- [x] T002 Add `type-check` script to `package.json`
- [x] T003 Add `pnpm run type-check` to `.github/workflows/check.yml`
- [x] T004 Rename package identity from `next-enterprise` to `teamfinder` in `package.json`
- [x] T005 [P] Add or update route-handler test utilities for mocking Clerk auth and Drizzle calls in `vitest.setup.ts` or a new `test/` helper path

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared patterns that must exist before user-story changes.

- [x] T006 [P] Identify all sensitive console logs in changed route handlers and define sanitized replacements in implementation notes or inline code
- [x] T007 [P] Confirm existing admin permission constants for center creation in `drizzle/schema/permissions.ts` and `lib/admin/permissions.ts`
- [x] T008 Confirm transaction behavior and test strategy for `db.transaction` usage in `lib/db.ts` and route-handler tests

**Checkpoint**: Foundation ready; user-story implementation can proceed.

---

## Phase 3: User Story 1 - Protect Trusted Mutations (Priority: P1)

**Goal**: Only authorized admins can create trusted verified bowling centers.

**Independent Test**: Non-admin center creation creates zero verified centers;
admin center creation still succeeds.

### Tests for User Story 1

- [x] T009 [P] [US1] Add non-admin rejection test for `POST /api/bowling-centers` in route tests
- [x] T010 [P] [US1] Add admin center creation permission test for `POST /api/admin/centers` in route tests

### Implementation for User Story 1

- [x] T011 [US1] Remove or lock down trusted center creation in `app/api/bowling-centers/route.ts`
- [x] T012 [US1] Ensure admin center creation continues through `app/api/admin/centers/route.ts`
- [x] T013 [US1] Verify community edits remain routed through `app/api/bowling-centers/[id]/suggest-edit/route.ts`

**Checkpoint**: Trusted center creation is protected and independently tested.

---

## Phase 4: User Story 2 - Export Complete User Data Safely (Priority: P1)

**Goal**: User exports include complete claimed user data and exclude unrelated
records.

**Independent Test**: Export fixture includes only the authenticated user's
profile, sent messages, received messages, activity, teams, and consents.

### Tests for User Story 2

- [x] T014 [P] [US2] Add privacy-consent filtering test for `app/api/user/export-data/route.ts`
- [x] T015 [P] [US2] Add sent-and-received messages export test for `app/api/user/export-data/route.ts`

### Implementation for User Story 2

- [x] T016 [US2] Fix privacy consent filtering in `app/api/user/export-data/route.ts`
- [x] T017 [US2] Include received messages in `app/api/user/export-data/route.ts`
- [x] T018 [US2] Fix account deletion message cleanup for sent and received messages in `app/api/user/delete-account/route.ts`

**Checkpoint**: Data export is complete for claimed categories and user-scoped.

---

## Phase 5: User Story 3 - Keep Multi-Step User Actions Consistent (Priority: P2)

**Goal**: Multi-step user-visible writes are atomic.

**Independent Test**: Simulated downstream write failures roll back prior writes.

### Tests for User Story 3

- [x] T019 [P] [US3] Add application acceptance rollback test for `app/api/applications/[applicationId]/respond/route.ts`
- [x] T020 [P] [US3] Add onboarding rollback test for `app/api/onboarding/route.ts`
- [x] T021 [P] [US3] Add team creation rollback test for `app/api/teams/create/route.ts`

### Implementation for User Story 3

- [x] T022 [US3] Wrap application status update and team membership insert in a transaction in `app/api/applications/[applicationId]/respond/route.ts`
- [x] T023 [US3] Wrap profile creation, privacy consent insertion, and user privacy updates in a transaction in `app/api/onboarding/route.ts`
- [x] T024 [US3] Wrap team creation and captain membership insertion in a transaction in `app/api/teams/create/route.ts`
- [x] T025 [US3] Remove sensitive success/failure logs from transactional routes while preserving non-sensitive error context

**Checkpoint**: Multi-step writes either fully complete or leave prior state.

---

## Phase 6: User Story 4 - Maintain Reproducible Quality Gates (Priority: P2)

**Goal**: Local and CI quality gates run the intended tools.

**Independent Test**: Type-check and tests run locally; CI includes type-check.

### Tests for User Story 4

- [x] T026 [US4] Run `pnpm run type-check` or documented local compiler fallback
- [x] T027 [US4] Run targeted Vitest route tests

### Implementation for User Story 4

- [x] T028 [US4] Refresh lockfile after removing `tsc` placeholder package
- [x] T029 [US4] Update README or SETUP script list to document `pnpm run type-check`

**Checkpoint**: Quality commands are reproducible and documented.

---

## Phase 7: User Story 5 - Validate Required Runtime Configuration (Priority: P3)

**Goal**: Mapbox configuration is typed, validated, and documented consistently.

**Independent Test**: Environment validation requires Mapbox token and map code
reads typed env values.

### Tests for User Story 5

- [x] T030 [P] [US5] Add env validation coverage for `NEXT_PUBLIC_MAPBOX_TOKEN` if an env test pattern exists or create one

### Implementation for User Story 5

- [x] T031 [US5] Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `env.mjs`
- [x] T032 [US5] Replace raw Mapbox env reads in `lib/geo-utils.ts`, `app/bowling-centers/browse/CenterMap.tsx`, and `app/bowling-centers/[id]/CenterDetailMap.tsx`
- [x] T033 [US5] Align README and SETUP environment documentation with `env.mjs` and `.env.example`

**Checkpoint**: Required Mapbox configuration is validated and consistently read.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all stories.

- [x] T034 [P] Run `rg -n "console\\.log|Received onboarding data|email sent to" app lib` and remove remaining sensitive logs in touched paths
- [x] T035 Run `pnpm run prettier` or `./node_modules/.bin/prettier --check "**/*.{js,jsx,ts,tsx}"`
- [x] T036 Run `pnpm run test`
- [x] T037 Run `pnpm run type-check`
- [x] T038 Run `git diff --check`
- [x] T039 Update `specs/001-security-data-hardening/quickstart.md` with any environment-specific validation caveats discovered during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1.
- **US1 and US2 (P1)**: Depend on Phase 2 and can proceed independently.
- **US3 and US4 (P2)**: Depend on Phase 2; US4 also depends on Setup.
- **US5 (P3)**: Depends on Phase 2.
- **Polish**: Depends on all desired user stories.

### User Story Dependencies

- **US1**: No dependency on other stories after foundation.
- **US2**: No dependency on other stories after foundation.
- **US3**: No dependency on US1/US2, but shares test utilities.
- **US4**: Can run in parallel with feature work after script changes.
- **US5**: Can run in parallel after foundation.

### Parallel Opportunities

- T005, T006, T007, T009, T010, T014, T015, T019, T020, T021, T030, and T034 are parallelizable.
- US1 and US2 are both P1 and can be implemented independently once test utilities are ready.
- US5 is isolated to configuration and Mapbox consumers.

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 and US2.
3. Run targeted tests plus type-check.
4. Continue to transaction and tooling/config cleanup.

### Incremental Delivery

1. Security/data correctness first: US1 and US2.
2. Consistency second: US3.
3. Reproducibility third: US4 and US5.
4. Final full verification and docs cleanup.
