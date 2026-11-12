import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { rutaDeInicio } from "@/lib/auth/guardas";
import { obtenerSesion } from "@/lib/auth/sesion";
import { FormularioLogin } from "./formulario";

export const metadata: Metadata = { title: "Iniciar sesión · Mantenimiento QR" };

export default async function PaginaLogin() {
  const sesion = await obtenerSesion();
  if (sesion) redirect(rutaDeInicio(sesion.usuario.rol));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Mantenimiento QR
        </h1>
        <p className="text-muted-foreground">
          Inicia sesión para ver tus equipos.
        </p>
      </div>

      <FormularioLogin />

      <p className="text-muted-foreground text-sm leading-relaxed">
        Si olvidaste tu contraseña, pide al admin de tu empresa que la
        restablezca.
      </p>
    </main>
  );
}
