import "server-only";
import { db } from "@/lib/db";
import { registrar } from "@/lib/bitacora";
import { fechaDeHoy } from "@/lib/dominio";
import { fallo, hecho, type Respuesta } from "@/lib/formularios";
import { requerirRol } from "@/lib/auth/guardas";

// Capa de acceso a datos: cada funcion verifica el rol y filtra por la
// empresa de la sesion (RS-06). Nunca recibe la empresa como parametro.

/** Equipos de la empresa con los tecnicos que los tienen asignados ese dia. */
export async function asignacionesDelDia(fecha: string) {
  const { usuario } = await requerirRol("ADMIN");
  const { empresaId } = usuario;

  const [equipos, tecnicos, servicios] = await Promise.all([
    db.equipo.findMany({
      where: { empresaId, activo: true },
      select: {
        id: true,
        nombre: true,
        serie: true,
        ubicacion: true,
        asignaciones: {
          where: { fecha, empresaId },
          select: { id: true, tecnico: { select: { id: true, nombre: true } } },
          orderBy: { creadoEn: "asc" },
        },
      },
      orderBy: { nombre: "asc" },
    }),
    db.usuario.findMany({
      where: { empresaId, rol: "TECNICO", activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    // Servicios registrados, sin contar correcciones ni anulaciones.
    db.servicio.count({ where: { empresaId, clase: "ORIGINAL" } }),
  ]);

  return { equipos, tecnicos, servicios };
}

export async function asignar(datos: {
  equipoId: string;
  tecnicoId: string;
  fecha: string;
}): Promise<Respuesta> {
  const { usuario } = await requerirRol("ADMIN");
  const { empresaId } = usuario;

  // El equipo y el tecnico deben ser de la empresa del admin: los ids llegan
  // del formulario y no son de fiar.
  const [equipo, tecnico] = await Promise.all([
    db.equipo.findFirst({
      where: { id: datos.equipoId, empresaId, activo: true },
    }),
    db.usuario.findFirst({
      where: { id: datos.tecnicoId, empresaId, rol: "TECNICO", activo: true },
    }),
  ]);
  if (!equipo || !tecnico) return fallo("Ese equipo o ese técnico no existe.");

  const repetida = await db.asignacion.findUnique({
    where: { equipoId_tecnicoId_fecha: datos },
  });
  if (repetida) return fallo(`${tecnico.nombre} ya tiene ese equipo ese día.`);

  const asignacion = await db.asignacion.create({
    data: { ...datos, empresaId },
  });

  await registrar({
    accion: "ASIGNACION_ALTA",
    resultado: "EXITO",
    usuarioId: usuario.id,
    empresaId,
    recurso: `asignacion:${asignacion.id}`,
    detalle: `equipo:${equipo.id} tecnico:${tecnico.id} fecha:${datos.fecha}`,
  });
  return hecho;
}

export async function quitarAsignacion(id: string): Promise<Respuesta> {
  const { usuario } = await requerirRol("ADMIN");
  const { empresaId } = usuario;

  const asignacion = await db.asignacion.findFirst({ where: { id, empresaId } });
  if (!asignacion) return fallo("Esa asignación no existe.");
  // La pantalla ya no muestra el boton en dias pasados, pero el servidor
  // tambien lo revisa: el historial de asignaciones no se reescribe (V-02).
  if (asignacion.fecha < fechaDeHoy()) {
    return fallo("Las asignaciones de días pasados ya no se pueden cambiar.");
  }

  await db.asignacion.deleteMany({ where: { id, empresaId, fecha: { gte: fechaDeHoy() } } });

  await registrar({
    accion: "ASIGNACION_BAJA",
    resultado: "EXITO",
    usuarioId: usuario.id,
    empresaId,
    recurso: `asignacion:${id}`,
    detalle: `equipo:${asignacion.equipoId} tecnico:${asignacion.tecnicoId} fecha:${asignacion.fecha}`,
  });
  return hecho;
}
