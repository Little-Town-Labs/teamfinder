# Data Model: Team Recruiting Workflow

## Team

Represents a bowling team that may or may not be recruiting.

**Relevant fields**:

- `id`
- `name`
- `captainId`
- `lookingForPlayers`
- `openPositions`
- `currentRosterSize`
- `maxRosterSize`
- `description`

**Validation rules**:

- A team must be active and recruiting before an outside player can submit an application.
- A team with no open roster capacity should not accept new applicants.
- Only the captain can review applications for that team.

## Player Application

Represents a player's request to join a team.

**Relevant fields**:

- `id`
- `teamId`
- `applicantUserId`
- `status`: `pending`, `accepted`, or `declined`
- `coverLetter`
- `message`
- `reviewedByUserId`
- `reviewedAt`
- `createdAt`
- `updatedAt`

**State transitions**:

- New application starts as `pending`.
- `pending` can become `accepted` when the captain accepts.
- `pending` can become `declined` when the captain declines.
- Processed applications cannot be processed again.

**Validation rules**:

- A player can have at most one pending application per team.
- A captain cannot apply to their own team.
- A current member cannot apply to the same team.
- Application cover letters are optional but should be bounded to a reasonable UI/API length.

## Team Member

Represents a user's roster membership on a team.

**Relevant fields**:

- `id`
- `teamId`
- `userId`
- `role`
- `joinedAt`
- `leftAt`

**Validation rules**:

- Accepting an application creates one active roster membership for the applicant.
- The application acceptance and roster membership creation are one atomic user-visible operation.
- Duplicate team membership must be prevented.

## User

Represents an authenticated TeamFinder user.

**Relevant fields**:

- `id`
- `clerkUserId`
- `firstName`
- `lastName`
- `email`
- `imageUrl`

**Validation rules**:

- The Clerk user must map to a local user before applying or reviewing.
- Applicant email and cover-letter content must not be exposed outside authorized applicant/captain views.
