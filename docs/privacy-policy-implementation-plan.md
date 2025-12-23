# Privacy Policy Implementation Plan - TeamFinder
## Using GetTerms.io Service

---

## Executive Summary

Implement comprehensive privacy compliance for TeamFinder using GetTerms.io, covering Privacy Policy, Cookie Policy, and Terms of Service. This plan addresses GDPR, CCPA, and other major privacy regulations for our bowling team finder platform.

**Service Selected:** GetTerms.io Business Plan ($8/month annual or $249 lifetime)
**Timeline:** 1-2 weeks for complete implementation
**Compliance Coverage:** GDPR, CCPA/CPRA, CalOPPA, PIPEDA, Australian Privacy Principles

---

## 1. GetTerms.io Service Overview

### What GetTerms Provides

**Policy Generation:**
- Privacy Policy Generator
- Terms and Conditions Generator
- Cookie Policy Generator
- Return Policy Generator (optional for TeamFinder)

**Consent Management:**
- Cookie Consent Banner (customizable, unlimited views)
- Cookie Scanner (automated detection)
- Google Consent Mode v2 integration
- Geolocation/language detection
- Unlimited user consent logs

### Recommended Plan: Business Tier

**Cost:** $8/month (annual) | $12/month (monthly) | $249 lifetime per website

**Key Features:**
- ✅ All legal policies with unlimited edits
- ✅ Unlimited banner views
- ✅ Customizable cookie banner (no GetTerms branding)
- ✅ Unlimited cookie scans
- ✅ Multi-language support
- ✅ Google Consent Mode v2
- ✅ Privacy regulation monitoring
- ✅ 100% money-back guarantee (30 days)

**Why Business vs Starter:**
- No GetTerms branding (more professional)
- Unlimited banner views (Starter limited to 50k/month)
- Full customization of cookie banner
- Multi-language support (important for USBC members nationwide)

---

## 2. TeamFinder Privacy Analysis

### Data We Collect

**User Personal Information (via Clerk):**
- Email addresses
- Names (first, last)
- Phone numbers (optional)
- Profile images/avatars
- Authentication metadata

**Bowling-Specific Data:**
- USBC Member IDs (sensitive)
- Gender
- Bowling hand preference
- Current averages, high games, high series
- Years of experience
- Home bowling center location
- Bio/profile descriptions

**Team & Activity Data:**
- Team memberships
- Team creation/management
- Applications to teams
- Messages between users
- Activity logs
- Admin actions (for admin users)

**Technical Data:**
- IP addresses (for audit logs)
- User agents
- Session data
- Cookies (Clerk authentication, analytics)
- Usage statistics

### Third-Party Services Used

1. **Clerk** - Authentication & user management
2. **Vercel** - Hosting & deployment
3. **Neon/PostgreSQL** - Database storage
4. **Google Analytics** (if implemented) - Analytics
5. **Google Consent Mode v2** - Cookie consent (via GetTerms)

### Privacy Compliance Needs

**GDPR (European Users):**
- Right to access data
- Right to deletion
- Right to data portability
- Right to rectification
- Consent for data processing

**CCPA (California Users):**
- Right to know what data is collected
- Right to deletion
- Right to opt-out of data sale (N/A for TeamFinder)
- Non-discrimination for exercising rights

**General Requirements:**
- Clear privacy policy accessible from all pages
- Cookie consent banner
- Data breach notification procedures
- Data retention policies
- Children's privacy protection (COPPA - if applicable)

---

## 3. Implementation Strategy

### Phase 1: GetTerms Account Setup & Policy Generation (2-3 days)

#### Step 1.1: Create GetTerms Account
1. Sign up at https://getterms.io
2. Select **Business Plan** ($8/month annual recommended)
3. Complete payment and account verification

#### Step 1.2: Generate Privacy Policy
Follow GetTerms 7-step wizard:

1. **Select Use Case:** Website (SaaS/Web Application)
2. **Choose Policies:**
   - ✅ Privacy Policy
   - ✅ Cookie Policy
   - ✅ Terms and Conditions
   - ❌ Return Policy (not applicable)

3. **Company Details:**
   - Company Name: Little Town Labs (or your entity)
   - Website: https://teamfinder.littletownlabs.site
   - Contact Email: privacy@littletownlabs.site (create this)
   - Location: [Your business location]

