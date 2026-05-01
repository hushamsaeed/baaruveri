import { config as loadEnv } from "dotenv";
// Next.js loads .env* automatically at runtime; tsx scripts and drizzle-kit
// don't, so we eager-load both here. Order matters — .env.local wins.
loadEnv({ path: ".env.local" });
loadEnv();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Placeholder URL is parsed but never connected to — postgres-js is lazy,
// it opens sockets only on the first query. This lets `next build` evaluate
// modules in environments where the DB isn't reachable (Docker build
// sandbox). At runtime, missing DATABASE_URL fails loudly when the first
// query runs, which the auto-migration step on container start will catch.
const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://placeholder@localhost:5432/placeholder";

if (!process.env.DATABASE_URL) {
  // Don't throw — module load happens during `next build`. Just warn so the
  // signal is visible if it leaks into a real environment.
  console.warn(
    "[db] DATABASE_URL not set at module load; using placeholder. " +
      "Queries will fail until DATABASE_URL is provided."
  );
}

// max=10 is the postgres-js default sweet spot for a single-process Next.js
// long-running server. The container is on the same docker overlay network in
// prod; latency is sub-ms.
const client = postgres(databaseUrl, { max: 10 });

export const db = drizzle(client, { schema });
export { schema };
