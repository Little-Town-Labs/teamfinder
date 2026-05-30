# Contract: Review Team Applications

## Purpose

Allow a team captain to review pending applications for their own team and accept or decline each applicant.

## Pending Applications Surface

The team detail page for a captain-owned team displays pending applications.

Each application item includes:

- application id
- applicant display name
- applicant avatar when available
- submitted cover letter when provided
- submitted date
- accept action
- decline action

## Respond Request

`POST /api/applications/{applicationId}/respond`

```json
{
  "status": "accepted",
  "message": "Optional response note"
}
```

or

```json
{
  "status": "declined",
  "message": "Optional response note"
}
```

## Success Response

`200 OK`

```json
{
  "success": true,
  "application": {
    "id": "application-id",
    "status": "accepted",
    "reviewedByUserId": "captain-user-id",
    "reviewedAt": "2026-05-30T00:00:00.000Z"
  }
}
```

## Error Responses

- `401 Unauthorized`: Viewer is not signed in.
- `403 Forbidden`: Viewer is not the team captain.
- `404 Not Found`: Application, team, applicant, or reviewer cannot be found.
- `400 Bad Request`: Application has already been processed, team is full, applicant is already on the roster, or request body is invalid.
- `500 Internal Server Error`: Application could not be reviewed.

## UI Contract

- Only captains see the review panel for their own teams.
- Empty pending queues show an empty state.
- Accepting a player updates the application state and team roster.
- Declining a player removes the item from the pending queue.
- Failed actions show recoverable error feedback without losing the current queue.
