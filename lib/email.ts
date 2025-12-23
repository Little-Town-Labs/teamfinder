import { render } from "@react-email/render";
import { Resend } from "resend";

import ApplicationReceivedEmail from "@/emails/ApplicationReceived";
import ApplicationStatusEmail from "@/emails/ApplicationStatus";
import MessageNotificationEmail from "@/emails/MessageNotification";
import TeamInvitationEmail from "@/emails/TeamInvitation";
import WelcomeEmail from "@/emails/Welcome";

import { env } from "../env.mjs";

// Create Resend client
export const resend = new Resend(env.RESEND_API_KEY);

// Email templates using React Email
export const emailTemplates = {
  /**
   * Welcome email when user signs up
   */
  welcome: async (to: string, firstName: string) => {
    const html = await render(WelcomeEmail({ firstName }));

    return {
      from: "TeamFinder <noreply@littletownlabs.site>",
      to,
      subject: "Welcome to TeamFinder - Find Your Perfect Bowling Team!",
      html,
    };
  },

  /**
   * Team invitation email
   */
  teamInvitation: async (
    to: string,
    playerName: string,
    teamName: string,
    captainName: string,
    invitationId: string,
  ) => {
    const html = await render(
      TeamInvitationEmail({ playerName, teamName, captainName, invitationId }),
    );

    return {
      from: "TeamFinder <noreply@littletownlabs.site>",
      to,
      subject: `You've been invited to join ${teamName}!`,
      html,
    };
  },

  /**
   * Application received email (to team captain)
   */
  applicationReceived: async (
    to: string,
    captainName: string,
    playerName: string,
    teamName: string,
    applicationId: string,
  ) => {
    const html = await render(
      ApplicationReceivedEmail({ captainName, playerName, teamName, applicationId }),
    );

    return {
      from: "TeamFinder <noreply@littletownlabs.site>",
      to,
      subject: `New application for ${teamName}`,
      html,
    };
  },

  /**
   * Application status update (to player)
   */
  applicationStatusUpdate: async (
    to: string,
    playerName: string,
    teamName: string,
    status: "accepted" | "declined",
  ) => {
    const html = await render(ApplicationStatusEmail({ playerName, teamName, status }));

    return {
      from: "TeamFinder <noreply@littletownlabs.site>",
      to,
      subject: `Your application to ${teamName} - ${status === "accepted" ? "Accepted" : "Declined"}`,
      html,
    };
  },

  /**
   * New message notification
   */
  messageNotification: async (
    to: string,
    recipientName: string,
    senderName: string,
    messageId: string,
    messagePreview?: string,
  ) => {
    const html = await render(
      MessageNotificationEmail({ recipientName, senderName, messageId, messagePreview }),
    );

    return {
      from: "TeamFinder <noreply@littletownlabs.site>",
      to,
      subject: `New message from ${senderName}`,
      html,
    };
  },
};
