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

### Bowling Center Directory (December 2024)

A comprehensive bowling center directory feature was implemented across 6 phases, providing users with the ability to browse, search, and suggest edits to bowling center information.

#### ✅ Phase 1: Core Directory

**Database Schema:**
- Created `centerEditSuggestions` table for tracking user-submitted edits
- Added relations between bowling centers, teams, leagues, and player profiles
- Added indexes for city, state, zipCode, and geospatial queries
- Implemented full-text search capabilities

**API Routes:**
- `GET /api/bowling-centers` - List/search/filter centers with pagination
- `GET /api/bowling-centers/[id]` - Get single center with related data
- `POST /api/bowling-centers` - Create center (admin only)

**UI Components:**
- Browse page with filters (city, state, search)
- Center cards with verified badges
- Detail page with contact info, facility details, and activity stats
- Integration with teams, leagues, and player data

**Files Created:**
- `app/bowling-centers/browse/page.tsx`
- `app/bowling-centers/browse/BrowseCentersClient.tsx`
- `app/bowling-centers/browse/CenterFilters.tsx`
- `app/bowling-centers/browse/CenterList.tsx`
- `app/bowling-centers/[id]/page.tsx`
- `app/bowling-centers/[id]/CenterDetailClient.tsx`
- `drizzle/schema/center-edit-suggestions.ts`

#### ✅ Phase 2: Map Integration

**Dependencies Added:**
- `mapbox-gl@^3.17.0`
- `react-map-gl@^8.1.0`
- `supercluster@^8.0.1`

**Features:**
- Interactive Mapbox map with center markers
- User location marker
- Click-to-view popups with center info
- Auto-fit bounds to display all centers
- Navigation controls
- Dark mode support
- Marker clustering for 50+ centers using Supercluster

**Map Components:**
- `app/bowling-centers/browse/CenterMap.tsx` - Browse map with clustering
- `app/bowling-centers/[id]/CenterDetailMap.tsx` - Single center map
- `app/bowling-centers/[id]/CenterDetailMapWrapper.tsx` - SSR-safe wrapper

#### ✅ Phase 3: Proximity Search

**Features:**
- "Use my location" geolocation integration
- Radius filter (10/25/50/100 miles)
- Distance calculation using Haversine formula
- Distance badges on center cards
- Sort by distance

**Utilities:**
- `lib/geo-utils.ts` - Distance calculation and geocoding functions

#### ✅ Phase 4: User Edit Suggestions

**API Route:**
- `POST /api/bowling-centers/[id]/suggest-edit` - Submit edit suggestions

**UI Components:**
- `app/bowling-centers/[id]/SuggestEditModal.tsx` - Form for suggesting edits
- Pre-filled with current values
- Diff highlighting for changed fields
- Notes field for justification

**Activity Logging:**
- Logs when users suggest edits
- Logs when admins approve/reject suggestions

#### ✅ Phase 5: Admin Review Panel

**Access Control:**
- Role-based access via Clerk publicMetadata
- Protected `/admin/*` routes in middleware
- Server-side role validation

**API Routes:**
- `GET /api/admin/center-suggestions` - List suggestions by status
- `PUT /api/admin/center-suggestions/[id]` - Approve/reject suggestions

**Admin UI:**
- `app/admin/center-suggestions/page.tsx` - Admin dashboard
- `app/admin/center-suggestions/CenterSuggestionsClient.tsx` - Suggestion list
- `app/admin/center-suggestions/ReviewSuggestionModal.tsx` - Review interface
- Filter by status (pending/approved/rejected)
- Diff view showing current vs. proposed changes
- Approve/reject actions with review notes
- Activity logging for both admin and user

#### ✅ Phase 6: Polish & Optimization

**Performance:**
- Pagination with "Load More" functionality
- Marker clustering on map (Supercluster)
- Database indexes for geospatial queries
- React Cache for API calls

