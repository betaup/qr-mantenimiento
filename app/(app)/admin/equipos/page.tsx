import { Hash, Layers, MapPin, Plus, Snowflake, Tag } from "lucide-react";
import { Campo } from "@/components/campo";
import { Formulario } from "@/components/formulario";
import { IconoEnCaja, TarjetaEquipo } from "@/components/visual";
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

      <section className="panel flex flex-col gap-5 self-start">
        <div className="flex items-center gap-3">
          <IconoEnCaja icono={Plus} tono="oscuro" />
          <div>
            <h2 className="text-lg leading-tight font-semibold">Nuevo equipo</h2>
            <p className="text-muted-foreground text-sm">
              Su código QR se crea solo.
            </p>
          </div>
        </div>
        <Formulario
          accion={agregarEquipo}
          boton="Agregar equipo"
          icono={<Plus aria-hidden />}
          completo
        >
          <Campo
            name="nombre"
            etiqueta="Nombre"
            icono={Snowflake}
            placeholder="Minisplit de recepción"
            required
            maxLength={80}
          />
          <Campo
            name="modelo"
            etiqueta="Modelo"
            icono={Tag}
            placeholder="Mirage Life 12"
            required
            maxLength={80}
          />
          <Campo
            name="serie"
            etiqueta="Número de serie"
            icono={Hash}
            placeholder="Como viene en la placa"
            required
            maxLength={60}
            className="font-mono"
          />
          <Campo
            name="ubicacion"
            etiqueta="Ubicación"
            icono={MapPin}
            placeholder="Planta baja, recepción"
            required
            maxLength={120}
          />
          <Campo
            name="seccion"
            etiqueta="Sección (opcional)"
            icono={Layers}
            placeholder="Oficinas"
            maxLength={60}
          />
        </Formulario>
      </section>
    </div>
  );
}
