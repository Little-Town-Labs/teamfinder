import { Resend } from "resend";
import { env } from "../env.mjs";

// Create Resend client
export const resend = new Resend(env.RESEND_API_KEY);

// Email templates and helpers
export const emailTemplates = {
  /**
   * Welcome email when user signs up
   */
  welcome: (to: string, firstName: string) => ({
    from: "TeamFinder <noreply@yourdomain.com>",
    to,
    subject: "Welcome to TeamFinder - Find Your Perfect Bowling Team!",
    html: `
      <h1>Welcome to TeamFinder, ${firstName}!</h1>
      <p>We're excited to have you join our bowling community.</p>
      <p>Get started by completing your player profile and adding your USBC Member ID to unlock all features.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding">Complete Your Profile</a></p>
      <p>Happy bowling!</p>
      <p>The TeamFinder Team</p>
    `,
  }),

  /**
   * Team invitation email
   */
  teamInvitation: (
    to: string,
    playerName: string,
    teamName: string,
    captainName: string,
    invitationId: string,
  ) => ({
    from: "TeamFinder <noreply@yourdomain.com>",
    to,
    subject: `You've been invited to join ${teamName}!`,
    html: `
      <h1>Team Invitation</h1>
      <p>Hi ${playerName},</p>
      <p>${captainName} has invited you to join <strong>${teamName}</strong>!</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invitations/${invitationId}">View Invitation</a></p>
      <p>The TeamFinder Team</p>
    `,
  }),

  /**
   * Application received email (to team captain)
   */
  applicationReceived: (
    to: string,
    captainName: string,
    playerName: string,
    teamName: string,
    applicationId: string,
  ) => ({
    from: "TeamFinder <noreply@yourdomain.com>",
    to,
    subject: `New application for ${teamName}`,
    html: `
      <h1>New Team Application</h1>
      <p>Hi ${captainName},</p>
      <p><strong>${playerName}</strong> has applied to join your team <strong>${teamName}</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/teams/applications/${applicationId}">Review Application</a></p>
      <p>The TeamFinder Team</p>
    `,
  }),

  /**
   * Application status update (to player)
   */
  applicationStatusUpdate: (
    to: string,
    playerName: string,
    teamName: string,
    status: "accepted" | "declined",
  ) => ({
    from: "TeamFinder <noreply@yourdomain.com>",
    to,
    subject: `Your application to ${teamName} - ${status === "accepted" ? "Accepted" : "Declined"}`,
    html: `
      <h1>Application Update</h1>
      <p>Hi ${playerName},</p>
      ${
        status === "accepted"
          ? `
        <p>Congratulations! Your application to join <strong>${teamName}</strong> has been accepted!</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/teams">View Your Teams</a></p>
      `
          : `
        <p>Thank you for your interest in <strong>${teamName}</strong>. Unfortunately, your application was not accepted at this time.</p>
        <p>Keep looking for other great teams on TeamFinder!</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/teams/search">Browse Teams</a></p>
      `
      }
      <p>The TeamFinder Team</p>
    `,
  }),

  /**
   * New message notification
   */
  messageNotification: (
    to: string,
    recipientName: string,
    senderName: string,
    messageId: string,
  ) => ({
    from: "TeamFinder <noreply@yourdomain.com>",
    to,
    subject: `New message from ${senderName}`,
    html: `
      <h1>New Message</h1>
      <p>Hi ${recipientName},</p>
      <p>You have a new message from <strong>${senderName}</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/messages/${messageId}">Read Message</a></p>
      <p>The TeamFinder Team</p>
    `,
  }),
};
