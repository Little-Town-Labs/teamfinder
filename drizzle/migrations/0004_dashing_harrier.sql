CREATE TYPE "public"."suggestion_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'moderator', 'content_reviewer', 'support');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('inappropriate_content', 'harassment', 'spam', 'fake_profile', 'incorrect_information', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'investigating', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('user', 'team', 'message', 'bowling_center');--> statement-breakpoint
CREATE TYPE "public"."admin_action_type" AS ENUM('user_locked', 'user_unlocked', 'user_banned', 'user_unbanned', 'user_usbc_verified', 'user_profile_edited', 'team_edited', 'team_deleted', 'team_flagged', 'team_unflagged', 'center_created', 'center_edited', 'center_deleted', 'center_suggestion_approved', 'center_suggestion_rejected', 'report_reviewed', 'report_dismissed', 'content_deleted', 'admin_role_assigned', 'admin_role_revoked');--> statement-breakpoint
CREATE TYPE "public"."privacy_consent_type" AS ENUM('privacy_policy', 'terms_of_service', 'cookie_policy', 'marketing_emails');--> statement-breakpoint
CREATE TABLE "center_edit_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bowling_center_id" uuid NOT NULL,
	"suggested_by" uuid NOT NULL,
	"suggested_changes" jsonb NOT NULL,
	"notes" text,
	"status" "suggestion_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"review_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "admin_role" NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_roles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "admin_role" NOT NULL,
	"permission_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reported_by" uuid NOT NULL,
	"report_type" "report_type" NOT NULL,
	"reported_user_id" uuid,
	"reported_team_id" uuid,
	"reported_message_id" uuid,
	"reported_center_id" uuid,
	"reason" "report_reason" NOT NULL,
	"description" text NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"review_notes" text,
	"action_taken" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"admin_name" text NOT NULL,
	"admin_role" text NOT NULL,
	"action_type" "admin_action_type" NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"target_description" text,
	"reason" text,
	"previous_value" jsonb,
	"new_value" jsonb,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "privacy_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"consent_type" "privacy_consent_type" NOT NULL,
	"consent_version" text NOT NULL,
	"accepted" boolean NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"consented_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "usbc_verification_notes" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_verified_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "privacy_policy_accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "privacy_policy_version" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "terms_accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "terms_version" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cookie_consent_given" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "marketing_emails_opt_in" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bowling_centers" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bowling_centers" ADD COLUMN "flagged_for_review" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bowling_centers" ADD COLUMN "flagged_reason" text;--> statement-breakpoint
ALTER TABLE "bowling_centers" ADD COLUMN "added_by" uuid;--> statement-breakpoint
ALTER TABLE "bowling_centers" ADD COLUMN "last_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "bowling_centers" ADD COLUMN "last_verified_by" uuid;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "flagged_for_review" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "flagged_reason" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "flagged_at" timestamp;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "moderation_notes" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "moderated_by" uuid;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "moderated_at" timestamp;--> statement-breakpoint
ALTER TABLE "center_edit_suggestions" ADD CONSTRAINT "center_edit_suggestions_bowling_center_id_bowling_centers_id_fk" FOREIGN KEY ("bowling_center_id") REFERENCES "public"."bowling_centers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "center_edit_suggestions" ADD CONSTRAINT "center_edit_suggestions_suggested_by_users_id_fk" FOREIGN KEY ("suggested_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "center_edit_suggestions" ADD CONSTRAINT "center_edit_suggestions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_roles" ADD CONSTRAINT "admin_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_roles" ADD CONSTRAINT "admin_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_users_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_team_id_teams_id_fk" FOREIGN KEY ("reported_team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_message_id_messages_id_fk" FOREIGN KEY ("reported_message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_center_id_bowling_centers_id_fk" FOREIGN KEY ("reported_center_id") REFERENCES "public"."bowling_centers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "privacy_consents" ADD CONSTRAINT "privacy_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admin_roles_user_id" ON "admin_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_admin_roles_role" ON "admin_roles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_permissions_name" ON "permissions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_permissions_category" ON "permissions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_role_permissions_role" ON "role_permissions" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_role_permissions_permission_id" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "idx_reports_reported_by" ON "reports" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "idx_reports_status" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reports_created_at" ON "reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_reports_report_type" ON "reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "idx_admin_actions_admin_id" ON "admin_actions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_admin_actions_action_type" ON "admin_actions" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "idx_admin_actions_target_id" ON "admin_actions" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "idx_admin_actions_target_type" ON "admin_actions" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "idx_admin_actions_created_at" ON "admin_actions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_privacy_consents_user_id" ON "privacy_consents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_privacy_consents_type" ON "privacy_consents" USING btree ("consent_type");--> statement-breakpoint
CREATE INDEX "idx_privacy_consents_consented_at" ON "privacy_consents" USING btree ("consented_at");--> statement-breakpoint
CREATE INDEX "idx_users_clerk_user_id" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_bowling_centers_city" ON "bowling_centers" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_bowling_centers_state" ON "bowling_centers" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_bowling_centers_zip_code" ON "bowling_centers" USING btree ("zip_code");--> statement-breakpoint
CREATE INDEX "idx_bowling_centers_lat_lng" ON "bowling_centers" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "idx_bowling_centers_verified" ON "bowling_centers" USING btree ("verified");