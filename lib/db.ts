import { PrismaClient } from "@/lib/generated/prisma/client";

// Una sola instancia: en desarrollo, la recarga en caliente crearía una
// conexión nueva en cada cambio.
const global = globalThis as unknown as { prisma?: PrismaClient };

export const db = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = db;
