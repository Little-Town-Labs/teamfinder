import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const client = postgres(connectionString, { max: 1 });

async function applyPrivacyMigration() {
  console.log("Applying privacy migration...");

  try {
    // Create privacy_consent_type enum
    await client.unsafe(`
      DO $$ BEGIN
        CREATE TYPE "public"."privacy_consent_type" AS ENUM('privacy_policy', 'terms_of_service', 'cookie_policy', 'marketing_emails');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✓ Created privacy_consent_type enum");

    // Create privacy_consents table
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS "privacy_consents" (
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
    `);
    console.log("✓ Created privacy_consents table");

    // Add privacy fields to users table
    await client.unsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "privacy_policy_accepted_at" timestamp;
    `);
    await client.unsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "privacy_policy_version" text;
    `);
    await client.unsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "terms_accepted_at" timestamp;
    `);
    await client.unsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "terms_version" text;
    `);
    await client.unsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cookie_consent_given" boolean DEFAULT false;
    `);
    await client.unsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_emails_opt_in" boolean DEFAULT false;
    `);
    console.log("✓ Added privacy fields to users table");

    // Add foreign key constraint
    await client.unsafe(`
      DO $$ BEGIN
        ALTER TABLE "privacy_consents" ADD CONSTRAINT "privacy_consents_user_id_users_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✓ Added foreign key constraint");

    // Create indexes
    await client.unsafe(`
      CREATE INDEX IF NOT EXISTS "idx_privacy_consents_user_id" ON "privacy_consents" USING btree ("user_id");
    `);
    await client.unsafe(`
      CREATE INDEX IF NOT EXISTS "idx_privacy_consents_type" ON "privacy_consents" USING btree ("consent_type");
    `);
    await client.unsafe(`
      CREATE INDEX IF NOT EXISTS "idx_privacy_consents_consented_at" ON "privacy_consents" USING btree ("consented_at");
    `);
    console.log("✓ Created indexes");

    console.log("\n✅ Privacy migration applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

applyPrivacyMigration();
