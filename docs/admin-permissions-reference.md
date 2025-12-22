# TeamFinder Admin Panel - Permissions Reference

## Overview

The TeamFinder admin panel uses a granular role-based access control (RBAC) system with 20+ distinct permissions organized into categories.

**Permission System Architecture:**
- Permissions defined in `drizzle/schema/permissions.ts`
- Role-permission mappings in permission utilities
- Checked at multiple layers (middleware, layout, API routes, UI)
- Super admin has wildcard `*` permission (grants everything)

---

## Permission Categories

### 1. User Management (6 permissions)

#### `view_users`
**Description:** View user profiles and user list
**Access Level:** Read-only
**Granted To:** super_admin, moderator, content_reviewer, support
**Pages:**
- `/admin/users` - User list
- `/admin/users/[id]` - User detail
**API Routes:**
- `GET /api/admin/users` - List users
- `GET /api/admin/users/[id]` - Get user details

---

#### `ban_users`
**Description:** Permanently ban users via Clerk API
**Access Level:** Write (destructive)
**Granted To:** super_admin, moderator
**Effect:**
- User cannot sign in
- All sessions invalidated immediately
- Requires reason
**Pages:**
- `/admin/users/[id]` - Ban button
**API Routes:**
- `POST /api/admin/users/[id]/ban` - Ban user
- `POST /api/admin/users/[id]/unban` - Unban user

**Clerk Integration:**
```javascript
await clerkClient.users.banUser(clerkUserId);
```

---

#### `lock_users`
**Description:** Temporarily lock users via Clerk API
**Access Level:** Write (reversible)
**Granted To:** super_admin, moderator
**Effect:**
- User cannot sign in until unlocked
- All sessions invalidated
- Requires reason
**Pages:**
- `/admin/users/[id]` - Lock button
**API Routes:**
- `POST /api/admin/users/[id]/lock` - Lock user
- `POST /api/admin/users/[id]/unlock` - Unlock user

**Clerk Integration:**
```javascript
await clerkClient.users.lockUser(clerkUserId);
```

---

#### `verify_usbc`
**Description:** Verify user USBC membership
**Access Level:** Write
**Granted To:** super_admin, moderator
**Effect:**
- Updates USBC verification fields
- Records verifier and timestamp
**Pages:**
- `/admin/users/[id]` - Verify USBC button
**API Routes:**
- `POST /api/admin/users/[id]/verify-usbc` - Verify USBC

*Note: Not yet implemented in current version*

---

#### `edit_user_profiles`
**Description:** Edit user profile information
**Access Level:** Write
**Granted To:** super_admin, moderator
**Effect:**
- Modify database user fields
- Cannot modify Clerk-managed fields
**Pages:**
- `/admin/users/[id]` - Edit button
**API Routes:**
- `PUT /api/admin/users/[id]` - Update user profile

*Note: Not yet implemented in current version*

---

### 2. Team Management (4 permissions)

#### `view_teams`
**Description:** View team list and team details
**Access Level:** Read-only
**Granted To:** super_admin, moderator, content_reviewer, support
**Pages:**
- `/admin/teams` - Team list
- `/admin/teams/[id]` - Team detail
**API Routes:**
- `GET /api/admin/teams` - List teams
- `GET /api/admin/teams/[id]` - Get team details

---

#### `moderate_teams`
**Description:** Flag and unflag teams for review
**Access Level:** Write (reversible)
**Granted To:** super_admin, moderator
**Effect:**
- Set `flaggedForReview = true/false`
- Add flagged reason and moderation notes
- Record moderation timestamp
**Pages:**
- `/admin/teams/[id]` - Flag/Unflag buttons
**API Routes:**
- `POST /api/admin/teams/[id]/flag` - Flag team
- `POST /api/admin/teams/[id]/unflag` - Unflag team

**Database Schema:**
```typescript
flaggedForReview: boolean
flaggedReason: text | null
moderationNotes: text | null
moderatedBy: uuid | null
moderatedAt: timestamp | null
```

---

#### `edit_teams`
**Description:** Edit team information
**Access Level:** Write
**Granted To:** super_admin, moderator
**Effect:**
- Modify team details
- Cannot change ownership
**Pages:**
- `/admin/teams/[id]` - Edit button
**API Routes:**
- `PUT /api/admin/teams/[id]` - Update team

*Note: Not yet implemented in current version*

---

