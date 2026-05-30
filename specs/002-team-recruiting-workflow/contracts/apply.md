# Contract: Apply to Team

## Purpose

Allow an authenticated eligible player to submit an application to a recruiting team.

## Request

`POST /api/teams/{teamId}/apply`

```json
{
  "coverLetter": "Optional message from the player to the captain"
}
```

## Success Response

`201 Created`

```json
{
  "success": true,
  "application": {
    "id": "application-id",
    "teamId": "team-id",
    "applicantUserId": "user-id",
    "status": "pending",
    "coverLetter": "Optional message from the player to the captain",
    "createdAt": "2026-05-30T00:00:00.000Z"
  }
}
```

## Error Responses

- `401 Unauthorized`: Viewer is not signed in.
- `404 Not Found`: User or team cannot be found.
- `400 Bad Request`: Team is not recruiting, viewer is the captain, viewer is already a team member, viewer already has a pending application, or request body is invalid.
- `500 Internal Server Error`: Application could not be submitted.

## UI Contract

- Eligible player sees an apply control on the team detail page.
- Ineligible player sees a reason-specific unavailable or status state.
- Successful submission changes the UI to pending status without requiring the user to resubmit.
- Email delivery failure does not change the success response.
