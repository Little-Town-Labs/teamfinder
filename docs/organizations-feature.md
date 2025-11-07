# Organizations Feature - Future Implementation

## Overview

Add an organizational hierarchy layer to manage multiple teams under a single organization entity.

## Purpose

Organizations will provide a structure for managing groups of teams, enabling:
- League management across multiple teams
- Bowling center coordination
- Corporate/social league administration
- Regional bowling associations

## Organizational Hierarchy

```
Organization (e.g., "City Bowling League", "ABC Bowling Association")
  ├── Multiple Teams
  │     ├── Team Members (Players)
  │     └── Team Captain
  ├── Organization Admin(s)
  ├── Leagues (managed by organization)
  └── Bowling Centers (associated locations)
```

## Use Cases

### 1. Bowling Leagues
- League organizers oversee all teams
- Manage league-wide schedules and standings
- Handle registration and fees
- Track team performance across seasons

### 2. Bowling Centers
- Center management coordinates schedules
- Manage lane assignments
- Track all teams bowling at their location
- Handle center-specific communications

### 3. Competitive Associations
- Regional/state bowling associations
- Manage multiple competitive teams
- Coordinate tournaments
- Track rankings across teams

### 4. Corporate/Social Leagues
- Company teams competing internally
- Social clubs with multiple teams
- Private league management

## Key Benefits

- **Multi-team management** - Admins can manage multiple teams at once
- **Shared resources** - Common bowling centers, schedules, rosters
- **Hierarchical permissions** - Organization admins, team captains, members
- **League standings** - Track performance across all teams in organization
- **Billing/Payments** - Organization-level payment management
- **Communication** - Org-wide announcements, team-specific messages
- **Branding** - Organization logos, colors, custom domains

## Proposed Database Schema

### organizations table
```typescript
{
  id: uuid (PK)
  name: string
  slug: string (unique, for URLs)
  description: text
  logo_url: string

  // Organization type
  type: enum('league', 'bowling_center', 'association', 'corporate', 'social')

  // Contact & Location
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  zip_code: string

  // Settings
  is_public: boolean (can teams/players find and join)
  requires_approval: boolean (admin must approve new teams)
  settings: jsonb (custom settings per org type)

  // Owner/Creator
  owner_id: uuid (FK -> users.id)

  // Metadata
  created_at: timestamp
  updated_at: timestamp
  is_active: boolean
}
```

### organization_members table (junction table)
```typescript
{
  id: uuid (PK)
  organization_id: uuid (FK -> organizations.id)
  user_id: uuid (FK -> users.id)
  role: enum('owner', 'admin', 'member', 'viewer')
  joined_at: timestamp
  left_at: timestamp
}
```

### Update teams table
Add:
```typescript
{
  organization_id: uuid (FK -> organizations.id, nullable)
  // Null means independent team not part of any organization
}
```

### Update leagues table
Add:
```typescript
{
  organization_id: uuid (FK -> organizations.id, nullable)
  // Link leagues to organizations
}
```

## Features to Implement

### Organization Management
- [ ] Create/edit organization profile
- [ ] Upload organization logo and branding
- [ ] Set organization type and visibility
- [ ] Configure organization settings

### Team Management
- [ ] Add/remove teams from organization
- [ ] View all teams in organization
- [ ] Set team status (active/inactive)
- [ ] Transfer team ownership within org

### Member Management
- [ ] Invite users to organization
- [ ] Assign roles (owner, admin, member, viewer)
- [ ] Remove members
- [ ] View member activity

### League Management
- [ ] Create leagues within organization
- [ ] Assign teams to leagues
- [ ] Manage league schedules
- [ ] Track league standings

### Communication
- [ ] Organization-wide announcements
- [ ] Team-specific messaging
- [ ] Event notifications
- [ ] Email integration via Resend

### Permissions System
- **Owner**: Full control, can delete organization
- **Admin**: Manage teams, members, leagues
- **Member**: View organization data, participate in teams
- **Viewer**: Read-only access

### Billing (Future)
- Organization-level subscriptions
- Team registration fees
- Payment tracking
- Invoice generation

## Implementation Phases

### Phase 1: Core Structure
1. Create organizations, organization_members tables
2. Update teams and leagues tables with organization_id
3. Basic CRUD operations for organizations

### Phase 2: Team Integration
1. Allow teams to join/leave organizations
2. Organization approval workflow
3. Organization dashboard showing all teams

### Phase 3: Advanced Features
1. League management within organizations
2. Organization-wide statistics and reporting
3. Custom branding and settings
4. Multi-organization support (users can belong to multiple orgs)

### Phase 4: Advanced Admin
1. Detailed permissions system
2. Organization analytics
3. Billing and payment integration
4. Custom domains for organizations

## API Endpoints (Future)

```
POST   /api/organizations              - Create organization
GET    /api/organizations/:id          - Get organization details
PUT    /api/organizations/:id          - Update organization
DELETE /api/organizations/:id          - Delete organization

GET    /api/organizations/:id/teams    - List all teams
POST   /api/organizations/:id/teams    - Add team to org
DELETE /api/organizations/:id/teams/:teamId - Remove team

GET    /api/organizations/:id/members  - List members
POST   /api/organizations/:id/members  - Invite member
PUT    /api/organizations/:id/members/:userId - Update member role
DELETE /api/organizations/:id/members/:userId - Remove member

GET    /api/organizations/:id/leagues  - List leagues
POST   /api/organizations/:id/leagues  - Create league
```

## UI/UX Considerations

- Organization switcher in header (like GitHub/Discord)
- Separate dashboards for personal vs organization view
- Clear hierarchy visualization (org → teams → members)
- Organization directory/discovery page
- Join organization flow for teams/players

## Notes

- Organizations should be optional - independent teams can still exist
- Consider multi-tenancy for larger bowling centers/leagues
- Integration with USBC for official league verification
- Mobile-friendly organization management

---

**Status**: Not yet implemented
**Priority**: Medium (implement after core player/team features are stable)
**Estimated Effort**: 2-3 weeks
**Dependencies**: Core team and player features must be complete first
