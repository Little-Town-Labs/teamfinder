import { relations } from "drizzle-orm";
import { activityLogs } from "./activity-logs";
import { affiliations } from "./affiliations";
import { playerProfiles } from "./player-profiles";
import { teamMembers } from "./team-members";
import { teams } from "./teams";
import { users } from "./users";

export const usersRelations = relations(users, ({ one, many }) => ({
  playerProfile: one(playerProfiles, {
    fields: [users.id],
    references: [playerProfiles.userId],
  }),
  captainOfTeams: many(teams),
  teamMemberships: many(teamMembers),
  affiliations: many(affiliations),
  activityLogs: many(activityLogs),
}));

export const playerProfilesRelations = relations(playerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  captain: one(users, {
    fields: [teams.captainId],
    references: [users.id],
  }),
  members: many(teamMembers),
}));

export const affiliationsRelations = relations(affiliations, ({ one }) => ({
  user: one(users, {
    fields: [affiliations.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  actor: one(users, {
    fields: [activityLogs.actorId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
}));
