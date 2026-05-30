<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- [PRINCIPLE_1_NAME] -> I. Authorization Before Mutation
- [PRINCIPLE_2_NAME] -> II. User Data Accuracy And Privacy
- [PRINCIPLE_3_NAME] -> III. Atomic State Changes
- [PRINCIPLE_4_NAME] -> IV. Verified Quality Gates
- [PRINCIPLE_5_NAME] -> V. Configuration And Tooling Reproducibility
Added sections:
- Product And Compliance Constraints
- Development Workflow
Removed sections:
- Template placeholder sections
Templates requiring updates:
- ✅ .specify/templates/plan-template.md reviewed; generic Constitution Check section is compatible
- ✅ .specify/templates/spec-template.md reviewed; mandatory scenarios and requirements are compatible
- ✅ .specify/templates/tasks-template.md reviewed; task format supports principle-driven work
Follow-up TODOs:
- None
-->
# TeamFinder Constitution

## Core Principles

### I. Authorization Before Mutation
Any route or workflow that creates, verifies, moderates, exports, deletes, or
changes user-visible data MUST enforce the narrowest existing permission before
performing the mutation. Public and authenticated-user APIs MUST NOT bypass
admin role checks when the result is trusted, verified, or moderation-sensitive.

### II. User Data Accuracy And Privacy
User-facing exports, privacy controls, and account deletion flows MUST be
complete for the data they claim to handle and MUST avoid leaking personal data
through logs or error responses. Logs MAY identify operation classes and opaque
record IDs, but MUST NOT include full form payloads, email addresses, USBC IDs,
message bodies, or other personal profile details unless an explicit audit
requirement documents the need.

### III. Atomic State Changes
Multi-step operations that represent one user-visible outcome MUST be
transactional. If any required write fails, the system MUST leave the database in
the previous consistent state. Examples include team creation plus captain
membership, onboarding profile plus consent records, and application acceptance
plus roster membership.

### IV. Verified Quality Gates
Every behavior change MUST include focused automated coverage when the code path
has security, privacy, or data-integrity impact. Before delivery, at minimum the
TypeScript check and relevant unit or route tests MUST pass, or the exception
MUST be documented with the exact blocker and residual risk.

### V. Configuration And Tooling Reproducibility
Required runtime configuration MUST be represented in the typed environment
schema and documented in sample env files. Project scripts and CI MUST invoke
the intended local tools without ambiguous placeholder packages or boilerplate
names that obscure the application identity.

## Product And Compliance Constraints

TeamFinder is a Next.js application for bowling teams, player profiles,
messages, bowling centers, and admin moderation. The system handles personal
profile data and privacy-rights workflows, so changes in this area MUST preserve
GDPR/CCPA-style access and deletion expectations. Clerk remains the
authentication source of truth, Drizzle/PostgreSQL remains the application data
store, and existing admin permission helpers are the preferred authorization
surface.

## Development Workflow

Spec Kit artifacts MUST be kept in sync with implementation for multi-file
security, privacy, data, and tooling changes. Work should proceed from
specification to implementation plan to task list, then implementation and
verification. Existing user changes in the working tree MUST be preserved unless
the user explicitly requests cleanup.

## Governance

This constitution governs feature planning, task generation, implementation, and
review for TeamFinder. Amendments require updating this file, documenting the
version change in the Sync Impact Report, and checking dependent Spec Kit
templates for alignment.

Versioning follows semantic versioning:
- MAJOR for incompatible governance changes or removed principles.
- MINOR for new principles or materially expanded required practices.
- PATCH for clarifications that do not change obligations.

All feature plans MUST include a Constitution Check and either pass these gates
or explicitly document justified violations before implementation.

**Version**: 1.0.0 | **Ratified**: 2026-05-30 | **Last Amended**: 2026-05-30
