import { Mail, User, UserPlus } from "lucide-react";
import { Campo } from "@/components/campo";
import { Formulario } from "@/components/formulario";
import { IconoEnCaja, TarjetaTecnico } from "@/components/visual";
import { CampoPassword } from "@/components/campo-password";
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
                <TarjetaTecnico
                  href={`/admin/tecnicos/${tecnico.id}`}
                  tecnico={tecnico}
                />
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
