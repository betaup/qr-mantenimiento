import { notFound, redirect } from "next/navigation";
import { resolverEscaneo } from "@/lib/datos/servicios";
import { obtenerSesion } from "@/lib/auth/sesion";
import { destinoSeguro } from "@/lib/validacion";

// Destino de un código QR. Sin sesión siempre manda al inicio de sesión, sin
// consultar el token: quien no tiene cuenta no puede saber si existe (T1).
export default async function Escaneo({ params }: PageProps<"/e/[token]">) {
  const { token } = await params;
  const ruta = destinoSeguro(`/e/${token}`);

  if (!(await obtenerSesion())) {
    redirect(ruta ? `/login?siguiente=${encodeURIComponent(ruta)}` : "/login");
  }
  if (!ruta) notFound();

  const equipoId = await resolverEscaneo(token);
  if (!equipoId) notFound();

  redirect(`/equipos/${equipoId}`);
}
