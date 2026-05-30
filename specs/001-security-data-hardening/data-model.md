# Data Model: Security And Data Hardening

## Existing Entities

### Bowling Center

- Represents a bowling-center directory entry.
- Relevant fields: name, address, city, state, zip code, latitude, longitude,
  verified status, added-by user, last-verified metadata.
- Validation: trusted creation requires admin `create_centers` permission.
- State transition: untrusted community edits remain suggestions; trusted
  verified centers are created only by admins.

### User Data Export

- Represents a downloadable snapshot for the authenticated user.
- Contains personal information, privacy settings, bowling profile, team
  memberships, messages, activity history, and privacy consent history.
- Validation: every included record must be tied to the authenticated
  application user.

### Privacy Consent

- Represents a user's acceptance/rejection of privacy, terms, cookie, or
  marketing consent.
- Relevant relationship: `privacyConsents.userId` references `users.id`.
- Export rule: filter by `privacyConsents.userId`, not unrelated user table
  fields.

### Message

- Represents direct communication between two users.
- Relevant relationships: sender user and recipient user.
- Export rule: include sent and received messages for the authenticated user.
- Deletion rule: deletion must remove or cascade both sent and received messages.

### Player Application

- Represents a request to join a team.
- Relevant fields: team, applicant, status, reviewed-by user, reviewed-at,
  response message.
- State transition: `pending -> accepted` only succeeds atomically with team
  membership creation; `pending -> declined` updates review fields only.

### Team Membership

- Represents a user roster entry for a team.
- Relevant fields: team, user, role, joined-at, left-at.
- Constraint: a user/team pair must not be duplicated.
- State transition: application acceptance creates membership as part of the
  same transaction as the application status update.

### Runtime Configuration

- Represents required deployment settings.
- Relevant values: database URL, Clerk keys/secrets, Resend API key, Mapbox
  public token, optional bundle analyzer flag.
- Validation: required values must be present in typed env schema and examples.
