import "server-only";
import { headers } from "next/headers";

// La IP real es la ultima de X-Forwarded-For: la agrega el servidor propio
// (server.mjs) o el proxy de confianza, nunca el cliente (V-01).
export async function ipDeLaPeticion(): Promise<string> {
  const reenviada = (await headers()).get("x-forwarded-for");
  return reenviada?.split(",").at(-1)?.trim() || "desconocida";
}
