import path from "node:path";
import { PrismaClient } from "@/lib/generated/prisma/client";

// DATABASE_URL es relativa a la carpeta prisma/ (asi la interpreta el CLI).
// Dentro de Next.js hay que volverla absoluta para que encuentre el archivo.
function urlDeLaBase(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const relativa = url.match(/^file:\.\/(.+)$/);
  return relativa
    ? `file:${path.join(process.cwd(), "prisma", relativa[1])}`
    : url;
}

// Una sola instancia: en desarrollo, la recarga en caliente crearia una
// conexion nueva en cada cambio.
const global = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  global.prisma ?? new PrismaClient({ datasourceUrl: urlDeLaBase() });

if (process.env.NODE_ENV !== "production") global.prisma = db;
