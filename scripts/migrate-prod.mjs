// Apply pending migrations from ./drizzle against DATABASE_URL.
// Runs on every baaruveri-web container start before next starts.
// Idempotent — Drizzle skips migrations already in __drizzle_migrations.

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "[migrate-prod] DATABASE_URL not set; the server will start but DB " +
      "queries will fail. Set DATABASE_URL via --env-file."
  );
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client);

try {
  console.log("[migrate-prod] applying pending migrations…");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[migrate-prod] ✓ migrations applied");
} catch (err) {
  console.error("[migrate-prod] migration failed:", err);
  await client.end();
  process.exit(1);
}

await client.end();
