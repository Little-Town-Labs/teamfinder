# Claude Development Notes

This document tracks the work completed by Claude on the TeamFinder project.

## Project Overview

TeamFinder is a bowling team finder application built with Next.js 15, featuring:
- Team creation and management
- Player profiles with affiliations
- League management
- Bowling center directory with interactive maps
- Activity feed system
- Admin panel for content moderation

## Recent Work Completed

### Bowling Center Directory (December 2024) ✅

**Status:** All 6 phases complete and production-ready

A comprehensive bowling center directory with browse/search, interactive Mapbox maps with Supercluster clustering, proximity search using Haversine formula, user edit suggestions, and admin review workflow. Implemented across 6 phases with full integration into the TeamFinder ecosystem.

**Key Features:**
- Browse and search centers with filters (city, state, verified status)
- Interactive Mapbox maps with marker clustering (75px radius, max zoom 16)
- Geolocation proximity search (10/25/50/100 mile radius)
- Distance calculation and sorting
- User-submitted edit suggestions with admin approval workflow
- Full CRUD operations for admins
- Loading skeletons, error boundaries, and toast notifications
- Mobile-responsive design with dark mode support

**Key Technologies:**
- Mapbox GL JS + react-map-gl for interactive maps
- Supercluster for efficient marker clustering (50+ centers)
- Haversine formula for distance calculations
- SSR-safe map loading with `next/dynamic`

**Database Schema:**
- `center_edit_suggestions` table for user-submitted edits
- Enhanced `bowling_centers` with verification fields and geospatial indexes
- Relations to teams, leagues, and player profiles

**API Endpoints:** 10 routes (6 public, 4 admin)
**UI Pages:** 7 pages (3 public browse/detail, 4 admin CRUD)
**Components:** 12 components (maps, filters, forms, modals)

**Field Name Transformations:**
- API/Form: `phoneNumber`, `laneCount`, `isVerified`
- Database: `phone`, `numberOfLanes`, `verified`
- Transformation handled in admin forms and API routes

**📚 Complete Implementation Details:**
See [`docs/bowling-center-directory-plan.md`](./docs/bowling-center-directory-plan.md) for:
- Full 6-phase breakdown with technical specifications
- Implementation retrospective and lessons learned
- Performance metrics and optimization strategies
- Future enhancement roadmap (ratings, photos, analytics)

---

### Full-Featured Admin Panel (December 2024) ✅

**Status:** All 5 phases complete with Clerk-first architecture

A comprehensive admin panel with role-based access control, content moderation, analytics dashboards, and complete audit logging. Implemented across 5 phases with ~2.5 weeks of development time saved by leveraging Clerk's built-in user management APIs.

**Clerk-First Architecture Decision:**
Integrated Clerk APIs for user ban/lock/unlock operations and role management, avoiding custom authentication system implementation. Custom implementation focused on granular permissions (20+), reports workflow, audit logging, and analytics.

**4 Admin Roles:**
- `super_admin` - Full system access, can manage other admins
- `moderator` - User & team moderation, content management
- `content_reviewer` - Review reports and content only
- `support` - Read-only access for customer support

**Key Features:**
- **User Management** - Ban/lock/unlock via Clerk API, USBC verification, profile editing
- **Team Moderation** - Flag/unflag teams, full CRUD operations
- **Reports System** - User-submitted reports with 4 statuses (pending/investigating/resolved/dismissed)
- **Bowling Center Management** - Full CRUD, edit suggestion review
- **Analytics Dashboard** - Recharts visualizations (user growth, team stats, reports), CSV export
- **Audit Logs** - Complete audit trail with search, filtering, and export (IP, user agent tracking)
- **Admin Settings** - Role assignment/revocation, admin activity tracking

**Database Schema:**
- `admin_roles`, `permissions`, `role_permissions` - RBAC system
- `reports` - Content moderation workflow
- `admin_actions` - Audit trail (never deleted)
- Enhanced `users`, `teams`, `bowling_centers` with moderation fields

**Permission Categories:**
User management, team management, centers, reports, analytics, audit logs, admin management (20+ total permissions)

**Security:**
- Multi-layer authorization (middleware → layout → API → components)
- Zod validation, CSRF protection
- Complete audit trail with IP/user agent logging

**TypeScript & Build:**
- 26+ strict mode errors resolved across 50+ files
- All `any` types eliminated
- Clerk server/client import separation
- Proper type assertions for JSON responses

**📚 Complete Documentation:**
- [`docs/admin-panel-guide.md`](./docs/admin-panel-guide.md) - User guide (9,500+ words)
- [`docs/admin-permissions-reference.md`](./docs/admin-permissions-reference.md) - Permission system (8,000+ words)
- [`docs/admin-panel-implementation-summary.md`](./docs/admin-panel-implementation-summary.md) - Technical details (8,500+ words)

---

### Email Workflow APIs (December 2024) ✅

**Status:** Complete implementation with React Email integration

A complete email notification system for team collaboration: team invitations with 14-day expiry, player applications with cover letters, application responses with auto-roster updates, and direct messaging. All workflows include professional email notifications via React Email templates.

**4 Key API Routes:**
1. **Team Invitations** (`POST /api/teams/[teamId]/invite`) - Captains invite players, 14-day expiry, duplicate prevention
2. **Player Applications** (`POST /api/teams/[teamId]/apply`) - Players apply with cover letters, captain notifications
3. **Application Responses** (`POST /api/applications/[applicationId]/respond`) - Accept/decline with auto-roster updates
4. **Direct Messaging** (`POST /api/messages`) - User-to-user messaging with email notifications (100 char preview)

**Implementation:**
- 447 lines across 4 files
- Zod validation for all request bodies
- Atomic database operations with Drizzle ORM
- Email failures isolated (don't break core operations)
- Duplicate prevention for invitations/applications
- React Email templates: `teamInvitation()`, `applicationReceived()`, `applicationStatusUpdate()`, `messageNotification()`

**Business Logic:**
- Only captains can send team invitations
- Accepting application auto-adds player to `team_members` table
- Self-messaging prevention
- Invitation expiry tracking (14 days)
- Review metadata (reviewedBy, reviewedAt)

**TypeScript Fixes:**
- Fixed `captainUserId` → `captainId` field name mismatch
- Non-null assertions for `.returning()` results

**Future Enhancements:**
Invitation management UI, application dashboard, message inbox with threading, push notifications, batch invitations

---

*Last updated: January 2, 2026*
*AI Assistant: Claude Sonnet 4.5*
