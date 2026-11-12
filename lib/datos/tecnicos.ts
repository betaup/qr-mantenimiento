import "server-only";
import { db } from "@/lib/db";
import { registrar } from "@/lib/bitacora";
import { fallo, hecho, type Respuesta } from "@/lib/formularios";
import { requerirRol } from "@/lib/auth/guardas";
import { hashearPassword } from "@/lib/auth/password";
import { PASSWORD_INCORRECTA, reautenticar } from "@/lib/auth/reautenticar";
import { invalidarSesionesDe } from "@/lib/auth/sesion";

// Capa de acceso a datos: cada función verifica el rol y filtra por la
// empresa de la sesión (RS-06). Nunca recibe la empresa como parámetro.

const NO_EXISTE = "Ese técnico no existe.";

// Nunca se devuelve el hash de la contraseña.
const campos = { id: true, nombre: true, correo: true, activo: true } as const;

export async function listarTecnicos() {
  const { usuario } = await requerirRol("ADMIN");
  return db.usuario.findMany({
    where: { empresaId: usuario.empresaId, rol: "TECNICO" },
    select: campos,
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
  });
}

export async function obtenerTecnico(id: string) {
  const { usuario } = await requerirRol("ADMIN");
  return db.usuario.findFirst({
    where: { id, empresaId: usuario.empresaId, rol: "TECNICO" },
    select: campos,
  });
}

export async function crearTecnico(datos: {
  nombre: string;
  correo: string;
  password: string;
}): Promise<Respuesta> {
  const { usuario } = await requerirRol("ADMIN");

  if (await db.usuario.findUnique({ where: { correo: datos.correo } })) {
    return fallo("Ese correo ya está en uso.");
  }

  const tecnico = await db.usuario.create({
    data: {
      empresaId: usuario.empresaId,
      nombre: datos.nombre,
      correo: datos.correo,
      passwordHash: await hashearPassword(datos.password),
      rol: "TECNICO",
    },
  });

  await registrar({
    accion: "TECNICO_ALTA",
    resultado: "EXITO",
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
    recurso: `usuario:${tecnico.id}`,
  });
  return hecho;
}

/** Activa o desactiva la cuenta. Al desactivar se cierran sus sesiones (RS-05). */
export async function cambiarEstadoDeTecnico(
  id: string,
  activo: boolean,
  passwordAdmin: unknown,
): Promise<Respuesta> {
  const { usuario } = await requerirRol("ADMIN");
  if (!(await reautenticar(passwordAdmin))) return fallo(PASSWORD_INCORRECTA);

  const { count } = await db.usuario.updateMany({
    where: { id, empresaId: usuario.empresaId, rol: "TECNICO" },
    data: { activo },
  });
  if (count === 0) return fallo(NO_EXISTE);

  if (!activo) await invalidarSesionesDe(id);

  await registrar({
    accion: activo ? "TECNICO_REACTIVADO" : "TECNICO_BAJA",
    resultado: "EXITO",
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
    recurso: `usuario:${id}`,
  });
  return hecho;
}

/** El admin define una contraseña nueva; las sesiones abiertas se cierran (RS-05). */
export async function restablecerPassword(
  id: string,
  passwordNueva: string,
  passwordAdmin: unknown,
): Promise<Respuesta> {
  const { usuario } = await requerirRol("ADMIN");
  if (!(await reautenticar(passwordAdmin))) return fallo(PASSWORD_INCORRECTA);

  const { count } = await db.usuario.updateMany({
    where: { id, empresaId: usuario.empresaId, rol: "TECNICO" },
    data: { passwordHash: await hashearPassword(passwordNueva) },
  });
  if (count === 0) return fallo(NO_EXISTE);

  await invalidarSesionesDe(id);

  await registrar({
    accion: "PASSWORD_RESTABLECIDA",
    resultado: "EXITO",
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
    recurso: `usuario:${id}`,
  });
  return hecho;
}
