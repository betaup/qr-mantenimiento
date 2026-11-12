import Link from "next/link";
import { Campo } from "@/components/campo";
import { Formulario } from "@/components/formulario";
import { Avatar, Estado, Flecha, tarjetaEnlace } from "@/components/visual";
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
                  className={tarjetaEnlace}
                >
                  <div className="flex items-center gap-3">
                    <Avatar nombre={tecnico.nombre} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{tecnico.nombre}</p>
                      <p className="text-muted-foreground truncate text-sm">
                        {tecnico.correo}
                      </p>
                    </div>
                    <Flecha />
                  </div>
                  <Estado tono={tecnico.activo ? "verde" : "gris"}>
                    {tecnico.activo ? "Activo" : "Desactivado"}
                  </Estado>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel flex flex-col gap-4 self-start">
        <h2 className="font-semibold">Agregar técnico</h2>
        <Formulario accion={agregarTecnico} boton="Agregar técnico">
          <Campo name="nombre" etiqueta="Nombre" required maxLength={80} />
          <Campo
            name="correo"
            etiqueta="Correo"
            type="email"
            required
            maxLength={254}
            autoComplete="off"
          />
          <Campo
            name="password"
            etiqueta="Contraseña inicial"
            type="password"
            required
            autoComplete="new-password"
            ayuda={`Al menos ${LONGITUD_MINIMA} caracteres. Entrégasela en persona.`}
          />
        </Formulario>
      </section>
    </div>
  );
}
