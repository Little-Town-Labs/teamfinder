import { relations } from "drizzle-orm"
import { activityLogs } from "./activity-logs"
import { affiliations } from "./affiliations"
import { bowlingCenters } from "./bowling-centers"
import { centerEditSuggestions } from "./center-edit-suggestions"
import { feedback } from "./feedback"
import { leagues } from "./leagues"
import { playerProfiles } from "./player-profiles"
import { playerApplications } from "./player-applications"
import { privacyConsents } from "./privacy-consents"
import { teamMembers } from "./team-members"
import { teams } from "./teams"
import { users } from "./users"

export const usersRelations = relations(users, ({ one, many }) => ({
  playerProfile: one(playerProfiles, {
    fields: [users.id],
    references: [playerProfiles.userId],
  }),
  captainOfTeams: many(teams),
  teamMemberships: many(teamMembers),
  affiliations: many(affiliations),
  activityLogs: many(activityLogs),
  centerEditSuggestions: many(centerEditSuggestions),
  privacyConsents: many(privacyConsents),
  feedbackSubmissions: many(feedback),
  playerApplications: many(playerApplications, {
    relationName: "applicantApplications",
  }),
  reviewedApplications: many(playerApplications, {
    relationName: "reviewedApplications",
  }),
}))

export const playerProfilesRelations = relations(playerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
  homeBowlingCenter: one(bowlingCenters, {
    fields: [playerProfiles.homeBowlingCenterId],
    references: [bowlingCenters.id],
  }),
}))

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}))

export const teamsRelations = relations(teams, ({ one, many }) => ({
  captain: one(users, {
    fields: [teams.captainId],
    references: [users.id],
  }),
  members: many(teamMembers),
  applications: many(playerApplications),
  homeBowlingCenter: one(bowlingCenters, {
    fields: [teams.homeBowlingCenterId],
    references: [bowlingCenters.id],
  }),
}))

export const playerApplicationsRelations = relations(playerApplications, ({ one }) => ({
  team: one(teams, {
    fields: [playerApplications.teamId],
    references: [teams.id],
  }),
  applicant: one(users, {
    fields: [playerApplications.applicantUserId],
    references: [users.id],
    relationName: "applicantApplications",
  }),
  reviewer: one(users, {
    fields: [playerApplications.reviewedByUserId],
    references: [users.id],
    relationName: "reviewedApplications",
  }),
}))

export const affiliationsRelations = relations(affiliations, ({ one }) => ({
  user: one(users, {
    fields: [affiliations.userId],
    references: [users.id],
  }),
}))

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
}))

export const bowlingCentersRelations = relations(bowlingCenters, ({ many }) => ({
  teams: many(teams),
  leagues: many(leagues),
  playerProfiles: many(playerProfiles),
  editSuggestions: many(centerEditSuggestions),
}))

export const leaguesRelations = relations(leagues, ({ one }) => ({
  bowlingCenter: one(bowlingCenters, {
    fields: [leagues.bowlingCenterId],
    references: [bowlingCenters.id],
  }),
}))

export const centerEditSuggestionsRelations = relations(centerEditSuggestions, ({ one }) => ({
  bowlingCenter: one(bowlingCenters, {
    fields: [centerEditSuggestions.bowlingCenterId],
    references: [bowlingCenters.id],
  }),
  suggestor: one(users, {
    fields: [centerEditSuggestions.suggestedBy],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [centerEditSuggestions.reviewedBy],
    references: [users.id],
  }),
}))

export const privacyConsentsRelations = relations(privacyConsents, ({ one }) => ({
  user: one(users, {
    fields: [privacyConsents.userId],
    references: [users.id],
  }),
}))

export const feedbackRelations = relations(feedback, ({ one }) => ({
  submitter: one(users, {
    fields: [feedback.submittedBy],
    references: [users.id],
  }),
  responder: one(users, {
    fields: [feedback.respondedBy],
    references: [users.id],
  }),
}))
