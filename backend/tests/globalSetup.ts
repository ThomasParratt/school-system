import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";
import dotenv from "dotenv";

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const composeFile = path.resolve(backendDir, "../docker-compose.yml");

async function waitForDatabase(connectionString: string) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const client = new Client({ connectionString });

    try {
      await client.connect();
      await client.end();
      return;
    } catch {
      await client.end().catch(() => {});

      if (attempt === 59) {
        throw new Error("Test database did not become ready in time");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(backendDir, ".env.test") });

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set for test setup");
  }

  await waitForDatabase(databaseUrl);

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    cwd: backendDir,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
}