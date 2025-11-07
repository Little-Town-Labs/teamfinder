import { relations } from "drizzle-orm";
import { users } from "./users";
import { playerProfiles } from "./player-profiles";
import { teams } from "./teams";
import { teamMembers } from "./team-members";

export const usersRelations = relations(users, ({ one, many }) => ({
  playerProfile: one(playerProfiles, {
    fields: [users.id],
    references: [playerProfiles.userId],
  }),
  captainOfTeams: many(teams),
  teamMemberships: many(teamMembers),
}));

export const playerProfilesRelations = relations(playerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
}));
