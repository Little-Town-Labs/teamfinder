CREATE TYPE "public"."feedback_category" AS ENUM('bug_report', 'feature_request', 'general_feedback', 'other');--> statement-breakpoint
CREATE TYPE "public"."feedback_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('submitted', 'under_review', 'planned', 'in_progress', 'completed', 'declined');--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submitted_by" uuid NOT NULL,
	"category" "feedback_category" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "feedback_status" DEFAULT 'submitted' NOT NULL,
	"priority" "feedback_priority",
	"responded_by" uuid,
	"admin_response" text,
	"internal_notes" text,
	"responded_at" timestamp,
	"tags" text[],
	"upvotes" uuid[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_feedback_submitted_by" ON "feedback" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "idx_feedback_status" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_feedback_category" ON "feedback" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_feedback_priority" ON "feedback" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_feedback_created_at" ON "feedback" USING btree ("created_at");