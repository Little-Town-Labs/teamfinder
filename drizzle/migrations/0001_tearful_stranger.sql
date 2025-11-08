CREATE TYPE "public"."affiliation_type" AS ENUM('college', 'company', 'organization', 'other');--> statement-breakpoint
CREATE TABLE "affiliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "affiliation_type" NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"start_year" text,
	"end_year" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_parent_message_id_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "affiliations" ADD CONSTRAINT "affiliations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;