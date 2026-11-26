import "server-only";
import { db } from "@/lib/db";
import { registrar } from "@/lib/bitacora";
import { fechaDeHoy, type TipoServicio } from "@/lib/dominio";
import { fallo, hecho, type Respuesta } from "@/lib/formularios";
import { requerirRol, requerirSesion } from "@/lib/auth/guardas";
import { escaneoBloqueado, registrarEscaneoDenegado } from "@/lib/auth/limite";
import type { SesionActual } from "@/lib/auth/sesion";

// Capa de acceso a datos: cada funcion verifica la sesion y filtra por su
// empresa (RS-06). El tecnico, ademas, solo llega a los equipos que tiene
// asignados hoy (RS-07).

type Usuario = SesionActual["usuario"];

const datosDeEquipo = {
  id: true,
  nombre: true,
  modelo: true,
  serie: true,
  ubicacion: true,
  seccion: true,
} as const;

/** Condicion de acceso a equipos segun quien pregunta. */
function alcanceDe(usuario: Usuario) {
  return {
    empresaId: usuario.empresaId,
    activo: true,
    ...(usuario.rol === "TECNICO" && {
      asignaciones: {
        some: { tecnicoId: usuario.id, fecha: fechaDeHoy() },
      },
    }),
  };
}

function eventoDe(usuario: Usuario) {
  return { usuarioId: usuario.id, empresaId: usuario.empresaId };
}

export async function equiposDeHoy() {
  const { usuario } = await requerirRol("TECNICO");
  return db.equipo.findMany({
    where: alcanceDe(usuario),
    select: datosDeEquipo,
    orderBy: { nombre: "asc" },
  });
}

/**
 * El equipo, si quien pregunta puede verlo; si no, null. Un equipo que no
 * existe y uno sin permiso dan el mismo resultado (RS-08).
 */
export async function equipoAccesible(id: string) {
  const { usuario } = await requerirSesion();
  const equipo = await db.equipo.findFirst({
    where: { id, ...alcanceDe(usuario) },
    select: datosDeEquipo,
  });

  if (!equipo) {
    await registrar({
      ...eventoDe(usuario),
      accion: "EQUIPO_CONSULTA",
      resultado: "DENEGADO",
      recurso: `equipo:${id.slice(0, 40)}`,
    });
  }
  return equipo;
}

/**
 * Resuelve el token de un QR al id del equipo, con las mismas reglas de
 * acceso. Los escaneos denegados se registran y se limitan (T1).
 */
export async function resolverEscaneo(token: string): Promise<string | null> {
  const { usuario } = await requerirSesion();

  if (await escaneoBloqueado(usuario.id)) {
    await registrar({
      ...eventoDe(usuario),
      accion: "QR_ESCANEO",
      resultado: "DENEGADO",
      detalle: "Límite de escaneos denegados alcanzado",
    });
    return null;
  }

  const equipo = await db.equipo.findFirst({
    where: { qrToken: token, ...alcanceDe(usuario) },
    select: { id: true },
  });

  if (!equipo) {
    await registrarEscaneoDenegado(usuario.id);
    // El token no se guarda: podria ser el de un equipo ajeno.
    await registrar({ ...eventoDe(usuario), accion: "QR_ESCANEO", resultado: "DENEGADO" });
    return null;
  }

  await registrar({
    ...eventoDe(usuario),
    accion: "QR_ESCANEO",
    resultado: "EXITO",
    recurso: `equipo:${equipo.id}`,
  });
  return equipo.id;
}

export type EntradaDeHistorial = Awaited<ReturnType<typeof historialDe>>[number];

/**
 * Historial de un equipo, del mas reciente al mas antiguo. Cada entrada es
 * un servicio original con sus correcciones y su anulacion, si las tiene.
 */
export async function historialDe(equipoId: string) {
  const { usuario } = await requerirSesion();
  const visible = await db.equipo.findFirst({
    where: { id: equipoId, ...alcanceDe(usuario) },
    select: { id: true },
  });
  if (!visible) return [];

  const registros = await db.servicio.findMany({
    where: { equipoId, empresaId: usuario.empresaId },
    select: {
      id: true,
      clase: true,
      tipo: true,
      descripcion: true,
      motivo: true,
      referenciaId: true,
      creadoEn: true,
      autorId: true,
      autor: { select: { nombre: true } },
    },
    orderBy: { creadoEn: "asc" },
  });

  const derivadosDe = (id: string, clase: string) =>
    registros.filter((r) => r.referenciaId === id && r.clase === clase);

  return registros
    .filter((r) => r.clase === "ORIGINAL")
    .map((original) => {
      const correcciones = derivadosDe(original.id, "CORRECCION");
      const vigente = correcciones.at(-1) ?? original;
      const anulacion = derivadosDe(original.id, "ANULACION").at(0) ?? null;

      return {
        id: original.id,
        autorId: original.autorId,
        autor: original.autor.nombre,
        creadoEn: original.creadoEn,
        // Lo que vale hoy: la ultima correccion, o el registro original.
        tipo: (vigente.tipo ?? original.tipo) as TipoServicio | null,
        descripcion: vigente.descripcion,
        original: {
          tipo: original.tipo as TipoServicio | null,
          descripcion: original.descripcion,
        },
        correcciones: correcciones.map((c) => ({
          id: c.id,
          motivo: c.motivo,
          autor: c.autor.nombre,
          creadoEn: c.creadoEn,
        })),
        anulacion: anulacion && {
          motivo: anulacion.motivo,
          autor: anulacion.autor.nombre,
          creadoEn: anulacion.creadoEn,
        },
      };
    })
    .reverse();
}