4. **Customize Policy Sections:**
   Answer questions about:
   - What data you collect (see Section 2 above)
   - How you use the data
   - Third-party services (Clerk, Vercel, Neon)
   - Data retention periods
   - User rights (access, deletion, portability)
   - Cookie usage
   - Age restrictions (18+ for USBC membership)

5. **Compliance Contact:**
   - Data Protection Officer email (can be same as privacy@)
   - Physical address for legal compliance

6. **Select Privacy Laws:**
   - ✅ GDPR (EU)
   - ✅ CCPA/CPRA (California)
   - ✅ CalOPPA (California)
   - ✅ PIPEDA (Canada - for Canadian bowlers)
   - ✅ Australian Privacy Principles (if applicable)

7. **Publish:** Generate final policies

#### Step 1.3: Configure Cookie Consent Manager
1. Run GetTerms Cookie Scanner on https://teamfinder.littletownlabs.site
2. Review detected cookies (Clerk auth cookies, any analytics)
3. Categorize cookies:
   - **Strictly Necessary:** Clerk authentication
   - **Functional:** User preferences
   - **Analytics:** Google Analytics (if added)
   - **Marketing:** None currently
4. Configure cookie banner settings:
   - Position: Bottom center or bottom right
   - Colors: Match TeamFinder branding (blue/white/dark theme)
   - Language: English (add Spanish if needed)
   - Button text: "Accept All", "Reject All", "Customize"

### Phase 2: Database & Backend Changes (3-4 days)

#### Step 2.1: Add Privacy Consent Tracking Schema

Create new table: `drizzle/schema/privacy-consents.ts`

```typescript
export const privacyConsentTypeEnum = pgEnum("privacy_consent_type", [
  "privacy_policy",
  "terms_of_service",
  "cookie_policy",
  "marketing_emails",
]);

export const privacyConsents = pgTable("privacy_consents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  consentType: privacyConsentTypeEnum("consent_type").notNull(),
  consentVersion: text("consent_version").notNull(), // "1.0", "1.1", etc.
  accepted: boolean("accepted").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  consentedAt: timestamp("consented_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Index for quick lookups
index("idx_privacy_consents_user_id").on(table.userId);
index("idx_privacy_consents_type").on(table.consentType);
```

#### Step 2.2: Add Privacy Fields to Users Table

```typescript
// Add to users table in drizzle/schema/users.ts
privacyPolicyAcceptedAt: timestamp("privacy_policy_accepted_at"),
privacyPolicyVersion: text("privacy_policy_version"), // "1.0"
termsAcceptedAt: timestamp("terms_accepted_at"),
termsVersion: text("terms_version"), // "1.0"
cookieConsentGiven: boolean("cookie_consent_given").default(false),
marketingEmailsOptIn: boolean("marketing_emails_opt_in").default(false),
```

#### Step 2.3: Create Data Export API (GDPR Right to Access)

Create `/api/user/export-data/route.ts`:

```typescript
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, playerProfiles, teamMembers, messages, activityLogs } from "@/drizzle/schema";

export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user from database
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Gather all user data
  const [profile, teams, userMessages, activities] = await Promise.all([
    db.query.playerProfiles.findFirst({ where: eq(playerProfiles.userId, user.id) }),
    db.query.teamMembers.findMany({ where: eq(teamMembers.userId, user.id), with: { team: true } }),
    db.query.messages.findMany({ where: eq(messages.senderId, user.id) }),
    db.query.activityLogs.findMany({ where: eq(activityLogs.userId, user.id) }),
  ]);

  // Compile export package
  const exportData = {
    exportDate: new Date().toISOString(),
    personalInformation: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    },
    bowlingProfile: profile,
    teams: teams,
    messages: userMessages,
    activityHistory: activities,
  };

  // Return as downloadable JSON
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="teamfinder-data-export-${user.id}.json"`,
    },
  });
}
```

#### Step 2.4: Create Account Deletion API (GDPR Right to Erasure)

Create `/api/user/delete-account/route.ts`:

```typescript
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, playerProfiles, teamMembers, messages, activityLogs } from "@/drizzle/schema";