**UX Improvements:**
- Loading skeletons for center cards
- Error boundaries for map components
- Mobile-responsive design
- Dark mode support throughout
- Toast notifications for user actions
- Empty state designs

**Additional Features:**
- Google Maps direction links
- Share center functionality (navigator.share API)
- Print-friendly center detail pages

**Error Handling:**
- Proper HTTP status codes
- User-friendly error messages
- Geolocation permission handling
- Network error retry logic

### TypeScript & Build Fixes

**User Schema Updates:**
- Fixed all references from `user.name` to `user.firstName`/`user.lastName`
- Updated type definitions throughout API routes
- Fixed Drizzle query result handling for potentially undefined arrays

**Map Component Fixes:**
- Resolved `next/dynamic` SSR issues with `CenterDetailMapWrapper`
- Fixed Supercluster type assertions
- Corrected import paths from `react-map-gl` to `react-map-gl/mapbox`

**Files Modified:**
- `app/api/admin/center-suggestions/[id]/route.ts`
- `app/api/admin/center-suggestions/route.ts`
- `app/api/bowling-centers/[id]/route.ts`
- `app/api/bowling-centers/route.ts`
- `app/bowling-centers/[id]/page.tsx`
- `app/bowling-centers/browse/CenterMap.tsx`
- `lib/geo-utils.ts`

## Environment Variables Required

