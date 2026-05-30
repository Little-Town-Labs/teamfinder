# Quickstart: Team Recruiting Workflow

## Prerequisites

- Install dependencies with `pnpm install`.
- Configure `.env.local` with database and Clerk credentials.
- Ensure at least two users exist:
  - one team captain
  - one eligible player who is not on the captain's team
- Ensure the captain owns a team with `lookingForPlayers=true` and open roster capacity.

## Manual Validation

1. Sign in as the eligible player.
2. Open `/teams/browse` and navigate to the recruiting team detail page.
3. Submit an application with a short cover message.
4. Confirm the page shows pending status and does not allow a duplicate pending application.
5. Sign out and sign in as the team captain.
6. Open the same team detail page.
7. Confirm the pending application appears in the captain review panel with applicant details and message.
8. Accept the application.
9. Confirm the applicant appears in the team roster and the pending application disappears.
10. Repeat with another applicant and decline the application to confirm the declined path.

## Automated Validation

Run focused tests and quality gates:

```bash
COREPACK_HOME=/tmp/corepack pnpm run test -- app/api/teams/[teamId]/apply/route.test.ts app/api/applications/[applicationId]/respond/route.test.ts --run
COREPACK_HOME=/tmp/corepack pnpm run type-check
COREPACK_HOME=/tmp/corepack pnpm run lint
COREPACK_HOME=/tmp/corepack pnpm run build
```

## Expected Outcomes

- Eligible players can apply from team details.
- Captains can accept and decline pending applications.
- Non-captains cannot access captain review actions.
- Duplicate pending applications are blocked.
- Application acceptance and roster membership remain consistent.
