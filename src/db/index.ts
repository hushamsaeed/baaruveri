import { config as loadEnv } from "dotenv";
// Next.js loads .env* automatically at runtime; tsx scripts and drizzle-kit
// don't, so we eager-load both here. Order matters — .env.local wins.
loadEnv({ path: ".env.local" });
loadEnv();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.local.example to .env.local " +
      "and start the dev Postgres via `docker compose up -d postgres`."
  );
}

// max=10 is the postgres-js default sweet spot for a single-process Next.js
// long-running server. The container is on the same docker overlay network in
// prod; latency is sub-ms.
const client = postgres(databaseUrl, { max: 10 });

export const db = drizzle(client, { schema });
export { schema };
