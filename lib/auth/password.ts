import "server-only";
import { hash, verify } from "@node-rs/argon2";

/** Argon2id es el algoritmo por defecto de @node-rs/argon2 (RS-01). */
export function hashearPassword(password: string): Promise<string> {
  return hash(password);
}

// Hash de relleno: si el correo no existe se verifica contra este, para que
// la respuesta tarde lo mismo que con una cuenta real (RS-03).
let relleno: Promise<string> | undefined;

export async function verificarPassword(
  passwordHash: string | undefined,
  password: string,
): Promise<boolean> {
  relleno ??= hash("relleno-para-igualar-tiempos");
  const coincide = await verify(passwordHash ?? (await relleno), password);
  return passwordHash !== undefined && coincide;
}