#### `delete_teams`
**Description:** Permanently delete teams
**Access Level:** Write (destructive)
**Granted To:** super_admin, moderator
**Effect:**
- Team deleted from database
- Cascade deletes: team members, invitations
- Requires confirmation and reason
**Pages:**
- `/admin/teams/[id]` - Delete button
**API Routes:**
- `DELETE /api/admin/teams/[id]` - Delete team

**Confirmation Flow:**
1. User must type exact team name
2. User must provide deletion reason
3. Deletion is logged to audit trail

---

### 3. Bowling Center Management (5 permissions)

#### `view_centers`
**Description:** View bowling center list and details
**Access Level:** Read-only
**Granted To:** super_admin, moderator, content_reviewer, support
**Pages:**
- `/admin/centers` - Center list
- `/admin/centers/[id]/edit` - Center detail (in edit form)
**API Routes:**
- `GET /api/admin/centers` - List centers
- `GET /api/admin/centers/[id]` - Get center details

---

#### `create_centers`
**Description:** Create new bowling centers
**Access Level:** Write
**Granted To:** super_admin, moderator
**Effect:**
- Add new center to database
- Set initial verification status
- Record creator
**Pages:**
- `/admin/centers/new` - Create form
**API Routes:**
- `POST /api/admin/centers` - Create center

**Required Fields:**
- name, address, city, state, zipCode

**Optional Fields:**
- phoneNumber, website, laneCount, isVerified

---

#### `edit_centers`
**Description:** Edit bowling center information
**Access Level:** Write
**Granted To:** super_admin, moderator
**Effect:**
- Update center details
- Change verification status
- Update verification timestamp
**Pages:**
- `/admin/centers/[id]/edit` - Edit form
**API Routes:**
- `PUT /api/admin/centers/[id]` - Update center

---

#### `delete_centers`
**Description:** Delete bowling centers
**Access Level:** Write (destructive)
**Granted To:** super_admin, moderator
**Effect:**
- Remove center from database
- Check for dependencies (teams, leagues)
**Pages:**
- `/admin/centers/[id]/edit` - Delete button
**API Routes:**
- `DELETE /api/admin/centers/[id]` - Delete center

---

#### `review_center_suggestions`
**Description:** Review user-submitted center suggestions
**Access Level:** Write
**Granted To:** super_admin, moderator
**Effect:**
- Approve or reject suggestions
- Create center from suggestion
**Pages:**
- `/admin/centers/suggestions` - Suggestions list
**API Routes:**
- `GET /api/admin/centers/suggestions` - List suggestions
- `POST /api/admin/centers/suggestions/[id]/approve` - Approve
- `POST /api/admin/centers/suggestions/[id]/reject` - Reject

*Note: Not yet implemented in current version*

---

### 4. Report Management (2 permissions)

#### `view_reports`
**Description:** View user-submitted reports
**Access Level:** Read-only
**Granted To:** super_admin, moderator, content_reviewer
**Pages:**
- `/admin/reports` - Reports list
- `/admin/reports/[id]` - Report detail
**API Routes:**
- `GET /api/admin/reports` - List reports
- `GET /api/admin/reports/[id]` - Get report details

**Report Types:**
- user, team, message, bowling_center

**Report Statuses:**
- pending, investigating, resolved, dismissed

---

#### `resolve_reports`
**Description:** Update report status and take action
**Access Level:** Write
**Granted To:** super_admin, moderator, content_reviewer
**Effect:**
- Change report status
- Add review notes
- Mark as resolved/dismissed
**Pages:**
- `/admin/reports/[id]` - Action buttons
**API Routes:**
- `POST /api/admin/reports/[id]/status` - Update status
- `POST /api/admin/reports/[id]/resolve` - Resolve report
- `POST /api/admin/reports/[id]/dismiss` - Dismiss report

**Workflow:**
```
pending → investigating → resolved
                    ↓
                dismissed
```

---

### 5. Analytics (2 permissions)

#### `view_analytics`
**Description:** View platform analytics dashboard
**Access Level:** Read-only
**Granted To:** super_admin, moderator, content_reviewer, support
**Pages:**
- `/admin` - Dashboard
- `/admin/analytics` - Analytics dashboard
**API Routes:**
- `GET /api/admin/analytics/user-growth` - User growth data
- `GET /api/admin/analytics/team-stats` - Team statistics
- `GET /api/admin/analytics/report-stats` - Report statistics
- `GET /api/admin/analytics/center-stats` - Center statistics

**Metrics Provided:**
- User growth over time
- Team creation trends
- Report status distribution
- Center verification rates

