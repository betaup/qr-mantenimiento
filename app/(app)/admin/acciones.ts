"use server";

import { revalidatePath } from "next/cache";
import { asignar, quitarAsignacion } from "@/lib/datos/asignaciones";
import type { EstadoFormulario } from "@/lib/formularios";
import { asignacionNueva, soloId } from "@/lib/validacion";

export async function asignarEquipo(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const datos = asignacionNueva.safeParse({
    equipoId: formulario.get("equipoId"),
    tecnicoId: formulario.get("tecnicoId"),
    fecha: formulario.get("fecha"),
  });
  if (!datos.success) return { error: "Elige un técnico." };

  const respuesta = await asignar(datos.data);
  if (!respuesta.ok) return { error: respuesta.error };

  revalidatePath("/admin");
  return {};
}

export async function quitarAsignacionDeEquipo(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const datos = soloId.safeParse({ id: formulario.get("id") });
  if (!datos.success) return { error: "Esa asignación no existe." };

  const respuesta = await quitarAsignacion(datos.data.id);
  if (!respuesta.ok) return { error: respuesta.error };

  revalidatePath("/admin");
  return {};
}
