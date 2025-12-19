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

// TypeScript helper for UUID
type uuid = string;