---

#### `export_data`
**Description:** Export analytics and audit data to CSV
**Access Level:** Read + Export
**Granted To:** super_admin, moderator
**Effect:**
- Download analytics summary as CSV
- Download audit logs as CSV
**Pages:**
- `/admin/analytics` - Export CSV button
- `/admin/audit-logs` - Export CSV button
**API Routes:**
- `POST /api/admin/analytics/export` - Export analytics
- `POST /api/admin/audit-logs/export` - Export audit logs

**Export Formats:**
- CSV with headers
- UTF-8 encoding
- Timestamp in filename

---

### 6. Audit Logs (1 permission)

#### `view_audit_logs`
**Description:** View complete audit trail of admin actions
**Access Level:** Read-only (sensitive)
**Granted To:** super_admin, moderator, support
**Pages:**
- `/admin/audit-logs` - Audit log list
**API Routes:**
- `GET /api/admin/audit-logs` - List audit logs

**Logged Information:**
- Admin ID, name, role
- Action type and timestamp
- Target entity (type, ID, description)
- Reason provided
- Previous/new values
- IP address and user agent

**Action Types:**
- user_locked, user_unlocked, user_banned, user_unbanned
- team_edited, team_deleted, team_flagged, team_unflagged
- center_created, center_edited, center_deleted
- report_reviewed, report_dismissed
- admin_role_assigned, admin_role_revoked

---

### 7. Admin Management (1 permission)

#### `manage_admins`
**Description:** Assign and revoke admin roles
**Access Level:** Write (highly privileged)
**Granted To:** super_admin only
**Effect:**
- Update Clerk publicMetadata with role
- Create/delete admin_roles records
- Grant/revoke access to admin panel
**Pages:**
- `/admin/settings` - Admin management
**API Routes:**
- `POST /api/admin/settings/admins` - Assign admin role
- `DELETE /api/admin/settings/admins/[id]` - Revoke admin role

**Available Roles:**
- super_admin
- moderator
- content_reviewer
- support

**Security:**
- Cannot revoke own admin role
- Requires email lookup via Clerk
- Creates database user if doesn't exist
- All actions logged to audit trail

---

## Role-Permission Matrix

| Permission | Super Admin | Moderator | Content Reviewer | Support |
|------------|-------------|-----------|------------------|---------|
| **User Management** |
| view_users | ✅ | ✅ | ✅ | ✅ |
| ban_users | ✅ | ✅ | ❌ | ❌ |
| lock_users | ✅ | ✅ | ❌ | ❌ |
| verify_usbc | ✅ | ✅ | ❌ | ❌ |
| edit_user_profiles | ✅ | ✅ | ❌ | ❌ |
| **Team Management** |
| view_teams | ✅ | ✅ | ✅ | ✅ |
| moderate_teams | ✅ | ✅ | ❌ | ❌ |
| edit_teams | ✅ | ✅ | ❌ | ❌ |
| delete_teams | ✅ | ✅ | ❌ | ❌ |
| **Center Management** |
| view_centers | ✅ | ✅ | ✅ | ✅ |
| create_centers | ✅ | ✅ | ❌ | ❌ |
| edit_centers | ✅ | ✅ | ❌ | ❌ |
| delete_centers | ✅ | ✅ | ❌ | ❌ |
| review_center_suggestions | ✅ | ✅ | ❌ | ❌ |
| **Report Management** |
| view_reports | ✅ | ✅ | ✅ | ❌ |
| resolve_reports | ✅ | ✅ | ✅ | ❌ |
| **Analytics** |
| view_analytics | ✅ | ✅ | ✅ | ✅ |
| export_data | ✅ | ✅ | ❌ | ❌ |
| **Audit** |
| view_audit_logs | ✅ | ✅ | ❌ | ✅ |
| **Admin Management** |
| manage_admins | ✅ | ❌ | ❌ | ❌ |

---

## Permission Implementation

### Database Schema

**Permissions Table:**
```typescript
export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // e.g., "view_users"
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "users"
  isActive: boolean("is_active").notNull().default(true),
});
```

**Role-Permissions Mapping:**
```typescript
export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: adminRoleEnum("role").notNull(), // super_admin, moderator, etc.
  permissionId: uuid("permission_id").notNull().references(() => permissions.id),
});
```

### Permission Checking

**Utility Functions** (`lib/admin/permissions.ts`):

