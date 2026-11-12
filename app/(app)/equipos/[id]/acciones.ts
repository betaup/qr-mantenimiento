"use server";

import { revalidatePath } from "next/cache";
import {
  anularServicio,
  corregirServicio,
  registrarServicio,
} from "@/lib/datos/servicios";
import type { EstadoFormulario } from "@/lib/formularios";
import {
  anulacionNueva,
  correccionNueva,
  servicioNuevo,
  soloId,
} from "@/lib/validacion";

const DATOS_INCOMPLETOS =
  "Elige el tipo de servicio y describe el trabajo con al menos 5 caracteres.";

function actualizar(formulario: FormData) {
  const equipo = soloId.safeParse({ id: formulario.get("equipoId") });
  if (equipo.success) revalidatePath(`/equipos/${equipo.data.id}`);
}

export async function registrar(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  if (formulario.get("confirmado") !== "on") {
    return { error: "Confirma que estás frente a este equipo antes de registrar." };
  }
  const datos = servicioNuevo.safeParse({
    equipoId: formulario.get("equipoId"),
    tipo: formulario.get("tipo"),
    descripcion: formulario.get("descripcion"),
    confirmado: formulario.get("confirmado"),
  });
  if (!datos.success) return { error: DATOS_INCOMPLETOS };

  const respuesta = await registrarServicio(datos.data);
  if (!respuesta.ok) return { error: respuesta.error };

  actualizar(formulario);
  return { exito: "Servicio registrado." };
}

export async function corregir(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const datos = correccionNueva.safeParse({
    servicioId: formulario.get("servicioId"),
    tipo: formulario.get("tipo"),
    descripcion: formulario.get("descripcion"),
    motivo: formulario.get("motivo"),
  });
  if (!datos.success) {
    return { error: `${DATOS_INCOMPLETOS} El motivo también es obligatorio.` };
  }

  const respuesta = await corregirServicio(datos.data);
  if (!respuesta.ok) return { error: respuesta.error };

  actualizar(formulario);
  return { exito: "Corrección guardada. El registro original se conserva." };
}

export async function anular(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const datos = anulacionNueva.safeParse({
    servicioId: formulario.get("servicioId"),
    motivo: formulario.get("motivo"),
  });
  if (!datos.success) {
    return { error: "Escribe el motivo de la anulación, con al menos 5 caracteres." };
  }

  const respuesta = await anularServicio(datos.data);
  if (!respuesta.ok) return { error: respuesta.error };

  actualizar(formulario);
  return { exito: "Servicio anulado. El registro original se conserva." };
}
