import "server-only";
import { notFound, redirect } from "next/navigation";
import type { Rol } from "@/lib/dominio";
import { obtenerSesion, type SesionActual } from "@/lib/auth/sesion";

export function rutaDeInicio(rol: Rol): string {
  return rol === "ADMIN" ? "/admin" : "/tecnico";
}

/** Exige sesión. Sin ella, manda al inicio de sesión. */
export async function requerirSesion(): Promise<SesionActual> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  return sesion;
}

/**
 * Exige un rol. Con otro rol responde igual que si la página no existiera,
 * para no revelar qué rutas hay (RS-08).
 */
export async function requerirRol(rol: Rol): Promise<SesionActual> {
  const sesion = await requerirSesion();
  if (sesion.usuario.rol !== rol) notFound();
  return sesion;
}
