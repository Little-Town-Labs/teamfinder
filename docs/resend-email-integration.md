# Resend Email Integration - TeamFinder

Complete guide for sending transactional emails using Resend.

---

## Overview

TeamFinder uses **Resend** (https://resend.com) for sending transactional emails like:
- Welcome emails after onboarding
- Team invitations
- Application notifications
- Message notifications
- Admin notifications

**Email Domain:** `littletownlabs.site`
**From Address:** `noreply@littletownlabs.site`

---

## Setup Complete ✅

- ✅ Resend domain verified (`littletownlabs.site`)
- ✅ SPF, DKIM, DMARC records configured
- ✅ Email templates created (`lib/email.ts`)
- ✅ Welcome email implemented (onboarding flow)
- ✅ Test endpoint created (`/api/test-email`)

---

## Environment Variables

### Local Development (`.env.local`)

```env
RESEND_API_KEY=re_your_actual_api_key_here
```

### Production (Vercel)

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add: `RESEND_API_KEY` = `re_your_actual_api_key_here`
3. Redeploy after adding

**Get API Key:** https://resend.com/api-keys

---

## Email Templates

All email templates are defined in `/lib/email.ts`.

### Available Templates

#### 1. Welcome Email
Sent after user completes onboarding.

```typescript
emailTemplates.welcome(
  to: string,        // User's email
  firstName: string  // User's first name
)
```

**Usage:**
```typescript
import { emailTemplates, resend } from "@/lib/email";

const emailData = emailTemplates.welcome(
  user.email,
  user.firstName || "Bowler"
);
await resend.emails.send(emailData);
```

#### 2. Team Invitation Email
Sent when a captain invites a player to join their team.

```typescript
emailTemplates.teamInvitation(
  to: string,            // Player's email
  playerName: string,    // Player's name
  teamName: string,      // Team name
  captainName: string,   // Captain's name
  invitationId: string   // Invitation ID for link
)
```

**Usage:**
```typescript
const emailData = emailTemplates.teamInvitation(
  invitedPlayer.email,
  invitedPlayer.firstName,
  team.name,
  captain.firstName,
  invitation.id
);
await resend.emails.send(emailData);
```

#### 3. Application Received Email
Sent to team captain when a player applies to join.

```typescript
emailTemplates.applicationReceived(
  to: string,            // Captain's email
  captainName: string,   // Captain's name
  playerName: string,    // Applicant's name
  teamName: string,      // Team name
  applicationId: string  // Application ID
)
```

**Usage:**
```typescript
const emailData = emailTemplates.applicationReceived(
  captain.email,
  captain.firstName,
  applicant.firstName,
  team.name,
  application.id
);
await resend.emails.send(emailData);
```

#### 4. Application Status Update Email
Sent to player when their application is accepted/declined.

```typescript
emailTemplates.applicationStatusUpdate(
  to: string,               // Player's email
  playerName: string,       // Player's name
  teamName: string,         // Team name
  status: "accepted" | "declined"
)
```

**Usage:**
```typescript
const emailData = emailTemplates.applicationStatusUpdate(
  player.email,
  player.firstName,
  team.name,
  "accepted"
);
await resend.emails.send(emailData);
```

#### 5. Message Notification Email
Sent when a user receives a new message.

```typescript
emailTemplates.messageNotification(
  to: string,              // Recipient's email
  recipientName: string,   // Recipient's name
  senderName: string,      // Sender's name
  messageId: string        // Message ID for link
)
```

**Usage:**
```typescript
const emailData = emailTemplates.messageNotification(
  recipient.email,
  recipient.firstName,
  sender.firstName,
  message.id
);
await resend.emails.send(emailData);
```

---

## How to Send Emails

### Basic Pattern

```typescript
import { emailTemplates, resend } from "@/lib/email";

// In an API route or server action
try {
  const emailData = emailTemplates.welcome(
    "user@example.com",
    "John"
  );

  const result = await resend.emails.send(emailData);

  console.log("Email sent:", result.data?.id);
} catch (error) {
  console.error("Email failed:", error);
  // Handle error (don't fail the main operation)
}
```

### Error Handling Best Practice

**Never fail the main operation if email fails:**

```typescript
// ✅ GOOD - Email failure doesn't break onboarding
const [profile] = await db.insert(playerProfiles).values(data).returning();

try {
  await resend.emails.send(emailTemplates.welcome(user.email, user.firstName));
} catch (emailError) {
  console.error("Failed to send welcome email:", emailError);
  // Continue - user's profile is still created
}

return NextResponse.json({ success: true, profile });
```

```typescript
// ❌ BAD - Email failure breaks onboarding
const [profile] = await db.insert(playerProfiles).values(data).returning();

// If this fails, onboarding fails
await resend.emails.send(emailTemplates.welcome(user.email, user.firstName));

return NextResponse.json({ success: true, profile });
```

---

## Testing Email Integration

### 1. Test Endpoint (Development Only)

**Test endpoint:** `/api/test-email`

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your_session_cookie" \
  -d '{"to":"your-email@example.com","firstName":"Test User"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "emailId": "abc123-def456"
}
```

**Important:** DELETE `/app/api/test-email/route.ts` before production deployment.

### 2. Test in Development

```bash
# Start dev server
pnpm dev

