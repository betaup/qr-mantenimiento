import "server-only";
import { db } from "@/lib/db";
import { registrar } from "@/lib/bitacora";
import { fallo, hecho, type Respuesta } from "@/lib/formularios";
import { nuevoQrToken } from "@/lib/qr";
import { requerirRol } from "@/lib/auth/guardas";
import { PASSWORD_INCORRECTA, reautenticar } from "@/lib/auth/reautenticar";

// Capa de acceso a datos: cada función verifica el rol y filtra por la
// empresa de la sesión (RS-06). Nunca recibe la empresa como parámetro.

export async function listarEquipos() {
  const { usuario } = await requerirRol("ADMIN");
  return db.equipo.findMany({
    where: { empresaId: usuario.empresaId },
    select: {
      id: true,
      nombre: true,
      modelo: true,
      serie: true,
      ubicacion: true,
      seccion: true,
    },
    orderBy: { nombre: "asc" },
  });
}

/** Incluye el token del QR: solo el admin de la empresa lo ve. */
export async function obtenerEquipo(id: string) {
  const { usuario } = await requerirRol("ADMIN");
  return db.equipo.findFirst({
    where: { id, empresaId: usuario.empresaId },
  });
}

export async function crearEquipo(datos: {
  nombre: string;
  modelo: string;
  serie: string;
  ubicacion: string;
  seccion: string | null;
}): Promise<Respuesta> {
  const { usuario } = await requerirRol("ADMIN");

  const repetido = await db.equipo.findUnique({
    where: {
      empresaId_serie: { empresaId: usuario.empresaId, serie: datos.serie },
    },
  });
  if (repetido) return fallo("Ya hay un equipo con ese número de serie.");

  const equipo = await db.equipo.create({
    data: { ...datos, empresaId: usuario.empresaId, qrToken: nuevoQrToken() },
  });

  await registrar({
    accion: "EQUIPO_ALTA",
    resultado: "EXITO",
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
    recurso: `equipo:${equipo.id}`,
  });
  return hecho;
}

/** Cambia el token: el QR anterior deja de funcionar de inmediato (RS-16). */
export async function regenerarQr(
  id: string,
  passwordAdmin: unknown,
): Promise<Respuesta> {
  const { usuario } = await requerirRol("ADMIN");
  if (!(await reautenticar(passwordAdmin))) return fallo(PASSWORD_INCORRECTA);

  const { count } = await db.equipo.updateMany({
    where: { id, empresaId: usuario.empresaId },
    data: { qrToken: nuevoQrToken() },
  });
  if (count === 0) return fallo("Ese equipo no existe.");

  await registrar({
    accion: "QR_REGENERADO",
    resultado: "EXITO",
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
    recurso: `equipo:${id}`,
  });
  return hecho;
}