```env
# Mapbox (required for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...

# Database
DATABASE_URL=postgresql://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Base URL (for SSR fetches)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Database Migrations

All schema changes were applied using Drizzle Kit:

```bash
pnpm db:generate  # Generate migration files
pnpm db:push      # Push to database
```

Key tables added:
- `center_edit_suggestions` - User-submitted edit suggestions
- `bowling_centers` - Enhanced with relations

## Testing Checklist

- [x] Browse centers with filters
- [x] View center details with related data
- [x] Interactive map with markers and popups
- [x] Proximity search with geolocation
- [x] Marker clustering on map
- [x] User edit suggestions
- [x] Admin approval workflow
- [x] Mobile responsiveness
- [x] Dark mode support
- [x] Error boundaries
- [x] TypeScript type safety
- [x] Vercel build success

## Future Enhancements (Post-MVP)

See `docs/bowling-center-directory-plan.md` for details:

- Center ratings and reviews
- Photo gallery for centers
- League schedule integration
- Bulk import from CSV
- Advanced amenities filtering
- Analytics dashboard
- Center claim by owners
- Email notifications for approved edits

## Architecture Decisions

1. **Mapbox over Google Maps** - Better pricing, more customization
2. **Supercluster for clustering** - Performant marker clustering library
3. **Hybrid management model** - Admin-created with user suggestions for accuracy
4. **Activity logging** - Complete audit trail for all actions
5. **SSR-safe map loading** - `next/dynamic` with wrapper component for proper hydration

## Performance Notes

- Map components load client-side only (SSR disabled)
- Pagination limits: 20 centers per page
- Cluster radius: 75px, max zoom: 16
- Database queries optimized with proper indexes
- Distance calculations done server-side when possible

## Git Commits

Key commits for this feature:
- `935a64d` - Phase 6: Polish & Optimization
- `67ebcf0` - Update dependencies (Next.js 15.3.8)
- `c817c52` - Fix react-map-gl import paths
- `8f2a098` - Fix TypeScript errors for Vercel build
- `[latest]` - Documentation updates

---

### Full-Featured Admin Panel (December 2024)

A comprehensive admin panel with role-based access control (RBAC), content moderation, analytics, and audit logging was implemented across 5 phases using a Clerk-first architecture.

#### Architecture Decision: Clerk-First Approach

Leveraged Clerk's built-in features to reduce development time by ~2.5 weeks:

**Using Clerk APIs:**
- User ban/lock (permanent/temporary suspension) via `clerkClient.users.banUser()`, `lockUser()`, `unlockUser()`, `unbanUser()`
- Admin role management via Clerk `publicMetadata.role`
- User search via `clerkClient.users.getUserList({ query })`
- Automatic session invalidation on ban/lock

**Custom Implementation:**
- Admin roles tracking table (for audit trail)
- Granular permissions system (20+ permissions)
- Reports system (content moderation workflow)
- Admin actions audit log
- Analytics dashboard
- Admin UI pages
- USBC verification (bowling-specific)

#### ✅ Phase 1: Foundation & Clerk Integration

**Database Schema:**
- `admin_roles` - Admin role tracking with assignment history
- `permissions` - Granular permission definitions (20+ permissions)
- `role_permissions` - Many-to-many role-permission mappings
- `reports` - User-submitted content reports with review workflow
- `admin_actions` - Complete audit trail of all admin actions
- Modified `users` table - Added USBC verification fields only (no status fields)
- Modified `teams` table - Added flaggedForReview, moderationNotes
- Modified `bowling_centers` table - Added flaggedForReview, verification tracking

**Admin Roles:**
- `super_admin` - Full system access, can manage other admins
- `moderator` - User & team moderation, content management
- `content_reviewer` - Review reports and content only
- `support` - Read-only access for customer support

**Permission Categories:**
- User management: view_users, ban_users, lock_users, verify_usbc, edit_user_profiles
- Team management: view_teams, edit_teams, delete_teams, moderate_teams
- Centers: view_centers, create_centers, edit_centers, delete_centers, review_center_suggestions
- Reports: view_reports, resolve_reports, delete_content
- Analytics: view_analytics, export_data
- Audit: view_audit_logs
- Admin: manage_admins

**Core Utilities:**
- `lib/admin/clerk-integration.ts` - Clerk API wrappers for ban/lock/unlock/search/role management
- `lib/admin/permissions.ts` - Permission checking with Clerk integration
- `lib/admin/audit-logger.ts` - Admin action logging functions

**Layout & Navigation:**
- `components/Admin/AdminLayout.tsx` - Collapsible sidebar with role-based navigation
- `app/admin/layout.tsx` - Root admin layout with authentication and permission checks
- Updated `components/Header/Header.tsx` - Added admin panel link for users with admin role

**Files Created (Phase 1):**
- `drizzle/schema/admin-roles.ts`
- `drizzle/schema/permissions.ts`
- `drizzle/schema/reports.ts`
- `drizzle/schema/admin-actions.ts`
- `lib/admin/clerk-integration.ts`
- `lib/admin/permissions.ts`
- `lib/admin/audit-logger.ts`
- `components/Admin/AdminLayout.tsx`
- `app/admin/layout.tsx`

#### ✅ Phase 2: Core Features

**Pages:**
- Dashboard (`app/admin/page.tsx`) - Stats cards, recent activity feed, quick actions, user growth chart
- User Management list (`app/admin/users/page.tsx`) - Clerk user list integration with ban/lock status
- User Management detail (`app/admin/users/[id]/page.tsx`) - Combined Clerk + DB data view with moderation actions
- Team Moderation list (`app/admin/teams/page.tsx`) - Search, filter, flag/unflag teams
- Team Moderation detail (`app/admin/teams/[id]/page.tsx`) - Full team info with edit/delete/flag actions

**API Routes (Clerk-Integrated):**
- `GET /api/admin/users` - List users (Clerk API + DB join)
- `GET /api/admin/users/[id]` - User details (Clerk API + DB)
- `POST /api/admin/users/[id]/lock` - Lock user (Clerk API)
- `POST /api/admin/users/[id]/ban` - Ban user (Clerk API)
- `POST /api/admin/users/[id]/unlock` - Unlock user (Clerk API)
- `POST /api/admin/users/[id]/unban` - Unban user (Clerk API)
- `POST /api/admin/users/[id]/verify-usbc` - Verify USBC (DB only)
- `PUT /api/admin/users/[id]` - Edit profile (DB only)
- `GET /api/admin/teams` - List teams
- `GET /api/admin/teams/[id]` - Team details
- `PUT /api/admin/teams/[id]` - Edit team
- `POST /api/admin/teams/[id]/flag` - Flag team
- `DELETE /api/admin/teams/[id]` - Delete team

**UI Components:**
- `app/admin/users/[id]/UserDetailClient.tsx` - Client component for user moderation
- `app/admin/teams/[id]/TeamDetailClient.tsx` - Client component for team moderation

#### ✅ Phase 3: Content Moderation

**Reports System:**
- `app/admin/reports/page.tsx` - Report list with filter tabs (Pending, Investigating, Resolved, Dismissed)
- `app/admin/reports/ReportList.tsx` - Report cards with expandable details
- `app/admin/reports/[id]/page.tsx` - Report detail page
- `app/admin/reports/[id]/ReportDetailClient.tsx` - Review interface with quick actions
- `app/api/reports/route.ts` - User-facing report submission endpoint
- `GET /api/admin/reports` - List reports
- `GET /api/admin/reports/[id]` - Report details
- `POST /api/admin/reports/[id]/review` - Update status/resolve
- `POST /api/admin/reports/[id]/action` - Take moderation action

**Bowling Center Management:**
- Refactored center suggestions page (moved to `/admin/centers/suggestions/`)
- Created full CRUD pages:
  - `app/admin/centers/page.tsx` - List all centers
  - `app/admin/centers/new/page.tsx` - Create new center
  - `app/admin/centers/[id]/edit/page.tsx` - Edit center
  - `app/admin/centers/CenterForm.tsx` - Shared form component
- `POST /api/admin/centers` - Create center
- `PUT /api/admin/centers/[id]` - Edit center
- `DELETE /api/admin/centers/[id]` - Delete center

**Report Types:**
- User reports (inappropriate_content, harassment, spam, fake_profile)
- Team reports (inappropriate_content, spam, fake_profile)
- Message reports (harassment, spam)
- Bowling center reports (incorrect_information)

#### ✅ Phase 4: Analytics & Audit

**Dependencies Added:**
- `recharts@^2.15.0` - Charts and visualizations
- `react-day-picker@^9.4.6` - Date range picker
- `papaparse@^5.5.0` - CSV export

**Analytics Dashboard:**
- `app/admin/analytics/page.tsx` - Analytics dashboard wrapper
- `app/admin/analytics/AnalyticsDashboard.tsx` - Interactive dashboard with charts
- Date range selector (Last 7/30/90 days, custom)
- Charts (Recharts):
  - User registrations over time (line chart)
  - Team creation trends (line chart)
  - USBC verification rate (pie chart)
  - Active vs inactive users (bar chart)
  - Reports by type (bar chart)
- CSV export functionality

**API Routes:**
- `GET /api/admin/analytics/users` - User growth metrics
- `GET /api/admin/analytics/teams` - Team creation metrics
- `GET /api/admin/analytics/reports` - Report statistics
- `GET /api/admin/analytics/centers` - Center metrics
- `POST /api/admin/analytics/export` - Generate CSV export

**Audit Logs:**
- `app/admin/audit-logs/page.tsx` - Audit log viewer with search and filters
- Search by target description, filter by action type
- Expandable rows showing before/after values
- Pagination (50 logs per page)
- `GET /api/admin/audit-logs` - List logs
- `POST /api/admin/audit-logs/export` - Export logs to CSV

**Admin Settings:**
- `app/admin/settings/page.tsx` - Admin settings dashboard
- `app/admin/settings/AdminSettingsClient.tsx` - Client component for role management
- List all admin users with roles
- Assign/revoke admin roles
- View admin activity
- `GET /api/admin/settings/admins` - List admin users
- `POST /api/admin/settings/admins` - Assign admin role
- `DELETE /api/admin/settings/admins/[id]` - Revoke admin role

#### ✅ Phase 5: Polish & Testing

**Dependencies Added:**
- `react-hot-toast@^2.4.1` - Toast notifications
- `lucide-react@^0.469.0` - Icon library

**UI/UX Improvements:**
- Added toast notifications for all user actions (ban/lock/unlock/delete)
- Integrated Toaster component in `AdminLayout.tsx`
- Responsive design for all admin pages
- Loading states and error handling
- Confirmation modals for destructive actions
- Dark mode support throughout

**Toast Notifications:**
- Loading states: "Banning user...", "Locking user...", etc.
- Success messages: "User banned successfully", "Team deleted successfully", etc.
- Error messages with specific error details
- Configured toast position (top-right) and duration (3-5 seconds)

**TypeScript & Build Fixes:**
- Resolved 26+ TypeScript strict mode errors across 50+ files
- Fixed Clerk imports (separated server vs client components)
- Added type assertions for JSON responses: `(await response.json()) as { error?: string }`
- Fixed database field name mismatches (phone/phoneNumber, verified/isVerified, numberOfLanes/laneCount)
- Fixed Drizzle ORM queries (replaced `eq()` with `inArray()` for multiple values)
- Fixed enum type casting for action types and report statuses
- Eliminated all `any` types (replaced with `Record<string, unknown>` or explicit types)
- Fixed import sorting (alphabetical order)
- Fixed optional chaining: `key.split("_")[0]?.toLowerCase() || "general"`

**ESLint Compliance:**
- All ESLint errors resolved
- No `any` types remaining
- Import statements sorted alphabetically
- Removed unused `@ts-expect-error` directives

**Build Success:**
```bash
✓ Compiled successfully in 25.0s
Linting and checking validity of types ...
```

**Documentation:**
- `docs/admin-panel-guide.md` (9,500+ words) - Complete admin panel user guide
- `docs/admin-permissions-reference.md` (8,000+ words) - Permission system reference
- `docs/admin-panel-implementation-summary.md` (8,500+ words) - Implementation details and technical reference
- Updated `README.md` with admin panel features and structure

**Security Measures:**
- Multi-layer authorization (middleware, layout, API routes, components)
- Rate limiting for sensitive actions (future enhancement)
- Input validation using Zod schemas
- Complete audit trail (never delete logs)
- IP address and user agent logging
- CSRF protection via Next.js middleware

**Files Modified (TypeScript/ESLint Fixes):**
- `components/Header/Header.tsx` - Fixed Clerk imports
- `app/admin/analytics/AnalyticsDashboard.tsx` - Fixed type errors and PieChart labels
- `app/admin/centers/[id]/edit/page.tsx` - Fixed field name transformations
- `app/admin/centers/page.tsx` - Fixed database field names
- `app/admin/users/page.tsx` - Fixed `inArray` usage
- `app/api/admin/centers/[id]/route.ts` - Fixed field mappings and type assertions
- `app/api/admin/settings/admins/route.ts` - Fixed enum type assertions
- `app/api/reports/route.ts` - Fixed NewReport type usage
- `lib/admin/permissions.ts` - Fixed import order and optional chaining
- `app/admin/audit-logs/page.tsx` - Fixed enum type casting
- 15+ additional API routes - Added type assertions for JSON responses

#### Admin Panel File Structure

```
app/admin/
├── layout.tsx                    # Admin section root with auth checks
├── page.tsx                      # Dashboard
├── analytics/
│   ├── page.tsx                  # Analytics wrapper
│   └── AnalyticsDashboard.tsx    # Interactive dashboard
├── audit-logs/
│   └── page.tsx                  # Audit log viewer
├── centers/
│   ├── page.tsx                  # List centers
│   ├── new/page.tsx              # Create center
│   ├── [id]/edit/page.tsx        # Edit center
│   ├── CenterForm.tsx            # Shared form
│   └── suggestions/              # Edit suggestions (from Phase 3 of bowling center directory)
├── reports/
│   ├── page.tsx                  # Report list
│   ├── ReportList.tsx            # Report cards
│   └── [id]/
│       ├── page.tsx              # Report detail
│       └── ReportDetailClient.tsx # Review interface
├── settings/
│   ├── page.tsx                  # Admin settings
│   └── AdminSettingsClient.tsx   # Role management
├── teams/
│   ├── page.tsx                  # Team list
│   └── [id]/
│       ├── page.tsx              # Team detail
│       └── TeamDetailClient.tsx  # Moderation interface
└── users/
    ├── page.tsx                  # User list
    └── [id]/
        ├── page.tsx              # User detail
        └── UserDetailClient.tsx  # Moderation interface