# Complete onboarding flow
# Welcome email will be sent automatically

# Check Resend dashboard
# https://resend.com/emails
```

### 3. Monitor Emails in Resend Dashboard

1. Go to https://resend.com/emails
2. View all sent emails
3. Check delivery status
4. View email content
5. See bounce/complaint reports

---

## Where Emails Are Currently Sent

### ✅ Implemented

1. **Welcome Email** - After onboarding (`/api/onboarding`)
   - Triggered when user completes profile
   - Sends to user's Clerk email address

### 🚧 TODO: Implement in These Workflows

2. **Team Invitation Email**
   - Create API: `/api/teams/[teamId]/invite`
   - Send email when captain invites player

3. **Application Received Email**
   - Create API: `/api/teams/[teamId]/applications`
   - Send email to captain when player applies

4. **Application Status Update Email**
   - Update API: `/api/applications/[id]/respond`
   - Send email when captain accepts/declines

5. **Message Notification Email**
   - Create API: `/api/messages`
   - Send email when user receives new message

---

## Adding New Email Templates

### Step 1: Define Template in `lib/email.ts`

```typescript
export const emailTemplates = {
  // ... existing templates

  /**
   * New custom email template
   */
  customTemplate: (to: string, data: any) => ({
    from: "TeamFinder <noreply@littletownlabs.site>",
    to,
    subject: "Your Custom Subject",
    html: `
      <h1>Custom Email</h1>
      <p>Hello ${data.name},</p>
      <p>Your custom message here.</p>
      <p>The TeamFinder Team</p>
    `,
  }),
};
```

### Step 2: Use Template in Your Code

```typescript
import { emailTemplates, resend } from "@/lib/email";

try {
  const emailData = emailTemplates.customTemplate(
    user.email,
    { name: user.firstName }
  );
  await resend.emails.send(emailData);
} catch (error) {
  console.error("Email failed:", error);
}
```

---

## Advanced: React Email Templates

For better-designed emails, use **React Email** (https://react.email):

### Install React Email

```bash
pnpm add react-email @react-email/components
```

### Create Email Component

Create `/emails/Welcome.tsx`:

```typescript
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  firstName: string;
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to TeamFinder - Find Your Perfect Bowling Team!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to TeamFinder, {firstName}!</Heading>

          <Text style={text}>
            We're excited to have you join our bowling community.
          </Text>

          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
          >
            Go to Dashboard
          </Button>

          <Text style={text}>
            Happy bowling!
            <br />
            The TeamFinder Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
  margin: "16px 0",
};
```

### Use React Email Template

```typescript
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/Welcome";
import { resend } from "@/lib/email";

const html = await render(WelcomeEmail({ firstName: user.firstName }));

