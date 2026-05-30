# Contract: Trusted Bowling Center Creation

## Endpoint

`POST /api/admin/centers`

## Actors

- Authorized admin with `create_centers` permission.
- Unauthenticated or non-admin users must be rejected before mutation.

## Request

Required center identity and location fields:
- `name`
- `address`
- `city`
- `state`
- `zipCode`

Optional operational fields:
- `phoneNumber`
- `website`
- `laneCount`
- `isVerified`

## Responses

- `200`: center created successfully with returned center payload.
- `401`: no authenticated user.
- `403` or permission error response: authenticated user lacks
  `create_centers`.
- `400`: required fields missing or invalid.

## Invariants

- Non-admin requests create zero trusted center records.
- Public `/api/bowling-centers` must not provide an alternate verified creation
  path.
