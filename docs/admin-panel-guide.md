# TeamFinder Admin Panel - User Guide

## Table of Contents
1. [Overview](#overview)
2. [Admin Roles & Permissions](#admin-roles--permissions)
3. [Getting Started](#getting-started)
4. [Dashboard](#dashboard)
5. [User Management](#user-management)
6. [Team Moderation](#team-moderation)
7. [Reports System](#reports-system)
8. [Bowling Centers](#bowling-centers)
9. [Analytics](#analytics)
10. [Audit Logs](#audit-logs)
11. [Admin Settings](#admin-settings)
12. [Best Practices](#best-practices)

---

## Overview

The TeamFinder Admin Panel is a comprehensive administration system that provides role-based access control (RBAC) for managing users, teams, content moderation, and platform analytics.

**Key Features:**
- 4 distinct admin roles with granular permissions
- Clerk-integrated user moderation (ban, lock, unlock)
- Team moderation with flagging system
- User-submitted reports with review workflow
- Full CRUD for bowling centers
- Real-time analytics with charts
- Complete audit trail of all admin actions
- CSV export capabilities

**Access:** `/admin`

---

## Admin Roles & Permissions

### Role Hierarchy

#### 1. Super Admin
**Badge Color:** Purple
**Access Level:** Full system access (all permissions)

**Capabilities:**
- All user management operations
- All team moderation operations
- Manage bowling centers (create, edit, delete)
- Review and resolve reports
- View analytics and export data
- View audit logs
- **Assign and revoke admin roles**

**Use Cases:**
- Platform owners
- Senior administrators
- System maintainers

---

#### 2. Moderator
**Badge Color:** Blue
**Access Level:** User & team management

**Capabilities:**
- Ban/unban users
- Lock/unlock users
- View user profiles
- Edit, delete, and flag teams
- Manage bowling centers
- Review and resolve reports
- View analytics
- View audit logs

**Restrictions:**
- ❌ Cannot assign/revoke admin roles

**Use Cases:**
- Community moderators
- Trust & safety team
- Content moderators

---

#### 3. Content Reviewer
**Badge Color:** Green
**Access Level:** Read-only + report resolution

**Capabilities:**
- View user profiles (read-only)
- View teams (read-only)
- **Review and resolve reports**
- View bowling centers (read-only)
- View analytics

**Restrictions:**
- ❌ Cannot ban/lock users
- ❌ Cannot edit/delete teams
- ❌ Cannot manage bowling centers
- ❌ Cannot assign admin roles

**Use Cases:**
- Part-time moderators
- Volunteer reviewers
- Junior trust & safety staff

---

#### 4. Support
**Badge Color:** Gray
**Access Level:** Read-only access

**Capabilities:**
- View user profiles
- View teams
- View bowling centers
- View analytics
- View audit logs

**Restrictions:**
- ❌ Cannot perform any write operations
- ❌ View-only access across the board

**Use Cases:**
- Customer support team
- Data analysts
- Observers

---

## Getting Started

### Accessing the Admin Panel

1. **Navigate to:** `/admin`
2. **Authentication:** Clerk handles authentication automatically
3. **Authorization:** You must have an assigned admin role
4. **First Login:** You'll see your role badge in the sidebar

### Navigation

The sidebar displays different menu items based on your role:
- Dashboard (all roles)
- Users (requires `view_users`)
- Teams (requires `view_teams`)
- Reports (requires `view_reports`)
- Centers (requires `view_centers`)
- Analytics (requires `view_analytics`)
- Audit Logs (requires `view_audit_logs`)
- Settings (requires `manage_admins` - super admins only)

---

## Dashboard

**Path:** `/admin`
**Permission:** `view_analytics`

### Overview Cards
- **Total Users:** Count from Clerk
- **Active Teams:** Teams with `isActive = true`
- **Pending Reports:** Reports with `status = pending`
- **Bowling Centers:** Total verified centers

### Recent Activity Feed
Shows last 10 admin actions across the platform:
- Admin name and role
- Action type
- Target description
- Timestamp

### Quick Actions
- Direct links to pending reports
- Flagged teams
- Locked/banned users

---

## User Management

**Path:** `/admin/users`
**Permissions:** `view_users`, `ban_users`, `lock_users`

### User List

**Features:**
- Search by name or email (Clerk API)
- Pagination (50 users per page)
- User status badges (banned, locked, verified)
- Combined Clerk + database data

**Columns:**
- User avatar (from Clerk)
- Name and email
- USBC ID (if verified)
- Status badges
- Actions button

### User Detail Page

**Path:** `/admin/users/[clerkUserId]`

**Information Displayed:**
- **Clerk Data:** Email, avatar, creation date, last sign-in
- **Database Data:** USBC ID, bowling stats, home center
- **Status:** Banned, locked, verification status
- **Activity History:** Recent actions

**Available Actions:**

#### Ban User (Permanent)
1. Click "Ban User" button
2. Provide reason when prompted
3. Confirm action
4. User is immediately banned via Clerk API
5. All sessions invalidated
6. Action logged to audit trail

**Effect:** User cannot sign in, all sessions terminated

#### Lock User (Temporary Suspension)
1. Click "Lock User" button
2. Provide reason
3. Confirm action
4. User is locked via Clerk API

**Effect:** User cannot sign in until unlocked

#### Unlock User
1. Click "Unlock User" button
2. Provide reason
3. User can sign in again

#### Unban User
1. Click "Unban User" button
2. Provide reason
3. User can sign in again

#### Verify USBC
*Coming in future version*

---

## Team Moderation

**Path:** `/admin/teams`
**Permissions:** `view_teams`, `moderate_teams`, `delete_teams`

### Team List

**Features:**
- Search by team name or captain
- Filter by team type, status, flagged
- Pagination (50 teams per page)

**Columns:**
- Team name
- Captain (with link to user profile)
- Team type & competition level
- Status badges (active, flagged, recruiting)
- Actions

### Team Detail Page

**Path:** `/admin/teams/[id]`

**Information Displayed:**
- Full team details
- Captain information with link
- Roster size (current/max)
- Team average, achievements
- Moderation status and notes
- Created/updated timestamps

**Available Actions:**

#### Flag for Review
1. Click "Flag for Review"
2. Provide reason
3. Team is marked `flaggedForReview = true`
4. Flagged reason and timestamp recorded

**Use Cases:**
- Inappropriate team name
- Suspicious activity
- Terms of service violations

#### Unflag Team
1. Click "Unflag Team"
2. Provide resolution notes
3. Flag removed, moderation notes updated

#### Delete Team
1. Click "Delete Team"
2. Type exact team name to confirm
3. Provide deletion reason
4. Team deleted (cascade deletes members, invitations)

**⚠️ Warning:** Deletion is permanent and irreversible

---

## Reports System

**Path:** `/admin/reports`
**Permission:** `view_reports`, `resolve_reports`

### Report Status Workflow

```
pending → investigating → resolved
                    ↓
                dismissed
```

### Reports List

**Filter Tabs:**
- **Pending:** New reports requiring review
- **Investigating:** Reports under active review
- **Resolved:** Reports where action was taken
- **Dismissed:** Reports determined invalid

**Features:**
- Shows count in each status tab
- Displays reporter info
- Shows reported content type
- Reason and description
- Timestamp

### Report Detail Page

**Path:** `/admin/reports/[id]`

**Information Displayed:**
- Report type (user, team, message, bowling center)
- Reason selected
- Description provided by reporter
- Reporter information (with link to profile)
- Reported content (with link to view)
- Review history if previously reviewed

**Available Actions:**

#### Mark as Investigating
- Move from pending → investigating
- Add review notes (optional)

#### Resolve Report
- Mark as resolved
- **Required:** Resolution notes
- Optional: Action taken description
- Sets `reviewedAt` timestamp

#### Dismiss Report
- Mark as dismissed
- **Required:** Dismissal reason
- Use for invalid/duplicate reports

#### Reopen Report
- Available for resolved/dismissed reports
- Move back to pending status

**Best Practices:**
- Review reported content before taking action
- Document resolution in notes
- Take appropriate action on content (ban user, delete team, etc.)
- Respond consistently to similar reports

---

## Bowling Centers

**Path:** `/admin/centers`
**Permissions:** `view_centers`, `create_centers`, `edit_centers`, `delete_centers`

### Centers List

**Features:**
- Search by center name
- Statistics cards (total, verified, flagged)
- Table view with all centers
- Pagination

**Columns:**
- Center name and phone
- Location (city, state, zip)
- Lane count
- Status badges (verified, flagged)
- Edit link

### Create Center

**Path:** `/admin/centers/new`

**Required Fields:**
- Center name
- Street address
- City
- State (dropdown)
- ZIP code

**Optional Fields:**
- Phone number
- Website URL
- Lane count
- Verified checkbox

**Validation:**
- ZIP must be 5 digits
- State must be valid US state
- Website must be valid URL

### Edit Center

**Path:** `/admin/centers/[id]/edit`

**Features:**
- Edit all center information
- Mark as verified
- Update verification timestamp

**Fields:** Same as create form, pre-populated

---

## Analytics

**Path:** `/admin/analytics`
**Permission:** `view_analytics`

### Dashboard Features

**Time Range Selector:**
- Last 7 days
- Last 30 days
- Last 90 days

**Summary Cards:**
- Total teams
- Total centers
- Pending reports
- Verified centers

**Charts:**

#### 1. User Growth (Line Chart)
- Shows daily user registrations
- Data from Clerk user creation timestamps
- Responsive to time range selector

#### 2. Team Status (Bar Chart)
- Active teams
- Teams recruiting
- Flagged teams

#### 3. Report Distribution (Pie Chart)
- Pending
- Investigating
- Resolved
- Dismissed

**Export:**
- Click "Export CSV" button
- Downloads analytics summary
- Includes all metrics and export timestamp

---

## Audit Logs

**Path:** `/admin/audit-logs`
**Permission:** `view_audit_logs`

### Purpose
Complete, immutable history of all administrative actions for compliance and accountability.

### Features

**Search & Filter:**
- Search by target description
- Filter by action type (dropdown)
- Pagination (50 logs per page)

**Columns:**
- Timestamp
- Admin (name and role at time of action)
- Action type
- Target (type and description)
- Reason provided

**Export:**
- Click "Export CSV"
- Downloads up to 10,000 most recent logs
- Includes: timestamp, admin, action, target, reason, IP address, user agent

### Logged Actions

**User Actions:**
- user_locked
- user_unlocked
- user_banned
- user_unbanned
- user_usbc_verified
- user_profile_edited

**Team Actions:**
- team_edited
- team_deleted
- team_flagged
- team_unflagged

**Report Actions:**
- report_reviewed
- report_dismissed

**Center Actions:**
- center_created
- center_edited
- center_deleted

**Admin Actions:**
- admin_role_assigned
- admin_role_revoked

### Audit Log Contents

Each log entry captures:
- Admin ID and name
- Admin role at time of action
- Action type
- Target entity (type, ID, description)
- Reason provided
- Previous value (for edits)
- New value (for edits)
- IP address
- User agent
- Timestamp

---

## Admin Settings

**Path:** `/admin/settings`
**Permission:** `manage_admins` (super admins only)

### Admin User Management

**View:**
- Lists all admin users
- Shows role badges
- Displays assignment date
- Shows notes

**Assign Admin Role:**

1. Click "Assign Admin Role"
2. Enter user's email address
3. Select role:
   - super_admin
   - moderator
   - content_reviewer
   - support
4. Optional: Add notes about assignment
5. Confirm

**Process:**
- Searches user by email in Clerk
- Creates database user if doesn't exist
- Updates Clerk publicMetadata with role
- Creates admin_roles record
- Logs action to audit trail

**Revoke Admin Role:**

1. Click "Revoke" next to admin user
2. Type admin's name to confirm
3. Confirm action

**Process:**
- Removes role from Clerk publicMetadata
- Deletes admin_roles record
- Logs action to audit trail

**⚠️ Important:**
- You cannot revoke your own admin role
- User must already have an account
- Only one role per user (no overlapping roles)

---

## Best Practices

### Security

1. **Principle of Least Privilege**
   - Assign the minimum role needed
   - Review admin access quarterly
   - Remove inactive admins

2. **Always Provide Reasons**
   - Document why actions were taken
   - Helps with dispute resolution
   - Improves team knowledge sharing

3. **Review Audit Logs**
   - Spot unusual patterns
   - Verify team actions align with policies
   - Export logs for compliance

### User Moderation

1. **Use Lock Before Ban**
   - Lock for temporary issues
   - Ban only for severe violations

2. **Document Actions**
   - Always provide detailed reasons
   - Include evidence references
   - Follow consistent standards

3. **Review Reports Promptly**
   - Check pending reports daily
   - Respond within 24-48 hours
   - Communicate decisions when appropriate

### Team Moderation

1. **Flag Before Delete**
   - Give teams a chance to correct issues
   - Flag with clear reason
   - Only delete for severe violations

2. **Contact Captains**
   - Reach out before major actions
   - Allow time to respond
   - Document communications

### Content Review

1. **Consistent Standards**
   - Apply rules uniformly
   - Don't play favorites
   - Document edge cases

2. **Escalate When Uncertain**
   - Ask for second opinions
   - Consult moderator team
   - Document decision rationale

---

## Technical Notes

### Clerk Integration

The admin panel is tightly integrated with Clerk:

- **User ban/lock:** Uses Clerk's native APIs
- **Session management:** Clerk automatically invalidates sessions
- **Admin roles:** Stored in Clerk publicMetadata
- **User search:** Powered by Clerk's search API
- **Avatar images:** Served from Clerk

### Database Schema

**Admin Tables:**
- `admin_roles` - Tracks role assignments (audit trail)
- `admin_actions` - Complete audit log
- `reports` - User-submitted reports
- `permissions` - Permission definitions
- `role_permissions` - Role-permission mappings

**Modified Tables:**
- `users` - Added USBC verification fields
- `teams` - Added moderation fields
- `bowling_centers` - Added admin tracking fields

### Permissions System

20+ granular permissions across categories:
- User management (6 permissions)
- Team management (4 permissions)
- Center management (5 permissions)
- Report management (2 permissions)
- Analytics (2 permissions)
- Audit (1 permission)

**Permission Check Flow:**
1. Middleware verifies authentication
2. Layout verifies admin role exists
3. API routes check specific permissions
4. UI hides elements based on permissions

---

## Troubleshooting

### "Unauthorized" Error
- Verify you have an admin role assigned
- Check that your Clerk session is active
- Contact a super admin to verify role

### Can't See Menu Items
- Your role may lack permissions
- Contact super admin to review your role
- Check if specific permission is needed

### Actions Not Working
- Check audit logs for error messages
- Verify you have the required permission
- Try refreshing your browser session

### Toast Notifications Not Showing
- Check browser console for errors
- Verify JavaScript is enabled
- Clear browser cache

---

## Support

For admin panel issues:
1. Check this documentation
2. Review audit logs for errors
3. Contact super admins
4. Report bugs via GitHub issues

**GitHub:** https://github.com/anthropics/teamfinder

---

**Last Updated:** December 2025
**Version:** 1.0.0
**Maintainer:** TeamFinder Development Team