app/api/admin/
├── analytics/
│   ├── export/route.ts           # Export analytics
│   ├── centers/route.ts          # Center metrics
│   ├── reports/route.ts          # Report metrics
│   ├── teams/route.ts            # Team metrics
│   └── users/route.ts            # User metrics
├── audit-logs/
│   ├── route.ts                  # List logs
│   └── export/route.ts           # Export logs
├── centers/
│   ├── route.ts                  # List/create centers
│   └── [id]/route.ts             # Edit/delete center
├── reports/
│   ├── route.ts                  # List reports
│   ├── [id]/
│   │   ├── route.ts              # Report details
│   │   ├── review/route.ts       # Review report
│   │   └── action/route.ts       # Take action
├── settings/
│   └── admins/
│       ├── route.ts              # List/assign admins
│       └── [id]/route.ts         # Revoke admin
├── teams/
│   ├── route.ts                  # List teams
│   └── [id]/
│       ├── route.ts              # Edit/delete team
│       └── flag/route.ts         # Flag/unflag team
└── users/
    ├── route.ts                  # List users
    └── [id]/
        ├── route.ts              # User details/edit
        ├── ban/route.ts          # Ban user (Clerk API)
        ├── unban/route.ts        # Unban user (Clerk API)
        ├── lock/route.ts         # Lock user (Clerk API)
        ├── unlock/route.ts       # Unlock user (Clerk API)
        └── verify-usbc/route.ts  # Verify USBC

