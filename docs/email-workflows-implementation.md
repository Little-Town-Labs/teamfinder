# Email Workflows Implementation Guide

Complete guide for implementing all email workflows in TeamFinder.

---

## Overview

This document outlines the implementation of email notifications for:
1. ✅ **Welcome Emails** - IMPLEMENTED (onboarding)
2. 🚧 **Team Invitations** - TODO
3. 🚧 **Application Notifications** - TODO
4. 🚧 **Application Status Updates** - TODO
5. 🚧 **Message Notifications** - TODO

---

## 1. Welcome Email (✅ IMPLEMENTED)

**Trigger:** User completes onboarding
**Location:** `app/api/onboarding/route.ts`
**Template:** `emails/Welcome.tsx`

**Implementation:**
```typescript
// After creating player profile
try {
  const emailData = await emailTemplates.welcome(
    user!.email,
    user!.firstName || "Bowler",
  );
  await resend.emails.send(emailData);
  console.log("Welcome email sent to:", user!.email);
} catch (emailError) {
  console.error("Failed to send welcome email:", emailError);
}
```

**Status:** ✅ Live in production

---

## 2. Team Invitation Email (🚧 TODO)

**Trigger:** Team captain invites a player to join their team
**Template:** `emails/TeamInvitation.tsx`
**Recipient:** Invited player
**From:** Team captain

### Database Schema

Already exists in `drizzle/schema/team-invitations.ts`:

