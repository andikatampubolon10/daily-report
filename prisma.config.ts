// This file is used by the Prisma CLI for migrations, introspection, etc.
// It is separate from the PrismaClient runtime configuration.
// See: https://pris.ly/d/config-datasource
import * as dotenv from "dotenv";

// Load .env.local first (Next.js convention), then .env as fallback
dotenv.config({ path: ".env.local" });
dotenv.config(); // loads .env if .env.local doesn't exist

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
