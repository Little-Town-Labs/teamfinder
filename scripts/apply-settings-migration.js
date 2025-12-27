import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const client = postgres(connectionString, { max: 1 });

async function applyMigration() {
  console.log("🔄 Applying settings table migration...");

  try {
    // Create settings table (idempotent)
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "key" text NOT NULL,
        "value" text NOT NULL,
        "description" text,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "settings_key_unique" UNIQUE("key")
      );
    `);

    console.log("✅ Settings table created");

    // Insert default cookie banner setting (if it doesn't exist)
    await client.unsafe(`
      INSERT INTO "settings" (key, value, description)
      VALUES ('cookie_banner_enabled', 'true', 'Enable/disable the GetTerms cookie consent banner')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log("✅ Default cookie banner setting created (enabled)");

    console.log("🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
