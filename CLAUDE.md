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

*Last updated: December 21, 2024*
*AI Assistant: Claude Sonnet 4.5*
