import { notFound } from "next/navigation";
import { CampoPasswordAdmin } from "@/components/campo";
import { Formulario } from "@/components/formulario";
import { Avatar, Estado, Volver } from "@/components/visual";
import { CampoPassword } from "@/components/campo-password";
import { cn } from "@/lib/utils";
import { obtenerTecnico } from "@/lib/datos/tecnicos";
import { LONGITUD_MINIMA } from "@/lib/auth/reglas";
import {
  desactivarTecnico,
  reactivarTecnico,
  restablecerPasswordDeTecnico,
} from "../acciones";

export default async function PaginaTecnico({
  params,
}: PageProps<"/admin/tecnicos/[id]">) {
  const { id } = await params;
  const tecnico = await obtenerTecnico(id);
  if (!tecnico) notFound();

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="[&>a]:bg-card">
          <Volver href="/admin/tecnicos">Volver a técnicos</Volver>
        </span>
        <div
          className={cn(
            "flex items-center gap-4 rounded-2xl p-5",
            tecnico.activo ? "tarjeta-hielo" : "tarjeta-gris",
          )}
        >
          <Avatar nombre={tecnico.nombre} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {tecnico.nombre}
            </h1>
            <p className="text-foreground/60 truncate">{tecnico.correo}</p>
          </div>
          <Estado tono={tecnico.activo ? "verde" : "gris"}>
            {tecnico.activo ? "Activo" : "Desactivado"}
          </Estado>
        </div>
      </div>

      <section className="panel flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">Restablecer contraseña</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Define una contraseña nueva y entrégasela en persona. Sus sesiones
            abiertas se cierran.
          </p>
        </div>
        <Formulario
          accion={restablecerPasswordDeTecnico}
          boton="Restablecer contraseña"
        >
          <input type="hidden" name="id" value={tecnico.id} />
          <CampoPassword
            name="password"
            etiqueta="Contraseña nueva"
            ayuda={`Mínimo ${LONGITUD_MINIMA} caracteres. La varita genera una.`}
          />
          <CampoPasswordAdmin id="passwordAdmin-restablecer" />
        </Formulario>
      </section>

      <section className="panel flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">
            {tecnico.activo ? "Desactivar cuenta" : "Reactivar cuenta"}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {tecnico.activo
              ? "No podrá iniciar sesión y sus sesiones abiertas se cierran al instante. Su historial de servicios se conserva."
              : "Podrá iniciar sesión otra vez con su contraseña actual."}
          </p>
        </div>
        <Formulario
          accion={tecnico.activo ? desactivarTecnico : reactivarTecnico}
          boton={tecnico.activo ? "Desactivar cuenta" : "Reactivar cuenta"}
          variante={tecnico.activo ? "destructive" : "default"}
        >
          <input type="hidden" name="id" value={tecnico.id} />
          <CampoPasswordAdmin id="passwordAdmin-estado" />
        </Formulario>
      </section>
    </div>
  );
}
