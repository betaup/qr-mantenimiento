import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QrCode } from "lucide-react";
import { rutaDeInicio } from "@/lib/auth/guardas";
import { obtenerSesion } from "@/lib/auth/sesion";
import { destinoSeguro } from "@/lib/validacion";
import { FormularioLogin } from "./formulario";

export const metadata: Metadata = { title: "Iniciar sesión · Mantenimiento QR" };

export default async function PaginaLogin({
  searchParams,
}: PageProps<"/login">) {
  const siguiente = destinoSeguro((await searchParams).siguiente);
  const sesion = await obtenerSesion();
  if (sesion) redirect(siguiente ?? rutaDeInicio(sesion.usuario.rol));

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="panel flex w-full max-w-sm flex-col gap-7 p-7">
      <div className="flex flex-col gap-2">
        <span className="bg-brand text-brand-foreground mb-2 flex size-10 items-center justify-center rounded-xl">
          <QrCode className="size-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Mantenimiento QR
        </h1>
        <p className="text-muted-foreground">
          {siguiente
            ? "Inicia sesión para abrir el equipo que escaneaste."
            : "Inicia sesión para ver tus equipos."}
        </p>
      </div>

      <FormularioLogin siguiente={siguiente ?? undefined} />

      <p className="text-muted-foreground text-sm leading-relaxed">
        Si olvidaste tu contraseña, pide al admin de tu empresa que la
        restablezca.
      </p>
      </div>
    </main>
  );
}
