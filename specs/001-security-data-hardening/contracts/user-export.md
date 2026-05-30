# Contract: User Data Export

## Endpoint

`GET /api/user/export-data`

## Actors

- Authenticated user requesting their own data.

## Response Shape

The response is a JSON download containing:
- export metadata
- personal information
- privacy settings
- bowling profile
- team memberships
- sent and received messages
- activity history
- privacy consents

## Invariants

- Every record must belong to the authenticated application user.
- Privacy consents must filter on the consent `userId`.
- Messages must include both sent and received messages without including
  unrelated users' messages.
- Unauthenticated requests return `401`.