components/Admin/
├── AdminLayout.tsx               # Admin shell with sidebar
├── StatsCard.tsx                 # Dashboard stats
└── ... (additional shared components)

lib/admin/
├── clerk-integration.ts          # Clerk API wrappers
├── permissions.ts                # Permission system
└── audit-logger.ts               # Audit logging

drizzle/schema/
├── admin-roles.ts                # Admin role tracking
├── permissions.ts                # Permission definitions
├── reports.ts                    # Report system
└── admin-actions.ts              # Audit log
```

#### Testing Checklist

- [x] Admin authentication and role checking
- [x] User management (ban/lock/unlock/unban via Clerk)
- [x] USBC verification
- [x] Team moderation (flag/unflag/delete)
- [x] Report submission and review workflow
- [x] Bowling center CRUD operations
- [x] Analytics dashboard with charts
- [x] Audit log search and filtering
- [x] Admin role assignment/revocation
- [x] Permission system enforcement
- [x] Toast notifications for all actions
- [x] Mobile responsiveness
- [x] Dark mode support
- [x] TypeScript type safety
- [x] ESLint compliance
- [x] Vercel build success

#### Implementation Timeline

- **Phase 1**: Foundation & Clerk Integration (3-4 days) ✅
- **Phase 2**: Core Features (4-5 days) ✅
- **Phase 3**: Content Moderation (4-5 days) ✅
- **Phase 4**: Analytics & Audit (3-4 days) ✅
- **Phase 5**: Polish & Testing (3-4 days) ✅

**Total Implementation Time**: ~2.5-3 weeks
**Time Saved**: ~2.5 weeks by leveraging Clerk APIs vs custom implementation

#### Key Technical Patterns

**API Authorization Pattern:**
```typescript
export async function POST(request: NextRequest) {
  // 1. Check authentication
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return 401;

  // 2. Get database user
  const user = await db.query.users.findFirst(...);
  if (!user) return 404;

  // 3. Check permission
  await requirePermission(clerkUserId, "specific_permission");

  // 4. Perform action
  // ...

  // 5. Log admin action
  await logAdminAction({...});

  // 6. Return response
  return NextResponse.json({...});
}
```

**Clerk Integration Pattern:**
```typescript
// Combine Clerk data + database data
const clerkUser = await clerkClient.users.getUser(clerkUserId);
const dbUser = await db.query.users.findFirst({
  where: eq(users.clerkUserId, clerkUserId)
});

