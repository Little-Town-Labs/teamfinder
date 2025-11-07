# TeamFinder Setup Guide

This guide will walk you through setting up the TeamFinder bowling matchmaking platform.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Neon DB (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Email**: Resend
- **Deployment**: Vercel
- **Language**: TypeScript

## Prerequisites

- Node.js 20+ installed
- pnpm 10+ installed
- A Neon DB account (https://neon.tech)
- A Clerk account (https://clerk.com)
- A Resend account (https://resend.com)
- A Vercel account (https://vercel.com) - for deployment

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Neon DB

1. Go to https://neon.tech and create a new project
2. Copy the connection string from the dashboard
3. The connection string should look like:
   ```
   postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require
   ```

### 3. Set Up Clerk Authentication

1. Go to https://dashboard.clerk.com and create a new application
2. Choose "Next.js" as your framework
3. Navigate to **API Keys** page
4. Copy:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

#### Configure Clerk Webhooks (Important!)

5. In Clerk Dashboard, go to **Webhooks** section
6. Click **Add Endpoint**
7. Set endpoint URL to: `https://your-domain.com/api/webhooks/clerk` (or `https://your-vercel-app.vercel.app/api/webhooks/clerk`)
8. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
9. Copy the **Signing Secret** (starts with `whsec_`)

### 4. Set Up Resend for Emails

1. Go to https://resend.com and create an account
2. Navigate to **API Keys**
3. Create a new API key
4. Copy the API key (starts with `re_`)

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all the values in `.env.local`:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6. Set Up Database Schema

1. Generate migration files:
   ```bash
   pnpm db:generate
   ```

2. Push schema to database:
   ```bash
   pnpm db:push
   ```

3. (Optional) Open Drizzle Studio to view your database:
   ```bash
   pnpm db:studio
   ```

### 7. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Database Schema Overview

The application includes the following tables:

- **users** - User accounts (synced with Clerk)
- **player_profiles** - Bowling-specific player information (USBC ID, averages, availability)
- **bowling_centers** - Directory of bowling alleys
- **teams** - Team information
- **team_members** - Team roster (junction table)
- **team_invitations** - Invitations sent by teams to players
- **player_applications** - Applications from players to join teams
- **messages** - Direct messaging between users
- **leagues** - League information

## Key Features to Implement

### Phase 1 (MVP)
- [ ] User onboarding flow (collect USBC ID)
- [ ] Player profile creation/editing
- [ ] Team creation
- [ ] Browse teams/players
- [ ] Send invitations
- [ ] Apply to teams
- [ ] Direct messaging

### Phase 2
- [ ] Advanced search/filters
- [ ] USBC ID verification
- [ ] Team statistics
- [ ] Matchmaking algorithm
- [ ] Bowling center directory
- [ ] Calendar integration

### Phase 3
- [ ] League management
- [ ] Rating/review system
- [ ] Advanced analytics
- [ ] Mobile app (PWA)

## Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run tests
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio
```

## Deployment to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com and import your repository
3. Add all environment variables from `.env.local` to Vercel's environment variables section
4. Deploy!

**Important**: After deployment, update your Clerk webhook URL to point to your production domain.

## Support

For issues or questions, refer to the documentation:
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Clerk Docs](https://clerk.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Neon Docs](https://neon.tech/docs)
