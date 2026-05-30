# Feature Specification: Security And Data Hardening

**Feature Branch**: `001-security-data-hardening`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Harden TeamFinder security and data correctness by
restricting verified bowling center creation to admins, fixing user data export,
removing sensitive logs, making multi-step writes transactional, repairing
TypeScript tooling and CI, validating Mapbox env configuration, and adding
targeted regression tests."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Protect Trusted Mutations (Priority: P1)

As an administrator, I need verified bowling-center creation to be restricted to
authorized admin users so public directory data remains trustworthy.

**Why this priority**: The current reviewed issue allows trusted records to be
created outside the admin permission model, which is the highest security and
integrity risk.

**Independent Test**: Attempt verified center creation as an unauthenticated
user, a regular authenticated user, and an authorized admin. Only the authorized
admin path succeeds.

**Acceptance Scenarios**:

1. **Given** no signed-in user, **When** a center creation request is submitted,
   **Then** the system rejects it as unauthorized.
2. **Given** a signed-in non-admin user, **When** a center creation request is
   submitted, **Then** the system rejects it without creating a verified center.
3. **Given** an admin with center creation permission, **When** a valid center is
   submitted through the admin path, **Then** the center is created and audit or
   activity records remain consistent.

---

### User Story 2 - Export Complete User Data Safely (Priority: P1)

As a signed-in user, I need my data export to include the data the product claims
to export and to exclude unrelated users' data.

**Why this priority**: Privacy-rights workflows are user-facing compliance
features. Incorrect filters or incomplete message coverage undermine the export.

**Independent Test**: Create a user with profile data, sent messages, received
messages, activity, team memberships, and privacy consents. Export data and
verify only that user's records are present and all claimed categories are
included.

**Acceptance Scenarios**:

1. **Given** a user with privacy consent records, **When** they export data,
   **Then** the export includes only consent records tied to that user.
2. **Given** a user with sent and received messages, **When** they export data,
   **Then** both sent and received messages are represented.
3. **Given** an unauthenticated visitor, **When** they request data export,
   **Then** the system rejects the request.

---

### User Story 3 - Keep Multi-Step User Actions Consistent (Priority: P2)

As a team captain or new user, I need multi-step actions to either fully complete
or leave the previous state unchanged.

**Why this priority**: Inconsistent application, roster, onboarding, or team
state creates broken user workflows and difficult support cases.

**Independent Test**: Simulate failure during application acceptance, onboarding
consent recording, and team creation. Verify partial writes are rolled back.

**Acceptance Scenarios**:

1. **Given** a pending player application, **When** acceptance cannot add the
   applicant to the roster, **Then** the application remains pending.
2. **Given** a new onboarding submission, **When** privacy consent recording
   fails, **Then** the profile is not left completed without the required
   consents.
3. **Given** a team creation request, **When** captain membership creation fails,
   **Then** the team is not left without its captain membership.

---

### User Story 4 - Maintain Reproducible Quality Gates (Priority: P2)

As a maintainer, I need local scripts and CI to run the intended type-checking,
testing, and formatting tools so regressions are caught consistently.

**Why this priority**: The current tooling review found a placeholder TypeScript
CLI package and missing explicit CI type-checking.

**Independent Test**: Run the documented quality commands locally and inspect CI
configuration to confirm the same type-checking gate exists.

**Acceptance Scenarios**:

1. **Given** a clean dependency install, **When** the type-check script runs,
   **Then** it invokes the real TypeScript compiler.
2. **Given** a pull request, **When** CI runs, **Then** it includes an explicit
   type-check step.
3. **Given** a developer reading package metadata, **When** they inspect the
   package name, **Then** it identifies TeamFinder rather than boilerplate.

---

### User Story 5 - Validate Required Runtime Configuration (Priority: P3)

As a deployer, I need required runtime configuration to be validated and
documented so map and geocoding features fail early when misconfigured.

