# Contract: Team Application Response

## Endpoint

`POST /api/applications/[applicationId]/respond`

## Actors

- Team captain for the application team.

## Request

- `status`: `accepted` or `declined`
- `message`: optional captain response

## Invariants

- Only the team captain may respond.
- Only pending applications may be processed.
- Accepting an application updates the application and creates the team
  membership atomically.
- If membership creation fails, the application remains pending.
- Declining an application does not create membership.
