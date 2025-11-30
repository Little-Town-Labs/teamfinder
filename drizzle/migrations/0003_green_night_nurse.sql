CREATE TYPE "public"."activity_type" AS ENUM('team_invitation_sent', 'team_invitation_accepted', 'team_invitation_declined', 'player_application_sent', 'player_application_accepted', 'player_application_declined', 'team_joined', 'team_left', 'team_member_removed', 'team_created', 'team_updated', 'team_deleted', 'message_received', 'conversation_started', 'profile_updated', 'profile_verified');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"actor_id" uuid,
	"actor_name" text,
	"team_id" uuid,
	"team_name" text,
	"message" text NOT NULL,
	"metadata" jsonb,
	"action_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;