```typescript
// Check if user has specific permission
await hasPermission(clerkUserId, "ban_users");

// Require permission (throws if not authorized)
await requirePermission(clerkUserId, "delete_teams");

// Get all user's permissions
const perms = await getUserPermissions(clerkUserId);
```

**Implementation:**
```typescript
export async function hasPermission(
  clerkUserId: string,
  permissionName: string
): Promise<boolean> {
  const role = await getUserAdminRole(clerkUserId);
  if (!role) return false;

  // Super admin has wildcard access
  if (ROLE_PERMISSIONS[role].includes("*")) return true;

  // Check specific permission
  return ROLE_PERMISSIONS[role].includes(permissionName);
}
```

### Multi-Layer Authorization

**1. Middleware** (`middleware.ts`):
```typescript
if (isAdminRoute(request)) {
  await auth.protect(); // Require authentication
}
```

**2. Layout** (`app/admin/layout.tsx`):
```typescript
const role = await getAdminRole(clerkUserId);
if (!role) redirect("/?error=unauthorized");
```

**3. API Routes** (all admin APIs):
```typescript
await requirePermission(clerkUserId, "specific_permission");
```

**4. UI Components** (conditional rendering):
```typescript
{permissions.includes("ban_users") && (
  <button onClick={handleBan}>Ban User</button>
)}
```

---

## Adding New Permissions

### Step 1: Define Permission

Add to `drizzle/schema/permissions.ts`:
```typescript
export const PERMISSIONS = {
  // Existing permissions...
  NEW_PERMISSION: "new_permission_name",
} as const;
```

### Step 2: Update Role Mappings

Update `lib/admin/permissions.ts`:
```typescript
const ROLE_PERMISSIONS: Record<AdminRoleType, string[]> = {
  super_admin: ["*"],
  moderator: [
    // Existing permissions...
    PERMISSIONS.NEW_PERMISSION,
  ],
  // Other roles...
};
```

### Step 3: Use in Code

**API Route:**
```typescript
await requirePermission(clerkUserId, PERMISSIONS.NEW_PERMISSION);
```

**UI Component:**
```typescript
{permissions.includes(PERMISSIONS.NEW_PERMISSION) && (
  <button>New Action</button>
)}
```

### Step 4: Seed Database

Run migration to add permission record:
```sql
INSERT INTO permissions (name, description, category, is_active)
VALUES ('new_permission_name', 'Description here', 'category', true);
```

---

## Security Best Practices

### 1. Defense in Depth
✅ Always check permissions at multiple layers
✅ Never rely solely on UI hiding
✅ Always validate in API routes

### 2. Principle of Least Privilege
✅ Grant minimum permissions needed
✅ Review permissions quarterly
✅ Remove inactive admins

### 3. Audit Everything
✅ Log all permission checks
✅ Track permission changes
✅ Monitor for privilege escalation

### 4. Immutable Audit Trail
✅ Never delete audit logs
✅ Store IP and user agent
✅ Capture before/after state

### 5. Role Assignment
✅ Only super admins can assign roles
✅ Prevent self-revocation
✅ Require reason for all changes

---

## Troubleshooting

### Permission Denied Errors

**Symptoms:**
- "Unauthorized: Missing permission 'X'" error
- Actions don't work
- Buttons are hidden

**Diagnosis:**
1. Check user's assigned role in `/admin/settings`
2. Verify role in Clerk publicMetadata
3. Check role-permission mapping
4. Review audit logs for any role changes

**Solutions:**
- Ask super admin to grant permission
- Verify role is correctly assigned
- Check if permission exists in database

### Role Not Working

**Symptoms:**
- Role assigned but no access
- Menu items not showing
- Still seeing unauthorized errors

**Diagnosis:**
1. Check Clerk publicMetadata: `user.publicMetadata.role`
2. Verify admin_roles table entry
3. Check if role in ROLE_PERMISSIONS map
4. Try logging out and back in

**Solutions:**
- Re-assign role via `/admin/settings`
- Clear browser cache
- Verify Clerk integration is working

---

## Future Enhancements

**Planned Permissions:**
- `impersonate_users` - View platform as another user
- `manage_leagues` - Full league CRUD operations
- `send_notifications` - Send platform-wide notifications
- `manage_settings` - Configure platform settings
- `view_sensitive_data` - Access PII and sensitive info

**Planned Features:**
- Custom permission groups
- Temporary permission grants
- Permission inheritance
- Time-based permissions
- IP-based restrictions

---

**Last Updated:** December 2025
**Version:** 1.0.0
