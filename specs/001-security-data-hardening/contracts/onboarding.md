# Contract: Onboarding Completion

## Endpoint

`POST /api/onboarding`

## Actors

- Authenticated user completing player onboarding.

## Invariants

- Profile creation, privacy consent rows, and user privacy fields are one atomic
  database change.
- Duplicate USBC member IDs are rejected.
- Full submitted payload is not written to normal server logs.
- Welcome email failure does not roll back a successfully committed onboarding
  transaction.
