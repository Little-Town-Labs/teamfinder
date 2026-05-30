# Research: Team Recruiting Workflow

## Decision: Scope the first slice to applications and captain review

**Rationale**: The application routes, application schemas, roster schemas, and email templates already exist. Completing the player apply and captain review loop delivers the core marketplace value with less surface area than adding invitations and messaging at the same time.

**Alternatives considered**:

- Include invitations and messaging in the first slice. Rejected because it would expand the workflow, state surfaces, and notification cases before the basic application loop is validated.
- Build a separate recruiting dashboard first. Rejected because team detail pages already anchor the user's team discovery and captain ownership context.

## Decision: Reuse existing application routes and harden behavior in place

**Rationale**: `POST /api/teams/[teamId]/apply` and `POST /api/applications/[applicationId]/respond` already encode the core writes and email hooks. Reusing them avoids creating parallel APIs and keeps the feature focused on missing UI plus any route-level integrity gaps discovered during implementation.

**Alternatives considered**:

- Create new route names for the UI. Rejected because it duplicates existing contracts.
- Move all logic into server actions. Rejected for this slice because existing route tests and API contracts already exist.

## Decision: Query application status from the team detail page

**Rationale**: The user needs context-sensitive state on `/teams/[id]`: eligible to apply, pending, accepted, declined, captain review, or unavailable. Computing this state server-side keeps protected data off unauthorized client fetches and gives the page a single consistent initial render.

**Alternatives considered**:

- Fetch all status client-side after page load. Rejected because it delays important eligibility state and increases the chance of transient duplicate actions.
- Create a separate player applications page first. Rejected because the first user action starts from team discovery.

## Decision: Preserve email failure as non-blocking

**Rationale**: Application submission and review are durable in the database. Email failures should be visible in logs for operations but must not roll back successful recruiting actions.

**Alternatives considered**:

- Fail the action if email fails. Rejected because it couples core workflow success to external delivery reliability.

## Decision: Add focused tests around route integrity and state rendering

**Rationale**: The feature touches authorization, personal messages, and roster membership. Route tests catch the highest-risk behavior: duplicate prevention, captain-only review, capacity/member edge cases, and transactional acceptance.

**Alternatives considered**:

- Only perform manual browser testing. Rejected because the constitution requires focused automated coverage for data-integrity and authorization changes.