return {
  // Clerk data
  email: clerkUser.emailAddresses[0].emailAddress,
  avatar: clerkUser.imageUrl,
  banned: clerkUser.banned,
  locked: clerkUser.locked,
  lastSignInAt: clerkUser.lastSignInAt,

  // Database data
  usbcId: dbUser.usbcId,
  currentAverage: dbUser.currentAverage,
  // ...
};
```

**Type Assertion Pattern:**
```typescript
// For JSON responses
const data = (await response.json()) as { error?: string };

// For enum types
const role = roleString as "super_admin" | "moderator" | "content_reviewer" | "support";
```

**Field Name Transformation Pattern:**
```typescript
// Database → Form
const formData = {
  phoneNumber: dbCenter.phone,
  laneCount: dbCenter.numberOfLanes,
  isVerified: dbCenter.verified,
};

// Form → Database
const updateData: Record<string, unknown> = {
  phone: formData.phoneNumber,
  numberOfLanes: formData.laneCount?.toString(),
  verified: formData.isVerified,
};
```

#### Success Criteria

✅ Super admin can perform all admin actions
✅ Moderators can manage users, teams, reports (but not other admins)
✅ Content reviewers can review and resolve reports
✅ Support can view data read-only
✅ All admin actions are logged with full audit trail
✅ User reports create actionable items for admins
✅ Admins can directly create/edit/delete bowling centers
✅ Analytics provide insights on user growth and activity
✅ Audit logs are searchable and exportable
✅ Permission system is granular and enforceable
✅ UI is responsive and accessible
✅ Toast notifications for all user actions
✅ TypeScript strict mode compliance
✅ ESLint compliance
✅ Build succeeds without errors

---

### Email Workflow APIs (December 2024)

A complete email notification system for team collaboration, enabling team invitations, player applications, and direct messaging with professional email notifications.

#### ✅ Implementation Complete

**API Routes Created:**

1. **Team Invitations** (`/api/teams/[teamId]/invite`)
   - Team captains can invite specific players to join their team
   - 14-day invitation expiry period
   - Duplicate invitation prevention
   - Captain ownership verification
   - Professional invitation emails via React Email

2. **Player Applications** (`/api/teams/[teamId]/apply`)
   - Players can apply to teams with optional cover letter
   - Application notification sent to team captain
   - Prevents captain from applying to own team
   - Duplicate application prevention

3. **Application Responses** (`/api/applications/[applicationId]/respond`)
   - Captains can accept or decline applications
   - Auto-adds player to team membership on acceptance
   - Status update emails to applicant (different templates for accepted vs declined)
   - Review metadata tracking (reviewedBy, reviewedAt)

4. **Message Notifications** (`/api/messages`)
   - Direct messaging between users
   - Email notifications with message preview (100 char limit)
   - Self-messaging prevention
   - Optional subject line support

**Files Created:**
- `app/api/teams/[teamId]/invite/route.ts` (120 lines)
- `app/api/teams/[teamId]/apply/route.ts` (115 lines)
- `app/api/applications/[applicationId]/respond/route.ts` (124 lines)
- `app/api/messages/route.ts` (88 lines)

**Total Code:** 447 lines across 4 files

**Key Features:**

**Error Handling:**
- Email failures are isolated in try/catch blocks
- Email sending errors don't break core operations (invitation/application/message still created)
- All errors logged to console for debugging

**Request Validation:**
- Zod schemas for all request bodies
- UUID validation for user/team IDs
- Required fields enforced (content, recipientId, etc.)

**Business Logic:**
- Prevents duplicate invitations/applications (checks for existing pending status)
- Auto-creates team membership on application acceptance
- 14-day expiry for team invitations
- Message preview truncation for email notifications

**Database Operations:**
- Uses Drizzle ORM with `.returning()` for created records
- Atomic operations (single transaction per action)
- Proper foreign key references and relations

**Integration with React Email:**
All workflows use existing React Email templates:
- `teamInvitation()` - Team invitation email
- `applicationReceived()` - Captain notification when player applies
- `applicationStatusUpdate()` - Player notification on accept/decline
- `messageNotification()` - Message received notification

**API Response Patterns:**
```typescript
// Success (201 Created)
{ success: true, invitation: {...} }
{ success: true, application: {...} }
{ success: true, message: {...} }

