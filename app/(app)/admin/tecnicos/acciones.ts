"use server";

import { revalidatePath } from "next/cache";
import {
  cambiarEstadoDeTecnico,
  crearTecnico,
  restablecerPassword,
} from "@/lib/datos/tecnicos";
import type { EstadoFormulario } from "@/lib/formularios";
import {
  mensajeDe,
  passwordRestablecida,
  soloId,
  tecnicoNuevo,
} from "@/lib/validacion";

export async function agregarTecnico(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const datos = tecnicoNuevo.safeParse({
    nombre: formulario.get("nombre"),
    correo: formulario.get("correo"),
    password: formulario.get("password"),
  });
  if (!datos.success) {
    return { error: mensajeDe(datos.error, "Revisa el nombre y el correo.") };
  }

  const respuesta = await crearTecnico(datos.data);
  if (!respuesta.ok) return { error: respuesta.error };

  revalidatePath("/admin/tecnicos");
  return { exito: `Se agregó a ${datos.data.nombre}.` };
}

async function cambiarEstado(
  activo: boolean,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const datos = soloId.safeParse({ id: formulario.get("id") });
  if (!datos.success) return { error: "Ese técnico no existe." };

  const respuesta = await cambiarEstadoDeTecnico(
    datos.data.id,
    activo,
    formulario.get("passwordAdmin"),
  );
  if (!respuesta.ok) return { error: respuesta.error };

  revalidatePath("/admin/tecnicos", "layout");
  return {
    exito: activo
      ? "La cuenta está activa de nuevo."
      : "La cuenta quedó desactivada y sus sesiones se cerraron.",
  };
}

export async function desactivarTecnico(
  _previo: EstadoFormulario,
  formulario: FormData,
) {
  return cambiarEstado(false, formulario);
}

export async function reactivarTecnico(
  _previo: EstadoFormulario,
  formulario: FormData,
) {
  return cambiarEstado(true, formulario);
}

export async function restablecerPasswordDeTecnico(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const datos = passwordRestablecida.safeParse({
    tecnicoId: formulario.get("id"),
    password: formulario.get("password"),
  });
  if (!datos.success) {
    return { error: mensajeDe(datos.error, "Revisa la contraseña nueva.") };
  }

  const respuesta = await restablecerPassword(
    datos.data.tecnicoId,
    datos.data.password,
    formulario.get("passwordAdmin"),
  );
  if (!respuesta.ok) return { error: respuesta.error };

  return {
    exito: "Contraseña restablecida. Sus sesiones abiertas se cerraron.",
  };
}
