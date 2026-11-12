import { Campo } from "@/components/campo";
import { Formulario } from "@/components/formulario";
import { TarjetaEquipo } from "@/components/visual";
import { listarEquipos } from "@/lib/datos/equipos";
import { agregarEquipo } from "./acciones";

export default async function PaginaEquipos() {
  const equipos = await listarEquipos();

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_21rem]">
      <section className="flex min-w-0 flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Equipos</h1>

        {equipos.length === 0 ? (
          <p className="panel text-muted-foreground">
            Todavía no hay equipos. Agrega el primero con el formulario.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {equipos.map((equipo) => (
              <li key={equipo.id}>
                <TarjetaEquipo
                  href={`/admin/equipos/${equipo.id}`}
                  equipo={equipo}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel flex flex-col gap-4 self-start">
        <h2 className="font-semibold">Agregar equipo</h2>
        <Formulario accion={agregarEquipo} boton="Agregar equipo">
          <Campo name="nombre" etiqueta="Nombre" required maxLength={80} />
          <Campo name="modelo" etiqueta="Modelo" required maxLength={80} />
          <Campo
            name="serie"
            etiqueta="Número de serie"
            required
            maxLength={60}
            ayuda="Como aparece en la placa del equipo."
          />
          <Campo
            name="ubicacion"
            etiqueta="Ubicación"
            required
            maxLength={120}
          />
          <Campo name="seccion" etiqueta="Sección (opcional)" maxLength={60} />
        </Formulario>
      </section>
    </div>
  );
}