```typescript
export const teamInvitations = pgTable("team_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  invitedUserId: uuid("invited_user_id").notNull().references(() => users.id),
  invitedByUserId: uuid("invited_by_user_id").notNull().references(() => users.id),
  status: invitationStatusEnum("status").notNull().default("pending"),
  message: text("message"),
  expiresAt: timestamp("expires_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### API Route to Create

**File:** `app/api/teams/[teamId]/invite/route.ts`

```typescript
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { teamInvitations, teams, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { emailTemplates, resend } from "@/lib/email";

const inviteSchema = z.object({
  invitedUserId: z.string().uuid(),
  message: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;
    const body = inviteSchema.parse(await request.json());

    // Get captain (current user)
    const captain = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!captain) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get team and verify captain ownership
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.captainUserId !== captain.id) {
      return NextResponse.json(
        { error: "Only team captain can send invitations" },
        { status: 403 }
      );
    }

    // Get invited player
    const invitedPlayer = await db.query.users.findFirst({
      where: eq(users.id, body.invitedUserId),
    });

    if (!invitedPlayer) {
      return NextResponse.json({ error: "Invited user not found" }, { status: 404 });
    }

    // Check if invitation already exists
    const existingInvitation = await db.query.teamInvitations.findFirst({
      where: (invitations, { and, eq }) =>
        and(
          eq(invitations.teamId, teamId),
          eq(invitations.invitedUserId, body.invitedUserId),
          eq(invitations.status, "pending")
        ),
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent to this player" },
        { status: 400 }
      );
    }

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // 14 days expiry

    const [invitation] = await db
      .insert(teamInvitations)
      .values({
        teamId,
        invitedUserId: body.invitedUserId,
        invitedByUserId: captain.id,
        message: body.message || null,
        status: "pending",
        expiresAt,
      })
      .returning();

    // Send email
    try {
      const emailData = await emailTemplates.teamInvitation(
        invitedPlayer.email,
        invitedPlayer.firstName || "Bowler",
        team.name,
        captain.firstName || "Team Captain",
        invitation.id
      );
      await resend.emails.send(emailData);
      console.log("Team invitation email sent to:", invitedPlayer.email);
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't fail the invitation if email fails
    }

    return NextResponse.json({ success: true, invitation }, { status: 201 });
  } catch (error) {
    console.error("Error sending invitation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
```

### Frontend Integration

**File:** `app/teams/[id]/InvitePlayerButton.tsx` (create this)

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function InvitePlayerButton({ teamId, playerId }: { teamId: string; playerId: string }) {
  const router = useRouter();
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    setIsInviting(true);

    try {
      const response = await fetch(`/api/teams/${teamId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitedUserId: playerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send invitation");
      }

      toast.success("Invitation sent successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <button
      onClick={handleInvite}
      disabled={isInviting}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {isInviting ? "Sending..." : "Invite to Team"}
    </button>
  );
}
```

---

## 3. Application Received Email (🚧 TODO)

**Trigger:** Player applies to join a team
**Template:** `emails/ApplicationReceived.tsx`
**Recipient:** Team captain
**From:** Applying player

### API Route to Create

**File:** `app/api/teams/[teamId]/apply/route.ts`

```typescript
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { playerApplications, teams, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { emailTemplates, resend } from "@/lib/email";

const applicationSchema = z.object({
  coverLetter: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;
    const body = applicationSchema.parse(await request.json());

    // Get applicant (current user)
    const applicant = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!applicant) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get team and captain
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      with: {
        captain: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if application already exists
    const existingApplication = await db.query.playerApplications.findFirst({
      where: (applications, { and, eq }) =>
        and(
          eq(applications.teamId, teamId),
          eq(applications.applicantUserId, applicant.id),
          eq(applications.status, "pending")
        ),
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this team" },
        { status: 400 }
      );
    }

    // Create application
    const [application] = await db
      .insert(playerApplications)
      .values({
        teamId,
        applicantUserId: applicant.id,
        coverLetter: body.coverLetter || null,
        status: "pending",
      })
      .returning();

    // Send email to captain
    try {
      const emailData = await emailTemplates.applicationReceived(
        team.captain.email,
        team.captain.firstName || "Captain",
        applicant.firstName || "Player",
        team.name,
        application.id
      );
      await resend.emails.send(emailData);
      console.log("Application notification sent to:", team.captain.email);
    } catch (emailError) {
      console.error("Failed to send application email:", emailError);
      // Don't fail the application if email fails
    }

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("Error submitting application:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
```

---

## 4. Application Status Update Email (🚧 TODO)

**Trigger:** Captain accepts or declines a player's application
**Template:** `emails/ApplicationStatus.tsx`
**Recipient:** Applying player
**From:** Team captain

### API Route to Create

**File:** `app/api/applications/[applicationId]/respond/route.ts`

```typescript
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { playerApplications, teamMembers, teams, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { emailTemplates, resend } from "@/lib/email";

const responseSchema = z.object({
  status: z.enum(["accepted", "declined"]),
  message: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId } = await params;
    const body = responseSchema.parse(await request.json());

    // Get captain (current user)
    const captain = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!captain) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get application with team and applicant
    const application = await db.query.playerApplications.findFirst({
      where: eq(playerApplications.id, applicationId),
      with: {
        team: true,
        applicant: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Verify captain ownership
    if (application.team.captainUserId !== captain.id) {
      return NextResponse.json(
        { error: "Only team captain can respond to applications" },
        { status: 403 }
      );
    }

    // Check if already responded
    if (application.status !== "pending") {
      return NextResponse.json(
        { error: "Application already processed" },
        { status: 400 }
      );
    }

    // Update application status
    const [updatedApplication] = await db
      .update(playerApplications)
      .set({
        status: body.status,
        reviewedByUserId: captain.id,
        reviewedAt: new Date(),
        message: body.message || null,
      })
      .where(eq(playerApplications.id, applicationId))
      .returning();

    // If accepted, add player to team
    if (body.status === "accepted") {
      await db.insert(teamMembers).values({
        teamId: application.teamId,
        userId: application.applicantUserId,
        role: "member",
        joinedAt: new Date(),
      });
    }

    // Send email to applicant
    try {
      const emailData = await emailTemplates.applicationStatusUpdate(
        application.applicant.email,
        application.applicant.firstName || "Bowler",
        application.team.name,
        body.status
      );
      await resend.emails.send(emailData);
      console.log(`Application ${body.status} email sent to:`, application.applicant.email);
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Don't fail the response if email fails
    }

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error("Error responding to application:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to respond to application" },
      { status: 500 }
    );
  }
}
```

---

## 5. Message Notification Email (🚧 TODO)

**Trigger:** User receives a new message
**Template:** `emails/MessageNotification.tsx`
**Recipient:** Message recipient
**From:** Message sender

### Database Schema Needed

**File:** `drizzle/schema/messages.ts` (if not exists, create)

```typescript
import { pgEnum, pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").notNull().references(() => users.id),
  recipientId: uuid("recipient_id").notNull().references(() => users.id),
  subject: text("subject"),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
```

### API Route to Create

**File:** `app/api/messages/route.ts`

```typescript
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { messages, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { emailTemplates, resend } from "@/lib/email";

const messageSchema = z.object({
  recipientId: z.string().uuid(),
  subject: z.string().optional(),
  body: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = messageSchema.parse(await request.json());

    // Get sender (current user)
    const sender = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });

    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recipient
    const recipient = await db.query.users.findFirst({
      where: eq(users.id, body.recipientId),
    });

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    // Create message
    const [message] = await db
      .insert(messages)
      .values({
        senderId: sender.id,
        recipientId: body.recipientId,
        subject: body.subject || null,
        body: body.body,
      })
      .returning();

    // Send email notification
    try {
      const messagePreview = body.body.length > 100
        ? body.body.substring(0, 100) + "..."
        : body.body;

      const emailData = await emailTemplates.messageNotification(
        recipient.email,
        recipient.firstName || "Bowler",
        sender.firstName || "TeamFinder User",
        message.id,
        messagePreview
      );
      await resend.emails.send(emailData);
      console.log("Message notification sent to:", recipient.email);
    } catch (emailError) {
      console.error("Failed to send message notification:", emailError);
      // Don't fail the message if email fails
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
```

---

## Implementation Priority

### Phase 1 (High Priority)
1. ✅ Welcome Email - DONE
2. 🚧 Team Invitations - Implement next
3. 🚧 Application Notifications - Implement next

### Phase 2 (Medium Priority)
4. 🚧 Application Status Updates - Needed for team management
5. 🚧 Message Notifications - Nice to have

### Phase 3 (Future Enhancements)
- Weekly digest emails
- Team activity summaries
- League reminders
- USBC verification reminders

---

## Testing Strategy

### 1. Unit Tests (Email Templates)

```typescript
// __tests__/emails/Welcome.test.tsx
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/Welcome";

describe("WelcomeEmail", () => {
  it("renders with firstName", async () => {
    const html = await render(WelcomeEmail({ firstName: "John" }));
    expect(html).toContain("Welcome to TeamFinder, John!");
  });

  it("includes dashboard link", async () => {
    const html = await render(WelcomeEmail({ firstName: "John" }));
    expect(html).toContain("/dashboard");
  });
});
```

### 2. Integration Tests (API Routes)

```typescript
// Test invitation email sending
it("sends email when invitation is created", async () => {
  const response = await POST(mockRequest, { params: { teamId: "team-123" } });
  expect(response.status).toBe(201);
  expect(resend.emails.send).toHaveBeenCalled();
});
```

### 3. Manual Testing Checklist

- [ ] Welcome email received after onboarding
- [ ] Team invitation email received with correct team name
- [ ] Application email sent to captain
- [ ] Accepted application email sent to player
- [ ] Declined application email sent to player
- [ ] Message notification email sent
- [ ] All emails render correctly on mobile
- [ ] All links work correctly
- [ ] Emails don't go to spam (check with mail-tester.com)

---

## Monitoring & Analytics

### Email Metrics to Track

1. **Delivery Rate** - % of emails successfully delivered
2. **Open Rate** - % of emails opened
3. **Click Rate** - % of emails with link clicks
4. **Bounce Rate** - % of emails that bounced
5. **Unsubscribe Rate** - % of users unsubscribing

### Resend Dashboard

Monitor at: https://resend.com/emails

- View all sent emails
- Check delivery status
- See open/click rates
- Monitor bounce/complaint rates

---

## Troubleshooting

### Email Not Sending

1. Check Resend API key is set
2. Check console logs for errors
3. Verify email address is valid
4. Check Resend dashboard for failures

### Email Goes to Spam

1. Verify SPF/DKIM/DMARC records
2. Check email content for spam triggers
3. Test with mail-tester.com
4. Review Resend deliverability tips

### Template Rendering Issues

1. Check React Email component syntax
2. Verify all props are passed correctly
3. Test rendering locally with `pnpm email dev`
4. Check browser console for errors

---

## Next Steps

1. **Implement Team Invitation API** - Priority 1
2. **Implement Application API** - Priority 2
3. **Add Email Preferences** - Allow users to control notifications
4. **Create Email Preview Page** - `/admin/emails/preview`
5. **Add Unsubscribe Functionality** - GDPR compliance

---

**Last Updated:** December 23, 2024
**Status:** React Email templates created, workflows in progress