**Why this priority**: Mapbox configuration is documented and used, but not part
of typed environment validation.

**Independent Test**: Start environment validation with and without Mapbox
configuration and verify the app reports configuration errors consistently.

**Acceptance Scenarios**:

1. **Given** Mapbox configuration is missing, **When** runtime environment
   validation runs, **Then** the system reports the missing required setting.
2. **Given** Mapbox configuration is present, **When** maps or geocoding read
   configuration, **Then** they use the typed environment source.

### Edge Cases

- Duplicate application acceptance or existing team membership must not mark the
  application accepted unless membership is valid.
- Export requests must not include another user's consents due to an incorrect
  relation filter.
- User deletion must account for both sent and received messages or rely on
  database cascades that actually cover both relationships.
- Logging changes must preserve enough operational context to debug failures
  without storing personal payloads.
- Quality commands must work in CI and be documented even when local Corepack
  cache behavior differs by environment.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST prevent non-admin users from creating trusted verified
  bowling-center records.
- **FR-002**: System MUST preserve or route legitimate community center changes
  through the existing suggestion-review workflow rather than auto-verifying
  them.
- **FR-003**: System MUST export privacy consent records by the authenticated
  user's application user ID.
- **FR-004**: System MUST include both sent and received direct messages in the
  authenticated user's data export.
- **FR-005**: System MUST avoid logging full onboarding payloads, email
  addresses, USBC member IDs, message bodies, and comparable personal data in
  normal server logs.
- **FR-006**: System MUST make application response updates and roster
  membership insertion atomic.
- **FR-007**: System MUST make onboarding profile creation, privacy consent
  creation, and user privacy-field updates atomic.
- **FR-008**: System MUST make team creation and captain membership creation
  atomic.
- **FR-009**: System MUST provide an unambiguous local type-check script that
  invokes the real TypeScript compiler.
- **FR-010**: System MUST run the type-check script in the standard CI check
  workflow.
- **FR-011**: System MUST remove boilerplate package identity that conflicts with
  the TeamFinder application name.
- **FR-012**: System MUST validate required Mapbox configuration through the
  typed environment layer and keep sample env documentation aligned.
- **FR-013**: System MUST include targeted automated regression coverage for the
  security, data-export, and transaction-safety changes.

### Key Entities *(include if feature involves data)*

- **Bowling Center**: Directory record for a bowling center, including verified
  status and admin-created trust signals.
- **User Data Export**: Downloadable package of the authenticated user's profile,
  privacy settings, team memberships, messages, activities, and consent history.
- **Player Application**: Request by a player to join a team, with review status
  and optional roster side effect.
- **Team Membership**: User-to-team relationship that must be consistent with
  team creation and application acceptance.
- **Privacy Consent**: User-specific record of accepted privacy, terms, cookie,
  or marketing consent.
- **Runtime Configuration**: Required deployment settings needed for database,
  authentication, email, and Mapbox-backed features.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Non-admin verified center creation attempts produce zero new
  verified center records in automated tests.
- **SC-002**: Data export tests prove privacy consents are filtered by the
  authenticated user and include both sent and received messages.
- **SC-003**: Transaction tests or route tests demonstrate failed downstream
  writes leave application, onboarding, and team state unchanged.
- **SC-004**: Automated quality checks include type-checking and targeted tests
  for the changed security/data paths.
- **SC-005**: Static search of changed runtime routes finds no remaining normal
  logs of full onboarding payloads, direct recipient emails, or message bodies.

## Assumptions

- Existing Clerk authentication and admin permission helpers remain the source of
  authorization decisions.
- Community bowling center edits should continue through suggestion review
  rather than authenticated users creating verified records directly.
- Existing PostgreSQL constraints and cascades may be used, but code must not
  assume cascades cover relationships that the schema does not define.
- The work is scoped to hardening existing behavior, not redesigning the admin
  panel, privacy UI, or email delivery system.
