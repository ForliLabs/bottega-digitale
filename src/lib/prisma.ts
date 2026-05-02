/**
 * @module prisma
 * Singleton Prisma client with Turso/SQLite dual-backend support.
 *
 * In development, uses a local SQLite file (`prisma/dev.db`) and caches the
 * client on `globalThis` to survive HMR. In production, connects to Turso
 * LibSQL when `TURSO_DATABASE_URL` is set.
 */
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Use Turso in production when TURSO_DATABASE_URL is set
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  const adapter = new PrismaLibSql(
    tursoUrl
      ? { url: tursoUrl, authToken: tursoToken }
      : { url: "file:prisma/dev.db" },
  );

  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Return database provider info for health checks (masks auth tokens).
 * @returns Object with `provider` ("turso" | "sqlite") and masked `url`.
 */
export function getDatabaseInfo() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  return {
    provider: tursoUrl ? "turso" : "sqlite",
    url: tursoUrl ? tursoUrl.replace(/\/\/.*@/, "//***@") : "file:prisma/dev.db",
  };
}
