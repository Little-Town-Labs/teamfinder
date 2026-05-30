import type { PlayerApplication, User } from "@/drizzle/schema"

export type TeamApplicationStatus =
  | "eligible"
  | "captain"
  | "member"
  | "not_recruiting"
  | "pending"
  | "accepted"
  | "declined"

export type ViewerApplicationState = {
  status: TeamApplicationStatus
  applicationId?: string
}

export type PendingApplication = PlayerApplication & {
  applicant: Pick<User, "id" | "firstName" | "lastName" | "imageUrl">
}
