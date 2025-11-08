CREATE TYPE "public"."team_gender_type" AS ENUM('male', 'female', 'mixed');--> statement-breakpoint
ALTER TABLE "player_profiles" ADD COLUMN "preferred_team_gender_types" "team_gender_type"[];