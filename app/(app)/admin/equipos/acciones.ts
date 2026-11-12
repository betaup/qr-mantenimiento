"use server";

import { revalidatePath } from "next/cache";
import { crearEquipo, regenerarQr } from "@/lib/datos/equipos";
import type { EstadoFormulario } from "@/lib/formularios";
import { equipoNuevo, soloId } from "@/lib/validacion";

export async function agregarEquipo(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const datos = equipoNuevo.safeParse({
    nombre: formulario.get("nombre"),
    modelo: formulario.get("modelo"),
    serie: formulario.get("serie"),
    ubicacion: formulario.get("ubicacion"),
    seccion: formulario.get("seccion") ?? "",
  });
  if (!datos.success) {
    return { error: "Revisa los datos del equipo: falta alguno o es muy largo." };
  }

  const respuesta = await crearEquipo(datos.data);
  if (!respuesta.ok) return { error: respuesta.error };

  revalidatePath("/admin/equipos");
  return { exito: `Se agregó ${datos.data.nombre}.` };
}

export async function regenerarQrDeEquipo(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const datos = soloId.safeParse({ id: formulario.get("id") });
  if (!datos.success) return { error: "Ese equipo no existe." };

  const respuesta = await regenerarQr(
    datos.data.id,
    formulario.get("passwordAdmin"),
  );
  if (!respuesta.ok) return { error: respuesta.error };

  revalidatePath(`/admin/equipos/${datos.data.id}`);
  return {
    exito: "Código regenerado. Imprime la etiqueta nueva y reemplaza la anterior.",
  };
}
