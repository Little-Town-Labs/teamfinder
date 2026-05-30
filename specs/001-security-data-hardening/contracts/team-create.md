# Contract: Team Creation

## Endpoint

`POST /api/teams/create`

## Actors

- Authenticated user creating a team for themselves.

## Invariants

- The request user ID must match the authenticated application user.
- Team creation and captain membership insertion are atomic.
- If captain membership insertion fails, no team remains.
- Activity logging should not create a partially valid team if it is required for
  the product event; otherwise failures must be non-fatal and explicit.
