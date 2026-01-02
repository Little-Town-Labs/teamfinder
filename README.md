
# TeamFinder

A modern bowling team finder application built with Next.js 15. TeamFinder helps bowlers discover teams, find bowling centers, manage leagues, and connect with other players.

Built on the [Next.js Enterprise Boilerplate](https://blazity.com/open-source/nextjs-enterprise-boilerplate) foundation.

## Features

### 🎳 Bowling Center Directory
- **Browse & Search** - Find bowling centers by location, name, or amenities
- **Interactive Maps** - Mapbox integration with marker clustering
- **Proximity Search** - Find centers near you with distance filtering
- **Detailed Information** - Contact details, facility info, hours, and amenities
- **Community Edits** - Users can suggest updates, admins review and approve
- **Activity Integration** - See teams, leagues, and players at each center

### 👥 Team Management
- Create and manage bowling teams
- Team profiles with roster management
- Browse teams by location and type
- Team activity feeds
- **Team Invitations** - Captains can invite players via email
- **Player Applications** - Players apply to teams with cover letters
- **Application Management** - Accept/decline applications with auto-roster updates

### 👤 Player Profiles
- Personal bowling profiles with stats
- Affiliation management (USBC, state associations)
- Home bowling center assignment
- Player activity tracking

### 🏆 League Management
- League information and schedules
- Association with bowling centers
- Player and team integration

### 💬 Communication & Notifications
- **Direct Messaging** - Send messages between users with email notifications
- **Team Invitations** - Professional email invitations with 14-day expiry
- **Application Notifications** - Automated emails for team applications
- **Status Updates** - Email alerts for accepted/declined applications

### 🔐 Authentication & Access Control
- Clerk authentication integration
- Role-based access (admin/user)
- Protected routes and API endpoints
- Activity logging and audit trails

### 📊 Admin Panel (Full-Featured)
- **User Management** - Ban, lock, unlock users via Clerk API; USBC verification
- **Team Moderation** - Flag/unflag teams, delete teams, full CRUD operations
- **Reports System** - User-submitted reports with review workflow (pending/investigating/resolved/dismissed)
- **Bowling Center Management** - Full CRUD operations, review edit suggestions
- **Analytics Dashboard** - User growth charts, team stats, report metrics with CSV export
- **Audit Logs** - Complete audit trail of all admin actions with search and filtering
- **Role-Based Access Control** - 4 admin roles (super_admin, moderator, content_reviewer, support) with granular permissions
- **Admin Settings** - Manage admin roles, assign/revoke permissions

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- pnpm 10.0.0 (managed via Corepack)
- PostgreSQL database
- Clerk account for authentication
- Mapbox account for maps

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@localhost:5432/teamfinder

# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Mapbox (Required for maps - get token at https://account.mapbox.com/access-tokens/)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...

# Application (Required)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Note:** All variables are required for full functionality. Get Clerk credentials from [clerk.com](https://clerk.com) and Mapbox token from [mapbox.com](https://account.mapbox.com/access-tokens/).

### Installation

```bash
# Enable Corepack for pnpm
corepack enable

# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

### Admin Setup

To make a user an admin:

1. Sign up through the application
2. Go to your Clerk Dashboard
3. Find the user and edit their metadata
4. Add to `publicMetadata`:
   ```json
   {
     "role": "super_admin"
   }
   ```

#### Admin Roles

- **super_admin** - Full system access, can manage other admins
- **moderator** - User & team moderation, content management
- **content_reviewer** - Review reports and content only
- **support** - Read-only access for customer support

Access the admin panel at `/admin` after being assigned a role.

## Documentation

### Development Notes & Progress
- **[CLAUDE.md](./CLAUDE.md)** - Development notes, recent work, and implementation summaries (updated Jan 2026)

### User Guides
- **[Admin Panel Guide](./docs/admin-panel-guide.md)** - Complete admin panel user guide covering all moderation features and workflows (9,500+ words)

### Implementation & Technical Documentation
- **[Bowling Center Directory Plan](./docs/bowling-center-directory-plan.md)** - Complete 6-phase implementation plan with retrospective, performance metrics, and lessons learned
- **[Admin Panel Implementation Summary](./docs/admin-panel-implementation-summary.md)** - Technical architecture, patterns, and implementation details (8,500+ words)
- **[Admin Permissions Reference](./docs/admin-permissions-reference.md)** - Granular permission system documentation with RBAC details (8,000+ words)
- **[Organizations Feature](./docs/organizations-feature.md)** - Organizations feature specification

### Framework Documentation
- **[Next.js Enterprise Docs](https://docs.blazity.com)** - Original boilerplate documentation and best practices

## Technology Stack

### Application

* **[Clerk](https://clerk.com/)** - Authentication and user management
* **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database ORM for PostgreSQL
* **[PostgreSQL](https://www.postgresql.org/)** - Primary database
* **[Mapbox GL JS](https://www.mapbox.com/)** - Interactive maps with clustering
* **[react-map-gl](https://visgl.github.io/react-map-gl/)** - React wrapper for Mapbox
* **[Supercluster](https://github.com/mapbox/supercluster)** - Fast marker clustering
* **[Zod](https://zod.dev/)** - Schema validation
* **[Resend](https://resend.com/)** - Transactional email service
* **[React Email](https://react.email/)** - Email templates with React components
* **[Recharts](https://recharts.org/)** - Analytics charts and visualizations
* **[React Hot Toast](https://react-hot-toast.com/)** - Toast notifications

### Core Framework

* **[Next.js 15](https://nextjs.org/)** - React framework with App Router
* **[React 19](https://react.dev/)** - UI library
* **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS
* **[TypeScript](https://www.typescriptlang.org/)** - Type safety with strict mode
* **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
* **[CVA](http://cva.style/)** - Component variant system

### Developer Experience

* **[ESLint 9](https://eslint.org/)** & **[Prettier](https://prettier.io/)** - Code quality
* **[Vitest](https://vitest.dev)** - Unit testing
* **[Playwright](https://playwright.dev/)** - E2E testing
* **[Storybook](https://storybook.js.org/)** - Component development
* **[pnpm](https://pnpm.io/)** - Fast package manager
* **[T3 Env](https://env.t3.gg/)** - Type-safe environment variables
* **[Conventional Commits](https://www.conventionalcommits.org/)** - Commit standards

## Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm prettier         # Check code formatting
pnpm prettier:fix     # Fix code formatting

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:ui          # Open Vitest UI
pnpm test:coverage    # Generate coverage report
pnpm e2e:headless     # Run E2E tests
pnpm e2e:ui           # Run E2E tests with UI

# Storybook
pnpm storybook        # Start Storybook
pnpm build-storybook  # Build Storybook

# Analysis
pnpm analyze          # Analyze bundle size
```

## Project Structure

```
teamfinder/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin API endpoints
│   │   │   ├── analytics/        # Analytics data
│   │   │   ├── audit-logs/       # Audit log queries
│   │   │   ├── centers/          # Center CRUD
│   │   │   ├── reports/          # Report management
│   │   │   ├── settings/         # Admin settings
│   │   │   ├── teams/            # Team moderation
│   │   │   └── users/            # User management
│   │   ├── applications/         # Application responses
│   │   ├── bowling-centers/      # Public bowling center API
│   │   ├── messages/             # Direct messaging
│   │   ├── teams/                # Team management & invitations
│   │   └── reports/              # User report submission
│   ├── admin/                    # Admin panel pages
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── audit-logs/           # Audit log viewer
│   │   ├── centers/              # Center management
│   │   ├── reports/              # Report review
│   │   ├── settings/             # Admin settings
│   │   ├── teams/                # Team moderation
│   │   └── users/                # User management
│   ├── bowling-centers/          # Bowling center pages
│   │   ├── browse/               # Browse & search
│   │   └── [id]/                 # Center details
│   ├── teams/                    # Team pages
│   ├── players/                  # Player pages
│   └── profile/                  # User profile
├── components/                   # Reusable components
│   └── Admin/                    # Admin-specific components
├── drizzle/                      # Database schema
│   └── schema/                   # Table definitions
├── lib/                          # Utility functions
│   ├── admin/                    # Admin utilities
│   │   ├── permissions.ts        # Permission system
│   │   ├── clerk-integration.ts  # Clerk API integration
│   │   └── audit-logger.ts       # Admin action logging
│   ├── db.ts                     # Database connection
│   ├── geo-utils.ts              # Geospatial utilities
│   └── activity-logger.ts        # User activity logging
├── docs/                         # Documentation
└── public/                       # Static assets
```

## Deployment

### Vercel (Recommended)

TeamFinder is optimized for [Vercel](https://vercel.com) deployment:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production

Ensure these are set in your production environment:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token
- `NEXT_PUBLIC_BASE_URL` - Your production URL

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes using conventional commits
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT

---

Built with ❤️ using the [Next.js Enterprise Boilerplate](https://github.com/Blazity/next-enterprise)
