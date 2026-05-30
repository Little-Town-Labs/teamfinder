# Research: Security And Data Hardening

## Decision: Reuse Existing Admin Permission Helpers

Use `requirePermission(adminClerkUserId, "create_centers")` for trusted center
creation instead of introducing a new authorization path.

**Rationale**: The admin API already uses the helper and the constitution
requires narrow existing permissions before trusted mutations.

**Alternatives considered**:
- Check Clerk metadata directly: rejected because it duplicates and weakens the
  existing permission model.
- Keep authenticated-user creation and mark records unverified: rejected for this
  fix bundle because community edits already have a suggestion workflow.

## Decision: Prefer Drizzle Transactions For Multi-Step Writes

Use `db.transaction` for application response, onboarding, and team creation.

**Rationale**: These workflows produce a single user-visible outcome and must not
leave partial records if a later write fails.

**Alternatives considered**:
- Rely on database constraints alone: rejected because the application can still
  mark status fields before a later write fails.
- Add compensating cleanup after failures: rejected because transactions are
  simpler and more reliable.

## Decision: Keep Email Sending Outside Database Transactions

Commit database state first, then attempt notification emails with sanitized
logging.

**Rationale**: Email delivery is external and already non-blocking in the app.
Transactions should cover database consistency, not external notification
availability.

**Alternatives considered**:
- Send email inside transaction: rejected because slow or failing external calls
  would hold database transactions open.
- Fail user action when email fails: rejected because existing product behavior
  treats notification failure as non-fatal.

## Decision: Fix TypeScript Tooling By Removing Placeholder `tsc`

Remove the `tsc` package and add a `type-check` script that invokes the real
TypeScript compiler.

**Rationale**: The placeholder package shadows `typescript`'s compiler binary in
this install, making local type-checking ambiguous.

**Alternatives considered**:
- Use `node node_modules/typescript/bin/tsc` forever: rejected because scripts
  should be conventional and work after a clean install.

## Decision: Validate Mapbox Through Typed Env

Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `env.mjs` and switch map/geocoding reads to
the typed `env` export.

**Rationale**: The token is documented and required for map/geocoding behavior,
so it should fail early like other required runtime settings.

**Alternatives considered**:
- Keep ad hoc `process.env` reads: rejected because it permits drift between
  docs and runtime validation.
