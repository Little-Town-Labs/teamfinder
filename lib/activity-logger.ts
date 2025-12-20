import { activityLogs, type NewActivityLog } from "@/drizzle/schema";
import { db } from "@/lib/db";

/**
 * Activity Logger Utility
 * Centralized functions for logging user activities
 */

export async function logActivity(data: NewActivityLog) {
  try {
    await db.insert(activityLogs).values(data);
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - activity logging failures shouldn't break the main flow
  }
}

/**
 * Helper functions for common activity types
 */

export async function logTeamInvitationSent(params: {
  userId: uuid;
  actorId: uuid;
  actorName: string;
  teamId: uuid;
  teamName: string;
}) {
  return logActivity({
    userId: params.userId,
    actorId: params.actorId,
    actorName: params.actorName,
    teamId: params.teamId,
    teamName: params.teamName,
    activityType: "team_invitation_sent",
    message: `You were invited to join ${params.teamName}`,
    actionUrl: `/teams/${params.teamId}`,
  });
}

export async function logTeamInvitationAccepted(params: {
  userId: uuid; // team captain
  actorId: uuid; // player who accepted
  actorName: string;
  teamId: uuid;
  teamName: string;
}) {
  return logActivity({
    userId: params.userId,
    actorId: params.actorId,
    actorName: params.actorName,
    teamId: params.teamId,
    teamName: params.teamName,
    activityType: "team_invitation_accepted",
    message: `${params.actorName} accepted your invitation to join ${params.teamName}`,
    actionUrl: `/teams/${params.teamId}`,
  });
}

export async function logPlayerApplicationSent(params: {
  userId: uuid; // team captain
  actorId: uuid; // player who applied
  actorName: string;
  teamId: uuid;
  teamName: string;
}) {
  return logActivity({
    userId: params.userId,
    actorId: params.actorId,
    actorName: params.actorName,
    teamId: params.teamId,
    teamName: params.teamName,
    activityType: "player_application_sent",
    message: `${params.actorName} applied to join ${params.teamName}`,
    actionUrl: `/teams/${params.teamId}`,
  });
}

export async function logTeamJoined(params: {
  userId: uuid;
  teamId: uuid;
  teamName: string;
}) {
  return logActivity({
    userId: params.userId,
    teamId: params.teamId,
    teamName: params.teamName,
    activityType: "team_joined",
    message: `You joined ${params.teamName}`,
    actionUrl: `/teams/${params.teamId}`,
  });
}

export async function logTeamCreated(params: {
  userId: uuid;
  teamId: uuid;
  teamName: string;
}) {
  return logActivity({
    userId: params.userId,
    teamId: params.teamId,
    teamName: params.teamName,
    activityType: "team_created",
    message: `You created ${params.teamName}`,
    actionUrl: `/teams/${params.teamId}`,
  });
}

export async function logMessageReceived(params: {
  userId: uuid;
  actorId: uuid;
  actorName: string;
}) {
  return logActivity({
    userId: params.userId,
    actorId: params.actorId,
    actorName: params.actorName,
    activityType: "message_received",
    message: `New message from ${params.actorName}`,
    actionUrl: `/messages`,
  });
}

export async function logProfileUpdated(params: {
  userId: uuid;
}) {
  return logActivity({
    userId: params.userId,
    activityType: "profile_updated",
    message: "You updated your bowling profile",
    actionUrl: "/profile",
  });
}

// Bowling Center Activities

export async function logBowlingCenterAdded(params: {
  userId: uuid;
  centerId: uuid;
  centerName: string;
}) {
  return logActivity({
    userId: params.userId,
    activityType: "profile_updated", // Using profile_updated as placeholder since activity type doesn't have center-specific types yet
    message: `You added ${params.centerName} to the bowling center directory`,
    actionUrl: `/bowling-centers/${params.centerId}`,
    metadata: {
      centerName: params.centerName,
      centerId: params.centerId,
      action: "center_added",
    },
  });
}

export async function logCenterEditSuggested(params: {
  userId: uuid;
  centerId: uuid;
  centerName: string;
}) {
  return logActivity({
    userId: params.userId,
    activityType: "profile_updated", // Using profile_updated as placeholder
    message: `You suggested edits to ${params.centerName}`,
    actionUrl: `/bowling-centers/${params.centerId}`,
    metadata: {
      centerName: params.centerName,
      centerId: params.centerId,
      action: "edit_suggested",
    },
  });
}

export async function logCenterEditApproved(params: {
  userId: uuid; // The user who suggested the edit
  centerId: uuid;
  centerName: string;
  reviewerName: string;
}) {
  return logActivity({
    userId: params.userId,
    activityType: "profile_verified", // Using profile_verified as placeholder for approval
    message: `Your suggested edits to ${params.centerName} were approved by ${params.reviewerName}`,
    actionUrl: `/bowling-centers/${params.centerId}`,
    metadata: {
      centerName: params.centerName,
      centerId: params.centerId,
      reviewerName: params.reviewerName,
      action: "edit_approved",
    },
  });
}

export async function logCenterEditRejected(params: {
  userId: uuid; // The user who suggested the edit
  centerId: uuid;
  centerName: string;
  reviewerName: string;
  reason?: string;
}) {
  return logActivity({
    userId: params.userId,
    activityType: "profile_updated", // Using profile_updated as placeholder
    message: `Your suggested edits to ${params.centerName} were not approved${params.reason ? `: ${params.reason}` : ""}`,
    actionUrl: `/bowling-centers/${params.centerId}`,
    metadata: {
      centerName: params.centerName,
      centerId: params.centerId,
      reviewerName: params.reviewerName,
      reason: params.reason,
      action: "edit_rejected",
    },
  });
}

// TypeScript helper for UUID
type uuid = string;
