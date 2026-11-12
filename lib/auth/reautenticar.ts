import "server-only";
import { db } from "@/lib/db";
import { registrar } from "@/lib/bitacora";
import { ipDeLaPeticion } from "@/lib/peticion";
import { requerirSesion } from "@/lib/auth/guardas";
import { loginBloqueado, registrarFalloDeLogin } from "@/lib/auth/limite";
import { verificarPassword } from "@/lib/auth/password";
import { LONGITUD_MAXIMA } from "@/lib/auth/reglas";

export const PASSWORD_INCORRECTA =
  "Tu contraseña no es correcta. No se hizo ningún cambio.";

/**
 * Pide de nuevo la contraseña de quien tiene la sesión antes de una acción
 * sensible (RS-09). Así una sesión robada no basta para hacerla.
 * Comparte el límite de intentos del inicio de sesión.
 */
export async function reautenticar(password: unknown): Promise<boolean> {
  const { usuario } = await requerirSesion();
  const cuenta = await db.usuario.findUnique({ where: { id: usuario.id } });
  if (!cuenta) return false;

  const ip = await ipDeLaPeticion();
  const evento = {
    accion: "REAUTENTICACION",
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
  };

  if (await loginBloqueado(cuenta.correo, ip)) {
    await registrar({ ...evento, resultado: "DENEGADO", detalle: "Límite de intentos alcanzado" });
    return false;
  }

  const correcta =
    typeof password === "string" &&
    password.length > 0 &&
    password.length <= LONGITUD_MAXIMA &&
    (await verificarPassword(cuenta.passwordHash, password));

  if (!correcta) {
    await registrarFalloDeLogin(cuenta.correo, ip);
    await registrar({ ...evento, resultado: "FALLO" });
  }
  return correcta;
}
