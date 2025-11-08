# Admin Panel & Settings Implementation Plan

## Current State

- ✅ Basic authentication (Clerk)
- ✅ Profile management exists
- ❌ **No admin system** (no roles, permissions, or admin UI)
- ❌ **No settings page** (no user preferences/privacy controls)
- ❌ Incomplete features (invitations, applications, messaging have DB schemas but no UI)

---

## Phase 1: User Settings Page (1-2 weeks)

*Priority: HIGH - Essential for user control*

### Routes to Create

- `/settings` - Main settings layout
- `/settings/account` - Account info
- `/settings/privacy` - Privacy controls
- `/settings/notifications` - Notification preferences
- `/settings/security` - Security settings

### Features

#### 1. Account Tab

- Edit email, name (sync with Clerk)
- Profile photo management
- Account deactivation option

#### 2. Privacy Tab

- Profile visibility (public/members-only/private)
- Show/hide bowling stats
- Message permissions (anyone/team-only/nobody)
- Show/hide on player browse

#### 3. Notifications Tab

- Email notifications toggle
- Team invitation alerts
- Message notifications
- Application status updates
- Weekly digest option

#### 4. Security Tab

- Active sessions list
- Login history (last 10 logins)
- Two-factor authentication (via Clerk)
- Connected accounts

### Database Changes

```typescript
// New table: user_settings
{
  userId: uuid (FK to users)
  profileVisibility: enum (public, members, private)
  showStats: boolean
  messagePermissions: enum (anyone, team_only, none)
  showOnBrowse: boolean
  emailNotifications: boolean
  teamInviteAlerts: boolean
  messageAlerts: boolean
  applicationAlerts: boolean
  weeklyDigest: boolean
}
```

### API Routes

- `GET /api/settings` - Fetch user settings
- `PUT /api/settings` - Update settings
- `GET /api/settings/sessions` - List active sessions

---

## Phase 2: Admin System Foundation (2-3 weeks)

*Priority: HIGH - Required for moderation*

### Routes to Create

- `/admin` - Admin dashboard (overview)
- `/admin/users` - User management
- `/admin/teams` - Team moderation
- `/admin/reports` - Report management
- `/admin/analytics` - Platform analytics
- `/admin/audit-log` - Activity log

### Authorization System

**Option A: Clerk Custom Metadata (Recommended)**

```typescript
// In Clerk dashboard, add publicMetadata
{
  role: "admin" | "moderator" | "user"
}

// Middleware check
if (user.publicMetadata.role !== 'admin') {
  redirect('/dashboard')
}
```

**Option B: Database Table**

```typescript
// New table: admin_roles
{
  userId: uuid (FK to users)
  role: enum (super_admin, admin, moderator)
  permissions: jsonb
  grantedBy: uuid (FK to users)
  grantedAt: timestamp
}
```

### Admin Dashboard Features

#### 1. Overview Tab

- Total users, teams, active players
- Recent signups (last 7 days)
- Pending reports count
- Team creation trends (chart)
- Top leagues by activity

#### 2. User Management Tab

- Search users (by name, email, USBC ID)
- View user details (profile, teams, activity)
- Actions:
  - Suspend account (temporarily ban)
  - Ban account (permanent)
  - Verify USBC ID manually
  - Send message/warning
  - View audit log

#### 3. Team Moderation Tab

- Search teams (by name, captain, league)
- View team details
- Actions:
  - Flag team (inappropriate content)
  - Edit team details (fix typos, errors)
  - Delete team
  - Transfer captaincy
  - View team activity log

#### 4. Report System

- List all reports (users reporting users/teams)
- Filter by status (pending, resolved, dismissed)
- Report details:
  - Reporter info
  - Reported entity (user/team)
  - Reason + description
  - Evidence (screenshots, links)
  - Action taken + admin notes

#### 5. Analytics Tab

- User growth chart (weekly/monthly)
- Team creation trends
- Top competition levels
- Gender type distribution
- Average completion rate
- Active vs inactive users

#### 6. Audit Log Tab

- All admin actions logged
- Searchable by admin, action type, entity
- Exportable to CSV

### Database Changes

```typescript
// New table: reports
{
  id: uuid
  reporterId: uuid (FK to users)
  reportedType: enum (user, team)
  reportedId: uuid
  reason: enum (spam, harassment, inappropriate, fake, other)
  description: text
  evidence: jsonb (urls, screenshots)
  status: enum (pending, resolved, dismissed)
  resolvedBy: uuid (FK to users)
  resolutionNotes: text
  createdAt: timestamp
  resolvedAt: timestamp
}

// New table: admin_actions (audit log)
{
  id: uuid
  adminId: uuid (FK to users)
  action: enum (ban, suspend, delete, verify, edit, etc)
  targetType: enum (user, team, report)
  targetId: uuid
  details: jsonb
  ipAddress: string
  createdAt: timestamp
}

// Add to users table
{
  status: enum (active, suspended, banned)
  suspendedUntil: timestamp (nullable)
  suspensionReason: text (nullable)
}
```