export async function POST() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Delete user data (cascade or manual deletion)
  await db.transaction(async (tx) => {
    // Delete related records
    await tx.delete(activityLogs).where(eq(activityLogs.userId, user.id));
    await tx.delete(messages).where(eq(messages.senderId, user.id));
    await tx.delete(teamMembers).where(eq(teamMembers.userId, user.id));
    await tx.delete(playerProfiles).where(eq(playerProfiles.userId, user.id));
    await tx.delete(users).where(eq(users.id, user.id));
  });

  // Delete from Clerk
  const client = await clerkClient();
  await client.users.deleteUser(clerkUserId);

  return NextResponse.json({ success: true, message: "Account deleted" });
}
```

### Phase 3: Frontend Integration (4-5 days)

#### Step 3.1: Create Privacy Policy Pages

Create static pages using GetTerms **Embed Code** method (auto-updates):

**File:** `app/privacy/page.tsx`
```typescript
import { Header } from "@/components/Header/Header";

export const metadata = {
  title: "Privacy Policy - TeamFinder",
  description: "TeamFinder Privacy Policy and data handling practices",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
          Privacy Policy
        </h1>

        {/* GetTerms Embed Code */}
        <div
          id="getterms-privacy-policy"
          dangerouslySetInnerHTML={{
            __html: `<!-- PASTE GETTERMS EMBED CODE HERE -->`
          }}
        />

        {/* Alternative: Use iframe */}
        {/* <iframe
          src="https://getterms.io/view/XXXXX/privacy"
          style={{ width: '100%', height: '100vh', border: 'none' }}
          title="Privacy Policy"
        /> */}
      </div>
    </>
  );
}
```

**File:** `app/terms/page.tsx`
```typescript
import { Header } from "@/components/Header/Header";

export const metadata = {
  title: "Terms of Service - TeamFinder",
  description: "TeamFinder Terms of Service and usage agreement",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
          Terms of Service
        </h1>

        {/* GetTerms Embed Code */}
        <div
          id="getterms-terms"
          dangerouslySetInnerHTML={{
            __html: `<!-- PASTE GETTERMS EMBED CODE HERE -->`
          }}
        />
      </div>
    </>
  );
}
```

**File:** `app/cookies/page.tsx`
```typescript
import { Header } from "@/components/Header/Header";

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
          Cookie Policy
        </h1>

        {/* GetTerms Embed Code */}
        <div
          id="getterms-cookies"
          dangerouslySetInnerHTML={{
            __html: `<!-- PASTE GETTERMS EMBED CODE HERE -->`
          }}
        />
      </div>
    </>
  );
}
```

#### Step 3.2: Add Cookie Consent Banner

GetTerms provides a script to inject into your site. Add to `app/layout.tsx`:

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* GetTerms Cookie Consent Script */}
        <script
          id="getterms-consent"
          src="https://cdn.getterms.io/banner.js"
          data-site-id="YOUR_SITE_ID"
          async
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

**Configuration via GetTerms Dashboard:**
- Banner position, colors, text
- Cookie categories
- Language/geolocation rules
- Google Consent Mode v2 integration

#### Step 3.3: Privacy Consent Flow on Onboarding

Update `app/onboarding/onboarding-form.tsx` to include privacy acceptance:

Add to formData state:
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  acceptPrivacyPolicy: false,
  acceptTermsOfService: false,
  optInMarketing: false,
});
```

Add to Step 3 (before completion):
```typescript
<div className="space-y-4 border-t pt-6 dark:border-gray-700">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
    Legal Agreements
  </h3>

  <label className="flex items-start">
    <input
      type="checkbox"
      name="acceptPrivacyPolicy"
      checked={formData.acceptPrivacyPolicy}
      onChange={handleInputChange}
      required
      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
    />
    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
      I have read and agree to the{" "}
      <a href="/privacy" target="_blank" className="text-blue-600 underline dark:text-blue-400">
        Privacy Policy
      </a>{" "}
      <span className="text-red-500 dark:text-red-400">*</span>
    </span>
  </label>

  <label className="flex items-start">
    <input
      type="checkbox"
      name="acceptTermsOfService"
      checked={formData.acceptTermsOfService}
      onChange={handleInputChange}
      required
      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
    />
    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
      I agree to the{" "}
      <a href="/terms" target="_blank" className="text-blue-600 underline dark:text-blue-400">
        Terms of Service
      </a>{" "}
      <span className="text-red-500 dark:text-red-400">*</span>
    </span>
  </label>

  <label className="flex items-start">
    <input
      type="checkbox"
      name="optInMarketing"
      checked={formData.optInMarketing}
      onChange={handleInputChange}
      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
    />
    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
      I want to receive updates and news about TeamFinder (optional)
    </span>
  </label>
</div>
```

