import { config as loadEnv } from "dotenv";
// drizzle-kit doesn't follow Next.js's .env loading order; load .env.local
// explicitly first, then fall back to .env. Production sets DATABASE_URL via
// --env-file on the docker run.
loadEnv({ path: ".env.local" });
loadEnv();

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
