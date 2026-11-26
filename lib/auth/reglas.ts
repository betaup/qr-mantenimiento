// Reglas puras de autenticacion: sin base de datos ni cookies, para poder
// probarlas de forma aislada.
import { createHash, randomBytes } from "node:crypto";
import type { Rol } from "@/lib/dominio";

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/** Plazos de expiracion por rol, en milisegundos (RS-04). */
export const PLAZOS: Record<Rol, { inactividad: number; absoluto: number }> = {
  TECNICO: { inactividad: 8 * HORA, absoluto: 7 * DIA },
  ADMIN: { inactividad: 30 * MINUTO, absoluto: 12 * HORA },
};

/** Token de sesion: 256 bits de un generador criptografico. */
export function nuevoToken(): string {
  return randomBytes(32).toString("base64url");
}

/** En la base solo se guarda este hash, nunca el token. */
export function hashDeToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sesionVigente(
  sesion: { ultimoUsoEn: Date; expiraEn: Date },
  rol: Rol,
  ahora: Date = new Date(),
): boolean {
  if (ahora >= sesion.expiraEn) return false;
  // eslint-disable-next-line security/detect-object-injection -- rol es un tipo cerrado (ADMIN o TECNICO)
  return ahora.getTime() - sesion.ultimoUsoEn.getTime() < PLAZOS[rol].inactividad;
}

export const LONGITUD_MINIMA = 12;
export const LONGITUD_MAXIMA = 200;

// Muestra corta de las mas usadas; se comparan sin mayusculas.
const COMUNES = new Set([
  "123456789012", "1234567890123", "contraseña123", "contrasena123",
  "password1234", "password12345", "qwertyuiop12", "qwerty123456",
  "administrador", "administrador1", "mantenimiento", "bienvenido123",
  "iloveyou1234", "abcdefghijkl", "111111111111", "000000000000",
]);

/** Devuelve el motivo del rechazo, o null si la contraseña es aceptable. */
export function validarPassword(password: string): string | null {
  if (password.length < LONGITUD_MINIMA) {
    return `Usa al menos ${LONGITUD_MINIMA} caracteres.`;
  }
  if (password.length > LONGITUD_MAXIMA) {
    return `Usa como máximo ${LONGITUD_MAXIMA} caracteres.`;
  }
  if (COMUNES.has(password.toLowerCase())) {
    return "Esa contraseña es muy común. Elige otra.";
  }
  return null;
}