Update `/api/onboarding/route.ts` to log consent:
```typescript
// After creating user profile, log privacy consents
await db.insert(privacyConsents).values([
  {
    userId: user.id,
    consentType: "privacy_policy",
    consentVersion: "1.0",
    accepted: true,
    ipAddress: request.headers.get("x-forwarded-for") || null,
    userAgent: request.headers.get("user-agent") || null,
  },
  {
    userId: user.id,
    consentType: "terms_of_service",
    consentVersion: "1.0",
    accepted: true,
    ipAddress: request.headers.get("x-forwarded-for") || null,
    userAgent: request.headers.get("user-agent") || null,
  },
]);

// Update user record
await db.update(users)
  .set({
    privacyPolicyAcceptedAt: new Date(),
    privacyPolicyVersion: "1.0",
    termsAcceptedAt: new Date(),
    termsVersion: "1.0",
    marketingEmailsOptIn: body.optInMarketing,
  })
  .where(eq(users.id, user.id));
```

#### Step 3.4: Add Footer Links

Update `components/Footer/Footer.tsx` (create if doesn't exist):

```typescript
export function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} TeamFinder. All rights reserved.
          </div>

          <div className="flex gap-6 text-sm">
            <a
              href="/privacy"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              Terms of Service
            </a>
            <a
              href="/cookies"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              Cookie Policy
            </a>
            <a
              href="mailto:privacy@littletownlabs.site"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

Add Footer to all layouts (landing page, dashboard, etc.)

#### Step 3.5: Create Privacy Settings Page

Create `app/settings/privacy/page.tsx`:

```typescript
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header/Header";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { PrivacySettingsClient } from "./PrivacySettingsClient";

export default async function PrivacySettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (!user) redirect("/onboarding");

  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Privacy Settings
        </h1>

        <PrivacySettingsClient
          marketingOptIn={user.marketingEmailsOptIn || false}
          privacyPolicyVersion={user.privacyPolicyVersion || "1.0"}
          termsVersion={user.termsVersion || "1.0"}
        />
      </div>
    </>
  );
}
```

Create `app/settings/privacy/PrivacySettingsClient.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/Button/Button";

interface PrivacySettingsClientProps {
  marketingOptIn: boolean;
  privacyPolicyVersion: string;
  termsVersion: string;
}

