import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const client = postgres(connectionString, { max: 1 });

async function applyMigration() {
  console.log("🔄 Adding settings_update to admin_action_type enum...");

  try {
    // Add new value to enum (idempotent)
    await client.unsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'settings_update'
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'admin_action_type'
          )
        ) THEN
          ALTER TYPE "admin_action_type" ADD VALUE 'settings_update';
        END IF;
      END $$;
    `);

    console.log("✅ settings_update value added to admin_action_type enum");
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
