import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL;
let poolConfig: pg.PoolConfig;
if (dbUrl) {
  const u = new URL(dbUrl);
  poolConfig = {
    host: u.hostname,
    port: parseInt(u.port || "5432"),
    database: u.pathname.slice(1),
    user: u.username,
    password: decodeURIComponent(u.password),
  };
} else {
  poolConfig = {
    host: "127.0.0.1",
    port: 5435,
    database: "pwncorp_erp",
    user: "pwncorp",
    password: "test",
  };
}
const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