export function PrivacySettingsClient({
  marketingOptIn,
  privacyPolicyVersion,
  termsVersion
}: PrivacySettingsClientProps) {
  const router = useRouter();
  const [optIn, setOptIn] = useState(marketingOptIn);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarketingToggle = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/user/privacy-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingEmailsOptIn: !optIn }),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      setOptIn(!optIn);
      toast.success("Privacy settings updated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportData = async () => {
    toast.loading("Preparing your data...");
    window.location.href = "/api/user/export-data";
    setTimeout(() => toast.dismiss(), 2000);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    const confirmation = prompt(
      "Type 'DELETE' to confirm account deletion:"
    );

    if (confirmation !== "DELETE") {
      toast.error("Account deletion cancelled");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to delete account");

      toast.success("Account deleted. Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      toast.error("Failed to delete account");
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Marketing Preferences */}
      <section className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Marketing Preferences
        </h2>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={optIn}
            onChange={handleMarketingToggle}
            disabled={isUpdating}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Receive updates and news about TeamFinder
          </span>
        </label>
      </section>

      {/* Policy Versions */}
      <section className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Your Agreements
        </h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Privacy Policy accepted: Version {privacyPolicyVersion}</p>
          <p>Terms of Service accepted: Version {termsVersion}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <a href="/privacy" target="_blank">
            <Button intent="secondary" size="sm">View Privacy Policy</Button>
          </a>
          <a href="/terms" target="_blank">
            <Button intent="secondary" size="sm">View Terms</Button>
          </a>
        </div>
      </section>

      {/* Data Rights (GDPR) */}
      <section className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Your Data Rights
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Download Your Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get a copy of all your data in JSON format
            </p>
            <Button
              onClick={handleExportData}
              intent="secondary"
              size="sm"
              className="mt-2"
            >
              Export Data
            </Button>
          </div>

          <div className="border-t pt-4 dark:border-gray-700">
            <h3 className="font-medium text-red-600 dark:text-red-400">
              Delete Your Account
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Permanently delete your account and all associated data
            </p>
            <Button
              onClick={handleDeleteAccount}
              intent="secondary"
              size="sm"
              className="mt-2 border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
              disabled={isUpdating}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

Create API route `/api/user/privacy-settings/route.ts`:

```typescript
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

const privacySettingsSchema = z.object({
  marketingEmailsOptIn: z.boolean(),
});

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = privacySettingsSchema.parse(await request.json());

  await db
    .update(users)
    .set({ marketingEmailsOptIn: body.marketingEmailsOptIn })
    .where(eq(users.id, user.id));

  return NextResponse.json({ success: true });
}
```

### Phase 4: Testing & Documentation (2-3 days)

#### Step 4.1: Test Cookie Consent Flow
1. Clear browser cookies
2. Visit site and verify banner appears
3. Test "Accept All", "Reject All", "Customize" options
4. Verify cookie preferences are saved
5. Test geolocation detection (use VPN for EU testing)

#### Step 4.2: Test Privacy Flows
- ✅ Onboarding with privacy acceptance
- ✅ Privacy settings page functionality
- ✅ Data export (download JSON)
- ✅ Account deletion (full cascade)
- ✅ Marketing opt-in/opt-out
- ✅ Policy page loading (embed or iframe)

#### Step 4.3: Compliance Checklist

**GDPR Requirements:**
- [ ] Clear privacy policy accessible from all pages
- [ ] Cookie consent banner with granular controls
- [ ] Data export functionality (Right to Access)
- [ ] Account deletion functionality (Right to Erasure)
- [ ] Consent logging (who, when, what, version)
- [ ] Data retention policies documented
- [ ] Third-party processors listed in policy
- [ ] Privacy contact email (privacy@littletownlabs.site)

**CCPA Requirements:**
- [ ] "Do Not Sell My Personal Information" link (if selling data - N/A)
- [ ] Privacy policy discloses data collection
- [ ] Data deletion upon request
- [ ] Non-discrimination policy

**General Best Practices:**
- [ ] Privacy policy in plain language
- [ ] Last updated date on policies
- [ ] Version control for policy changes
- [ ] User notification on policy updates
- [ ] Secure data storage (encryption)
- [ ] Audit logging for data access

#### Step 4.4: Update Documentation

Add to `README.md`:
```markdown
## Privacy & Compliance

TeamFinder is committed to protecting user privacy and complying with GDPR, CCPA, and other data protection regulations.

- **Privacy Policy:** https://teamfinder.littletownlabs.site/privacy
- **Terms of Service:** https://teamfinder.littletownlabs.site/terms
- **Cookie Policy:** https://teamfinder.littletownlabs.site/cookies
- **Privacy Contact:** privacy@littletownlabs.site

### User Data Rights

Users can:
- Export their data (JSON format)
- Delete their account
- Manage cookie preferences
- Opt-in/out of marketing emails

Privacy settings available at `/settings/privacy`.
```

---

## 4. Implementation Phases Summary

### Phase 1: GetTerms Setup (2-3 days)
- Create account, select Business plan
- Generate privacy policy, terms, cookie policy
- Configure cookie consent banner
- Get embed codes

### Phase 2: Backend (3-4 days)
- Add privacy consent tracking schema
- Implement data export API
- Implement account deletion API
- Add privacy fields to user table
- Migration scripts

### Phase 3: Frontend (4-5 days)
- Create /privacy, /terms, /cookies pages
- Add cookie consent script to layout
- Update onboarding with privacy checkboxes
- Create privacy settings page
- Add footer with policy links
- Build data export/deletion UI

### Phase 4: Testing & Documentation (2-3 days)
- Test all privacy flows
- Compliance checklist verification
- Update README and docs
- Create privacy contact email
- Train on GDPR/CCPA request handling

**Total Timeline:** 11-15 days (1.5-2 weeks)

---

## 5. Ongoing Maintenance

### Regular Tasks

**Monthly:**
- Run GetTerms cookie scanner to detect new cookies
- Review and update cookie categorizations
- Check for policy updates from GetTerms

**Quarterly:**
- Review privacy policy for accuracy
- Update third-party service list
- Audit data retention practices
- Review consent logs

**Annually:**
- Full privacy compliance audit
- Update policy versions if regulations change
- Review GetTerms subscription renewal

### Policy Update Process

When GetTerms updates policies:
1. GetTerms notifies you of regulation changes
2. Review changes in GetTerms dashboard
3. Approve/customize updates
4. GetTerms publishes new version
5. **If using embed code:** Updates automatically on site
6. **If using manual copy:** Update manually
7. Increment version number (1.0 → 1.1)
8. Email active users about policy changes (if material changes)
9. Show policy update banner on next login

---

## 6. Cost Breakdown

| Item | Cost | Frequency |
|------|------|-----------|
| GetTerms Business Plan | $8/month | Annual ($96/year) |
| GetTerms Business Plan (Lifetime) | $249 | One-time |
| Privacy contact email setup | $0 | (Use existing domain) |
| Developer time | ~80 hours | One-time implementation |

**Recommended:** Lifetime plan at $249 (ROI after ~2 years vs annual)

---

## 7. Key Decisions

### Decision 1: Embed Method
**Options:**
1. **Embed Code (Recommended)** - Auto-updates, seamless integration
2. **Hosted Link** - Simplest, no code changes, external page
3. **Copy & Paste** - Full control, requires manual updates
4. **iframe** - Auto-updates, visible frame boundary

**Recommendation:** Use **Embed Code** for privacy/terms/cookies pages. Auto-updates ensure compliance without manual intervention.

### Decision 2: Cookie Banner Position
**Recommendation:** Bottom center with slide-up animation. Matches modern UX patterns, non-intrusive.

### Decision 3: Data Retention
**Recommendation:**
- Active users: Indefinite (while account active)
- Deleted accounts: 30-day grace period, then permanent deletion
- Audit logs: 7 years (legal compliance)
- Consent logs: Permanent (regulatory requirement)

### Decision 4: Age Restrictions
**Recommendation:** 18+ minimum age (aligns with USBC membership requirements). Add age verification to onboarding.

---

## 8. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| GetTerms service outage | Medium | Use embedded code (cached), have manual backup |
| Policy updates missed | High | Enable GetTerms email notifications |
| Non-compliant data handling | Critical | Regular compliance audits, legal review |
| User data breach | Critical | Encryption at rest/transit, security audits |
| Cookie consent bypass | Medium | Server-side enforcement where possible |
| Incomplete user deletion | High | Comprehensive cascade delete testing |

---

## 9. Success Criteria

✅ All users accept privacy policy and terms before using app
✅ Cookie consent banner appears for first-time visitors
✅ Users can export their data in <5 seconds
✅ Account deletion removes all PII within 30 days
✅ Privacy policy accessible from every page
✅ GetTerms policies auto-update without manual intervention
✅ Consent logging captures all required metadata
✅ GDPR/CCPA compliance verified by legal review
✅ No privacy-related user complaints or regulatory issues

---

## 10. Next Steps

1. **Immediate:**
   - [ ] Get approval for GetTerms Business plan purchase ($249 lifetime)
   - [ ] Set up privacy@littletownlabs.site email
   - [ ] Review data collection inventory (Section 2)

2. **Week 1:**
   - [ ] Create GetTerms account
   - [ ] Generate all policies
   - [ ] Configure cookie consent banner
   - [ ] Start Phase 2 (database changes)

3. **Week 2:**
   - [ ] Complete backend implementation
   - [ ] Build frontend pages
   - [ ] Integration testing

4. **Week 3:**
   - [ ] Final compliance review
   - [ ] Deploy to production
   - [ ] Monitor for issues

---

## Additional Resources

- GetTerms Documentation: https://getterms.io/blog/how-to-use-getterms-privacy-policy-generator
- GDPR Compliance Guide: https://gdpr.eu/compliance/
- CCPA Overview: https://oag.ca.gov/privacy/ccpa
- Next.js Security Best Practices: https://nextjs.org/docs/advanced-features/security-headers

---

**Plan Version:** 1.0
**Last Updated:** December 23, 2024
**Owner:** TeamFinder Development Team