export async function registrarServicio(datos: {
  equipoId: string;
  tipo: TipoServicio;
  descripcion: string;
}): Promise<Respuesta> {
  const { usuario } = await requerirRol("TECNICO");

  const equipo = await db.equipo.findFirst({
    where: { id: datos.equipoId, ...alcanceDe(usuario) },
    select: { id: true, serie: true },
  });
  if (!equipo) return fallo("Ya no tienes asignado este equipo.");

  const servicio = await db.servicio.create({
    data: {
      empresaId: usuario.empresaId,
      equipoId: equipo.id,
      autorId: usuario.id,
      clase: "ORIGINAL",
      tipo: datos.tipo,
      descripcion: datos.descripcion,
    },
  });

  await registrar({
    ...eventoDe(usuario),
    accion: "SERVICIO_ALTA",
    resultado: "EXITO",
    recurso: `servicio:${servicio.id}`,
    detalle: `equipo:${equipo.id} confirmado por el técnico (serie ${equipo.serie})`,
  });
  return hecho;
}

/** El servicio original, si existe en la empresa y sigue sin anular. */
async function servicioCorregible(id: string, usuario: Usuario) {
  const servicio = await db.servicio.findFirst({
    where: { id, empresaId: usuario.empresaId, clase: "ORIGINAL" },
    select: {
      id: true,
      equipoId: true,
      autorId: true,
      derivados: { where: { clase: "ANULACION" }, select: { id: true } },
    },
  });
  if (!servicio) return { error: "Ese servicio no existe." } as const;
  if (servicio.derivados.length > 0) {
    return { error: "Ese servicio ya está anulado." } as const;
  }
  return { servicio } as const;
}

/**
 * Corrige un servicio creando un registro nuevo; el original no se toca
 * (RS-13). El admin corrige cualquiera de su empresa; el tecnico, solo los
 * suyos y mientras tenga el equipo asignado.
 */
export async function corregirServicio(datos: {
  servicioId: string;
  tipo: TipoServicio;
  descripcion: string;
  motivo: string;
}): Promise<Respuesta> {
  const { usuario } = await requerirSesion();
  const encontrado = await servicioCorregible(datos.servicioId, usuario);
  if (encontrado.error) return fallo(encontrado.error);
  const { servicio } = encontrado;

  if (usuario.rol === "TECNICO") {
    const equipo = await db.equipo.findFirst({
      where: { id: servicio.equipoId, ...alcanceDe(usuario) },
      select: { id: true },
    });
    if (!equipo || servicio.autorId !== usuario.id) {
      return fallo("Ese servicio no existe.");
    }
  }

  const correccion = await db.servicio.create({
    data: {
      empresaId: usuario.empresaId,
      equipoId: servicio.equipoId,
      autorId: usuario.id,
      clase: "CORRECCION",
      tipo: datos.tipo,
      descripcion: datos.descripcion,
      motivo: datos.motivo,
      referenciaId: servicio.id,
    },
  });

  await registrar({
    ...eventoDe(usuario),
    accion: "SERVICIO_CORRECCION",
    resultado: "EXITO",
    recurso: `servicio:${servicio.id}`,
    detalle: `correccion:${correccion.id}`,
  });
  return hecho;
}

/** Anula un servicio con un registro nuevo; solo el admin (RS-13). */
export async function anularServicio(datos: {
  servicioId: string;
  motivo: string;
}): Promise<Respuesta> {
  const { usuario } = await requerirRol("ADMIN");
  const encontrado = await servicioCorregible(datos.servicioId, usuario);
  if (encontrado.error) return fallo(encontrado.error);
  const { servicio } = encontrado;

  const anulacion = await db.servicio.create({
    data: {
      empresaId: usuario.empresaId,
      equipoId: servicio.equipoId,
      autorId: usuario.id,
      clase: "ANULACION",
      descripcion: "",
      motivo: datos.motivo,
      referenciaId: servicio.id,
    },
  });

  await registrar({
    ...eventoDe(usuario),
    accion: "SERVICIO_ANULACION",
    resultado: "EXITO",
    recurso: `servicio:${servicio.id}`,
    detalle: `anulacion:${anulacion.id}`,
  });
  return hecho;
}
