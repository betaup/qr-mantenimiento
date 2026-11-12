import { Mail, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { Campo } from "@/components/campo";
import { Formulario } from "@/components/formulario";
import {
  Avatar,
  Estado,
  Flecha,
  IconoEnCaja,
  tarjeta,
} from "@/components/visual";
import { CampoPassword } from "@/components/campo-password";
import { cn } from "@/lib/utils";
import { listarTecnicos } from "@/lib/datos/tecnicos";
import { LONGITUD_MINIMA } from "@/lib/auth/reglas";
import { agregarTecnico } from "./acciones";

export default async function PaginaTecnicos() {
  const tecnicos = await listarTecnicos();

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_21rem]">
      <section className="flex min-w-0 flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Técnicos</h1>

        {tecnicos.length === 0 ? (
          <p className="panel text-muted-foreground">
            Todavía no hay técnicos. Agrega al primero con el formulario.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {tecnicos.map((tecnico) => (
              <li key={tecnico.id}>
                <Link
                  href={`/admin/tecnicos/${tecnico.id}`}
                  className={cn(
                    tarjeta,
                    "h-48 justify-between gap-6",
                    tecnico.activo ? "tarjeta-verde" : "tarjeta-gris",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Avatar nombre={tecnico.nombre} />
                    <Flecha />
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg leading-tight font-medium">
                        {tecnico.nombre}
                      </p>
                      <p className="text-foreground/60 mt-1 truncate text-sm">
                        {tecnico.correo}
                      </p>
                    </div>
                    <Estado tono={tecnico.activo ? "verde" : "gris"}>
                      {tecnico.activo ? "Activo" : "Desactivado"}
                    </Estado>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel flex flex-col gap-5 self-start">
        <div className="flex items-center gap-3">
          <IconoEnCaja icono={UserPlus} tono="oscuro" />
          <div>
            <h2 className="text-lg leading-tight font-semibold">Nuevo técnico</h2>
            <p className="text-muted-foreground text-sm">
              Entrégale su contraseña en persona.
            </p>
          </div>
        </div>
        <Formulario
          accion={agregarTecnico}
          boton="Agregar técnico"
          icono={<UserPlus aria-hidden />}
          completo
        >
          <Campo
            name="nombre"
            etiqueta="Nombre"
            icono={User}
            placeholder="Nombre y apellido"
            required
            maxLength={80}
          />
          <Campo
            name="correo"
            etiqueta="Correo"
            icono={Mail}
            type="email"
            placeholder="nombre@empresa.com"
            required
            maxLength={254}
            autoComplete="off"
          />
          <CampoPassword
            name="password"
            etiqueta="Contraseña inicial"
            ayuda={`Mínimo ${LONGITUD_MINIMA} caracteres. La varita genera una.`}
          />
        </Formulario>
      </section>
    </div>
  );
}
