import { relations } from "drizzle-orm";
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
}));

export const playerProfilesRelations = relations(playerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
}));
