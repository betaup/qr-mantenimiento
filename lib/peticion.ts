import "server-only";
import { headers } from "next/headers";

export async function ipDeLaPeticion(): Promise<string> {
  const reenviada = (await headers()).get("x-forwarded-for");
  return reenviada?.split(",")[0]?.trim() || "desconocida";
}
