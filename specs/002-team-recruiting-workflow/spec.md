# Feature Specification: Team Recruiting Workflow

**Feature Branch**: `002-team-recruiting-workflow`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Team recruiting workflow UI: players can apply to recruiting teams from team details, captains can review pending applications, accept or decline them, and both sides get clear status feedback using the existing application APIs and email hooks."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Apply to a Recruiting Team (Priority: P1)

An authenticated player browsing a team that is actively recruiting can submit an application with an optional message and immediately see whether the application was sent.

**Why this priority**: This is the smallest user-facing slice that turns team listings into an actionable recruiting flow.

**Independent Test**: Can be fully tested by signing in as a non-captain player, opening a recruiting team detail page, submitting an application, and confirming the player sees a submitted state while duplicate applications are prevented.

**Acceptance Scenarios**:

1. **Given** an authenticated player who is not already on the team and has no pending application, **When** the player opens a recruiting team detail page, **Then** the page presents an application action.
2. **Given** the player enters a cover message and submits the application, **When** the application is accepted by the system, **Then** the player sees confirmation and the team no longer presents another pending application action.
3. **Given** the player already has a pending application for the team, **When** the player opens the team detail page, **Then** the page shows the pending application status instead of a duplicate submit action.

---

### User Story 2 - Review Team Applications as Captain (Priority: P1)

A team captain can see pending player applications for their team, read applicant details and messages, and accept or decline each application with clear feedback.

**Why this priority**: Applications only create value if captains can act on them without admin help or database access.

**Independent Test**: Can be fully tested by signing in as a team captain with at least one pending application, reviewing the application list, accepting one applicant, and confirming that the applicant becomes a team member while the application leaves the pending queue.

**Acceptance Scenarios**:

1. **Given** an authenticated captain viewing their own team, **When** the team has pending applications, **Then** the captain can see the applicant names, submitted messages, and submission timing.
2. **Given** a pending application, **When** the captain accepts it, **Then** the application is marked accepted, the applicant is added to the roster, and the captain sees confirmation.
3. **Given** a pending application, **When** the captain declines it, **Then** the application is marked declined and removed from the pending queue.

---

### User Story 3 - Communicate Application Status (Priority: P2)

Players and captains receive clear in-product status feedback throughout application submission and review so they understand what happened and what action is still available.

**Why this priority**: Status clarity reduces duplicate submissions and support confusion once the core application and review paths exist.

**Independent Test**: Can be tested by moving applications through pending, accepted, and declined states and verifying the appropriate empty, pending, success, and unavailable states appear to each actor.

**Acceptance Scenarios**:

1. **Given** a team has no pending applications, **When** the captain views the application review area, **Then** the page displays an empty state rather than a blank section.
2. **Given** an application was accepted or declined, **When** the applicant revisits the team detail page, **Then** the page shows a status appropriate to that outcome and does not invite another pending application unless the business rules allow it.
3. **Given** an application action fails, **When** the user remains on the page, **Then** the user sees a recoverable error state and can retry when appropriate.

### Edge Cases

- A player attempts to apply to a team that is not recruiting.
- A team captain attempts to apply to their own team.
- A current team member attempts to apply to the team again.
- A player submits twice from separate browser tabs.
- A captain attempts to review an application for a team they do not captain.
- A captain accepts an application after the team roster has reached capacity.
- An email notification fails after the application action succeeds.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST show an application action on recruiting team detail pages for eligible authenticated players.
- **FR-002**: The system MUST hide or disable the application action for captains, current team members, teams that are not recruiting, and players with an existing pending application.
- **FR-003**: Players MUST be able to submit an application with an optional cover message.
- **FR-004**: The system MUST provide clear success and error feedback after application submission.
- **FR-005**: The system MUST prevent duplicate pending applications for the same player and team.
- **FR-006**: Captains MUST be able to view pending applications for teams they captain.
- **FR-007**: Application review information MUST include applicant identity, submitted message, and submitted date.
- **FR-008**: Captains MUST be able to accept a pending application.
- **FR-009**: Accepting an application MUST add the applicant to the team roster and mark the application accepted.
- **FR-010**: Captains MUST be able to decline a pending application and mark it declined.
- **FR-011**: The system MUST not allow non-captains to view or act on another team's application review controls.
- **FR-012**: The system MUST show empty states when no captain review actions are available.
- **FR-013**: The system MUST keep email notification failures non-blocking when the underlying application action succeeds.
- **FR-014**: The system MUST expose the workflow through existing team pages or dashboard surfaces without requiring a separate admin workflow.

### Key Entities _(include if feature involves data)_

- **Team**: A bowling team with recruiting status, roster limits, captain ownership, and current roster state.
- **Player Application**: A player's request to join a team, including applicant, team, status, optional message, response timestamp, and creation timestamp.
- **Team Member**: A roster entry connecting an accepted player to a team with a role.
- **User**: An authenticated person acting as applicant, captain, or current team member.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: An eligible player can submit an application from a team detail page in under 90 seconds.
- **SC-002**: A captain can review and accept or decline a pending application in under 60 seconds from the team surface.
- **SC-003**: Duplicate pending applications are prevented in 100% of tested same-player same-team submissions.
- **SC-004**: Accepted applicants appear in the team roster immediately after captain acceptance.
- **SC-005**: Users receive visible feedback for successful and failed application actions in every primary scenario.

## Assumptions

- The existing authentication system, team data, application data, roster data, application APIs, and email templates remain in use.
- The first implementation focuses on applications and captain review; team invitations and full messaging can follow as separate slices.
- Players must be signed in to apply.
- Captains review applications from team-owned surfaces rather than a global admin panel.
- Email delivery improves the workflow but must not determine whether an application action succeeds.
