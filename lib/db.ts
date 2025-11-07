import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.mjs";
import * as schema from "../drizzle/schema";

// Create postgres connection
const client = postgres(env.DATABASE_URL);

// Export drizzle instance
export const db = drizzle(client, { schema });