// Errors
{ error: "Unauthorized" } // 401
{ error: "User not found" } // 404
{ error: "Only team captain can send invitations" } // 403
{ error: "Invitation already sent to this player" } // 400
{ error: "Invalid data", details: [...] } // 400 (Zod validation)
{ error: "Failed to send invitation" } // 500
```

**TypeScript Fixes Applied:**
- Fixed `captainUserId` → `captainId` (schema field name mismatch)
- Added non-null assertions for `.returning()` results: `invitation!.id`, `application!.id`, `message!.id`

**Build Status:** ✅ Compiled successfully with 0 errors

**Git Commit:**
```
d3bc932 - feat: implement email workflow APIs for team collaboration
```

#### Usage Examples

**Team Captain Invites Player:**
```typescript
POST /api/teams/{teamId}/invite
{
  "invitedUserId": "uuid-of-player",
  "message": "We'd love to have you on our team!"
}

Response: { success: true, invitation: { id, teamId, invitedUserId, status: "pending", expiresAt } }
```

**Player Applies to Team:**
```typescript
POST /api/teams/{teamId}/apply
{
  "coverLetter": "I'm a dedicated bowler with a 180 average..."
}

Response: { success: true, application: { id, teamId, applicantUserId, status: "pending" } }
```

**Captain Responds to Application:**
```typescript
POST /api/applications/{applicationId}/respond
{
  "status": "accepted",
  "message": "Welcome to the team!"
}

