import { redirect } from "next/navigation";
import { rutaDeInicio } from "@/lib/auth/guardas";
import { obtenerSesion } from "@/lib/auth/sesion";

export default async function Inicio() {
  const sesion = await obtenerSesion();
  redirect(sesion ? rutaDeInicio(sesion.usuario.rol) : "/login");
}