### API Routes

- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - List users (paginated)
- `PUT /api/admin/users/:id/suspend` - Suspend user
- `PUT /api/admin/users/:id/ban` - Ban user
- `GET /api/admin/teams` - List teams (paginated)
- `DELETE /api/admin/teams/:id` - Delete team
- `GET /api/admin/reports` - List reports
- `PUT /api/admin/reports/:id/resolve` - Resolve report
- `GET /api/admin/audit-log` - Audit log (paginated)

### Middleware Protection

```typescript
// Update middleware.ts
const adminRoutes = ['/admin']
if (adminRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
  if (user.publicMetadata.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
}
```

---

## Phase 3: Complete Existing Features (1-2 weeks)

*Priority: MEDIUM - Enhance platform*

### 1. Team Invitations UI

- Captain can invite players from browse page
- Players receive invitation (email + in-app)
- Accept/decline flow
- Notification integration

### 2. Player Applications UI

- Players can apply to teams
- Captain reviews applications
- Accept/decline + message
- Notification integration

### 3. Direct Messaging (Basic)

- Simple inbox/outbox
- Send message to team members
- Mark as read/unread
- Delete message

### 4. Report Button

- "Report User" button on player profiles
- "Report Team" button on team pages
- Form with reason + description
- Submit to reports table

---

## Phase 4: Advanced Admin Features (Optional, 1-2 weeks)

*Priority: LOW - Nice to have*

### 1. USBC Verification Dashboard

- Pending verifications queue
- Bulk verify/reject
- Integration with USBC API (if available)

### 2. Content Moderation

- Flag inappropriate profile bios/achievements
- Review flagged images
- Auto-moderation rules (profanity filter)

### 3. Email Campaign System

- Send announcements to all users
- Segment by criteria (league, level, etc.)
- Track open/click rates

### 4. Advanced Analytics

- Retention metrics
- Churn analysis
- League popularity heatmap
- User engagement scoring

---

## Implementation Order

### Week 1-2: User Settings

- [ ] Create settings layout + tabs
- [ ] Build account, privacy, notifications, security pages
- [ ] Add `user_settings` table migration
- [ ] Create API routes
- [ ] Add link to settings in navbar

### Week 3-5: Admin Foundation

- [ ] Set up admin authorization (Clerk metadata)
- [ ] Create admin layout + navigation
- [ ] Build admin dashboard (overview)
- [ ] Add user management (list, search, suspend/ban)
- [ ] Add team moderation (list, search, delete)
- [ ] Create audit logging system
- [ ] Add database migrations

### Week 6-7: Reports & Analytics

- [ ] Build report system (submit, list, resolve)
- [ ] Add report buttons to profiles/teams
- [ ] Create analytics dashboard
- [ ] Build audit log viewer
- [ ] Email notifications for admin actions

### Week 8-9: Complete Features

- [ ] Team invitations UI + flow
- [ ] Player applications UI + flow
- [ ] Basic direct messaging
- [ ] Notification center UI

---

## Tech Stack Additions

### Recommended Libraries

- **@tanstack/react-table** - Data tables for admin (users, teams, reports)
- **recharts** - Analytics charts
- **react-hook-form** - Better form handling (optional)
- **zod** (already installed) - Validation schemas

### UI Components Needed (Radix)

- **Table** - For admin lists
- **Badge** - Status indicators
- **Alert Dialog** - Confirm dangerous actions (ban, delete)
- **Command** - Search interface
- **Pagination** - For large lists

---

## Key Considerations

### Security

- ✅ Always verify admin role server-side (not just UI)
- ✅ Log all admin actions with IP + timestamp
- ✅ Rate limit admin API endpoints
- ✅ Require 2FA for admin accounts
- ✅ Use soft deletes (mark inactive) instead of hard deletes

### Privacy

- ✅ Respect user privacy settings
- ✅ Anonymize data in analytics
- ✅ Allow users to export their data (GDPR)
- ✅ Implement data retention policies

### Performance

- ✅ Paginate admin lists (50-100 per page)
- ✅ Index frequently searched columns (email, USBC ID)
- ✅ Cache dashboard stats (refresh every 5 mins)

---

## Estimated Timeline

| Phase | Duration | Complexity |
|-------|----------|-----------|
| Phase 1: User Settings | 1-2 weeks | Low |
| Phase 2: Admin Foundation | 2-3 weeks | Medium |
| Phase 3: Complete Features | 1-2 weeks | Low-Medium |
| Phase 4: Advanced Features | 1-2 weeks | Medium |
| **Total** | **5-9 weeks** | - |

---

## Next Steps

1. **Start with Phase 1** (User Settings) - Provides immediate value to users
2. **Then Phase 2** (Admin System) - Essential for platform moderation
3. **Phase 3** (Complete Features) - Enhances user engagement
4. **Phase 4** (Advanced) - Optional, based on platform needs
