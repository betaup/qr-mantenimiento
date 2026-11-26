import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { ROLES, type Rol } from "@/lib/dominio";
import { PLAZOS, hashDeToken, nuevoToken, sesionVigente } from "@/lib/auth/reglas";

const COOKIE = "sesion";
const MINUTO = 60_000;

export type SesionActual = {
  id: string;
  usuario: {
    id: string;
    nombre: string;
    rol: Rol;
    empresaId: string;
    empresa: string;
  };
};

export async function crearSesion(usuario: { id: string; rol: Rol }) {
  const token = nuevoToken();
  const expiraEn = new Date(Date.now() + PLAZOS[usuario.rol].absoluto);

  await db.sesion.create({
    data: { tokenHash: hashDeToken(token), usuarioId: usuario.id, expiraEn },
  });

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiraEn,
  });
}

/**
 * Sesion de la peticion actual, o null. Es la unica fuente de la identidad:
 * el usuario y su empresa salen de aqui, nunca de lo que envia el cliente (RS-06).
 */
export const obtenerSesion = cache(async (): Promise<SesionActual | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  const sesion = await db.sesion.findUnique({
    where: { tokenHash: hashDeToken(token) },
    include: { usuario: { include: { empresa: true } } },
  });
  if (!sesion) return null;

  const { usuario } = sesion;
  const rol = ROLES.find((r) => r === usuario.rol);

  if (!rol || !usuario.activo || !sesionVigente(sesion, rol)) {
    await db.sesion.deleteMany({ where: { id: sesion.id } });
    return null;
  }

  // La inactividad se mide con ultimoUsoEn; basta actualizarlo una vez por minuto.
  if (Date.now() - sesion.ultimoUsoEn.getTime() > MINUTO) {
    await db.sesion.update({
      where: { id: sesion.id },
      data: { ultimoUsoEn: new Date() },
    });
  }

  return {
    id: sesion.id,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      rol,
      empresaId: usuario.empresaId,
      empresa: usuario.empresa.nombre,
    },
  };
});

/** Cierra la sesion actual en el servidor y borra la cookie (RS-05). */
export async function cerrarSesion() {
  const almacen = await cookies();
  const token = almacen.get(COOKIE)?.value;
  if (token) {
    await db.sesion.deleteMany({ where: { tokenHash: hashDeToken(token) } });
  }
  almacen.delete(COOKIE);
}

/** Al desactivar a un usuario o cambiar su contraseña (RS-05). */
export async function invalidarSesionesDe(usuarioId: string) {
  await db.sesion.deleteMany({ where: { usuarioId } });
}
