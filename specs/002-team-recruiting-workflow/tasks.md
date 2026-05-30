# Tasks: Team Recruiting Workflow

**Input**: Design documents from `/specs/002-team-recruiting-workflow/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Focused route tests are required because the feature changes authorization and roster data integrity behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm current data/API surfaces and add shared query support.

- [x] T001 Review existing application, response, team, and team member route behavior in `app/api/teams/[teamId]/apply/route.ts`, `app/api/applications/[applicationId]/respond/route.ts`, and `drizzle/schema/relations.ts`
- [x] T002 [P] Add player application relations for team, applicant, and reviewer in `drizzle/schema/relations.ts`
- [x] T003 [P] Add or update shared application status types used by team detail UI in `app/teams/[id]/types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Harden application APIs before exposing them through UI.

**CRITICAL**: No user story UI work should begin until this phase is complete.

- [x] T004 Add route coverage for applying to non-recruiting teams, captain self-apply, current-member apply, duplicate pending applications, and successful application creation in `app/api/teams/[teamId]/apply/route.test.ts`
- [x] T005 Add route coverage for captain-only review, already-processed applications, accepted application membership creation, declined application status, duplicate membership, and full-team rejection in `app/api/applications/[applicationId]/respond/route.test.ts`
- [x] T006 Harden apply-route eligibility and bounded cover-letter validation in `app/api/teams/[teamId]/apply/route.ts`
- [x] T007 Harden respond-route capacity/member checks and transactional accepted/declined updates in `app/api/applications/[applicationId]/respond/route.ts`

**Checkpoint**: APIs enforce eligibility, authorization, duplicate prevention, and transactional roster consistency.

---

## Phase 3: User Story 1 - Apply to a Recruiting Team (Priority: P1) MVP

**Goal**: An eligible player can apply from a recruiting team detail page and see accurate status.

**Independent Test**: Sign in as a non-captain player, open a recruiting team page, submit an application, and confirm the page switches to pending status and blocks duplicates.

### Tests for User Story 1

- [x] T008 [P] [US1] Add component or route-adjacent coverage for player application panel states in `app/teams/[id]/TeamApplicationPanel.test.tsx`

### Implementation for User Story 1

- [x] T009 [US1] Query current viewer membership and application status in `app/teams/[id]/page.tsx`
- [x] T010 [US1] Create player application client panel in `app/teams/[id]/TeamApplicationPanel.tsx`
- [x] T011 [US1] Integrate player application panel into `app/teams/[id]/page.tsx`
- [x] T012 [US1] Verify player application flow using focused tests and quickstart steps in `specs/002-team-recruiting-workflow/quickstart.md`

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Review Team Applications as Captain (Priority: P1)

**Goal**: A captain can review pending applications on their own team and accept or decline each applicant.

**Independent Test**: Sign in as a captain with a pending application, accept one applicant, and confirm roster membership; repeat with decline and confirm the application leaves the pending queue.

### Tests for User Story 2

- [x] T013 [P] [US2] Add component or route-adjacent coverage for captain application review states in `app/teams/[id]/CaptainApplicationsPanel.test.tsx`

### Implementation for User Story 2

- [x] T014 [US2] Query pending applications for captain-owned teams in `app/teams/[id]/page.tsx`
- [x] T015 [US2] Create captain review client panel in `app/teams/[id]/CaptainApplicationsPanel.tsx`
- [x] T016 [US2] Integrate captain review panel into `app/teams/[id]/page.tsx`
- [x] T017 [US2] Verify captain review flow using focused tests and quickstart steps in `specs/002-team-recruiting-workflow/quickstart.md`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Communicate Application Status (Priority: P2)

**Goal**: Players and captains see clear pending, accepted, declined, empty, and error states.

**Independent Test**: Move applications through pending, accepted, and declined states and confirm each actor sees the correct in-product status.

### Implementation for User Story 3

- [x] T018 [US3] Add accepted, declined, unavailable, and empty-state copy to `app/teams/[id]/TeamApplicationPanel.tsx`
- [x] T019 [US3] Add pending queue empty and action error states to `app/teams/[id]/CaptainApplicationsPanel.tsx`
- [x] T020 [US3] Ensure team detail success banner is shown only when appropriate in `app/teams/[id]/page.tsx`

**Checkpoint**: All specified user-facing statuses are represented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation sync.

- [x] T021 [P] Update feature documentation notes in `specs/002-team-recruiting-workflow/quickstart.md` if implementation paths differ
- [x] T022 Run `COREPACK_HOME=/tmp/corepack pnpm run test -- app/api/teams/[teamId]/apply/route.test.ts app/api/applications/[applicationId]/respond/route.test.ts --run`
- [x] T023 Run `COREPACK_HOME=/tmp/corepack pnpm run type-check`
- [x] T024 Run `COREPACK_HOME=/tmp/corepack pnpm run lint`
- [x] T025 Run `COREPACK_HOME=/tmp/corepack pnpm run build`
- [x] T026 Run `git diff --check`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks UI stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and can be built after or alongside User Story 1.
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 surfaces existing.
- **Polish (Phase 6)**: Depends on the desired stories being complete.

### User Story Dependencies

- **US1 Apply to a Recruiting Team**: MVP and can ship independently after Foundational.
- **US2 Review Team Applications as Captain**: Completes the loop; can be tested with seeded pending applications.
- **US3 Communicate Application Status**: Adds clarity to US1/US2 states.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T004 and T005 can be authored in parallel.
- T008 and T013 can be authored in parallel after component interfaces are decided.
- US1 and US2 UI panels are separate files and can be developed in parallel after shared page queries are defined.

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 to let players submit applications.
3. Validate player application flow before extending captain review.

### Complete Recruiting Loop

1. Complete Phase 4 to let captains accept or decline applicants.
2. Complete Phase 5 to polish visible status states.
3. Run Phase 6 validation before commit/PR.
