"use server";

import { redirect } from "next/navigation";
import { registrar } from "@/lib/bitacora";
import { cerrarSesion, obtenerSesion } from "@/lib/auth/sesion";

export async function salir() {
  const sesion = await obtenerSesion();
  await cerrarSesion();
  if (sesion) {
    await registrar({
      accion: "LOGOUT",
      resultado: "EXITO",
      usuarioId: sesion.usuario.id,
      empresaId: sesion.usuario.empresaId,
    });
  }
  redirect("/login");
}