Response: { success: true, application: { status: "accepted", reviewedAt } }
// Note: Player is automatically added to team_members table if accepted
```

**Send Direct Message:**
```typescript
POST /api/messages
{
  "recipientId": "uuid-of-recipient",
  "subject": "About our practice schedule",
  "content": "Hey, are we still meeting on Tuesday at 6pm?"
}

Response: { success: true, message: { id, senderId, recipientId, subject, content } }
```

#### Testing Checklist

- [x] Team invitations create database records
- [x] Team invitations send emails to invited players
- [x] Duplicate invitations are prevented
- [x] Only team captains can send invitations
- [x] Player applications notify team captains via email
- [x] Captains cannot apply to their own teams
- [x] Duplicate applications are prevented
- [x] Accepting applications adds players to team
- [x] Application status emails sent for accept/decline
- [x] Messages create database records
- [x] Message notifications sent to recipients
- [x] Self-messaging is prevented
- [x] Email failures don't break core operations
- [x] All routes validate authentication
- [x] TypeScript compilation successful
- [x] Build passes with 0 errors

#### Future Enhancements (Post-MVP)

- **Invitation Management UI** - User-facing page to view/accept/decline invitations
- **Application Management UI** - Captain dashboard to review applications
- **Message Inbox UI** - Full messaging interface with threads
- **Email Templates** - Enhanced styling and branding
- **Push Notifications** - Real-time notifications for invitations/messages
- **Invitation Expiry Handling** - Cron job to expire old invitations
- **Application Withdrawal** - Allow applicants to cancel pending applications
- **Message Threading** - Support for conversation threads (uses `parentMessageId`)
- **Read Receipts** - Track when messages are read
- **Batch Invitations** - Invite multiple players at once

---

*Last updated: December 23, 2024*
*AI Assistant: Claude Sonnet 4.5*