await resend.emails.send({
  from: "TeamFinder <noreply@littletownlabs.site>",
  to: user.email,
  subject: "Welcome to TeamFinder",
  html,
});
```

---

## Email Deliverability Best Practices

### 1. DNS Records (Already Configured ✅)
- ✅ SPF: `v=spf1 include:spf.privateemail.com include:_spf.resend.com ~all`
- ✅ DKIM: Configured via Resend
- ✅ DMARC: `v=DMARC1; p=quarantine; rua=mailto:support@littletownlabs.site`

### 2. Email Content Best Practices
- ✅ Always include plain text version (optional but recommended)
- ✅ Use proper HTML structure
- ✅ Include unsubscribe link for marketing emails
- ✅ Avoid spam trigger words
- ✅ Include physical address for compliance (for marketing emails)

### 3. Sender Reputation
- ✅ Use verified domain
- ✅ Send from consistent "from" address
- ✅ Don't send too many emails too quickly (rate limiting)
- ✅ Monitor bounce rates
- ✅ Handle unsubscribes properly

### 4. Testing
- ✅ Test emails before production
- ✅ Check spam score: https://www.mail-tester.com/
- ✅ Test on multiple email clients (Gmail, Outlook, etc.)
- ✅ Monitor Resend dashboard for delivery issues

---

## Resend Dashboard

Monitor all emails at: https://resend.com/emails

**Features:**
- View all sent emails
- Check delivery status (delivered, bounced, opened)
- View email content
- See error logs
- Analytics and metrics
- Webhook configuration

---

## Troubleshooting

### Email Not Sending

1. **Check API Key:**
   ```bash
   # Verify RESEND_API_KEY is set
   echo $RESEND_API_KEY
   ```

2. **Check Resend Dashboard:**
   - https://resend.com/emails
   - Look for failed sends
   - Check error messages

3. **Check Console Logs:**
   ```bash
   # Look for Resend errors in logs
   Failed to send welcome email: [error details]
   ```

4. **Verify Domain:**
   - https://resend.com/domains
   - Ensure `littletownlabs.site` is verified

### Email Goes to Spam

1. **Check SPF/DKIM/DMARC:**
   - Use https://mxtoolbox.com/SuperTool.aspx
   - Verify all records are green

2. **Check Content:**
   - Avoid spam trigger words
   - Include unsubscribe link (for marketing)
   - Don't use all caps in subject

3. **Test Spam Score:**
   - Send test email to spam-checker@mail-tester.com
   - Visit https://www.mail-tester.com to see results

### Rate Limiting

Resend has rate limits based on your plan:
- **Free:** 100 emails/day, 3,000/month
- **Pro:** 50,000 emails/month
- **Enterprise:** Custom limits

**Handle rate limits:**
```typescript
try {
  await resend.emails.send(emailData);
} catch (error) {
  if (error.statusCode === 429) {
    console.error("Rate limit exceeded");
    // Queue email for later retry
  }
}
```

---

## Security Considerations

### 1. Never Expose API Key
- ❌ DON'T commit `.env` files
- ❌ DON'T hardcode API keys
- ✅ Use environment variables
- ✅ Add to `.gitignore`

### 2. Validate Email Addresses
```typescript
import { z } from "zod";

const emailSchema = z.string().email();

// Before sending
const validEmail = emailSchema.parse(userEmail);
```

### 3. Rate Limit Email Sending
- Prevent abuse by rate limiting
- Track email sends per user
- Add cooldown periods

### 4. User Consent
- Get user consent for marketing emails
- Honor unsubscribe requests immediately
- Keep records of consent (GDPR compliance)

---

## Next Steps

### Immediate
- [x] Update email domain to `littletownlabs.site`
- [x] Add welcome email to onboarding
- [x] Test email sending
- [ ] Delete test endpoint (`/api/test-email`)

### Short-term
- [ ] Implement team invitation emails
- [ ] Implement application notification emails
- [ ] Add email preferences to user settings
- [ ] Create unsubscribe functionality

### Long-term
- [ ] Migrate to React Email templates
- [ ] Add email analytics tracking
- [ ] Implement weekly digest emails
- [ ] Add admin notification emails

---

## Support

- **Resend Docs:** https://resend.com/docs
- **Resend Status:** https://status.resend.com
- **Resend Support:** support@resend.com
- **TeamFinder Support:** support@littletownlabs.site

---

**Last Updated:** December 23, 2024
**Version:** 1.0
