import { CalendarX } from "lucide-react";
import { IconoEnCaja, TarjetaEquipo } from "@/components/visual";
import { equiposDeHoy } from "@/lib/datos/servicios";
import { requerirRol } from "@/lib/auth/guardas";

// Sin título propio: se mostraría también a quien no tiene este rol y
// revelaría que la ruta existe (RS-08).
export default async function PaginaTecnico() {
  const { usuario } = await requerirRol("TECNICO");
  const equipos = await equiposDeHoy();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Hola, {usuario.nombre.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          {equipos.length === 1
            ? "Hoy tienes 1 equipo asignado."
            : `Hoy tienes ${equipos.length} equipos asignados.`}
        </p>
      </div>

      {equipos.length === 0 ? (
        <div className="panel flex items-center gap-4">
          <IconoEnCaja icono={CalendarX} tono="gris" />
          <p className="leading-relaxed">
            Pide al admin de tu empresa que te asigne los equipos que vas a
            atender.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {equipos.map((equipo) => (
            <li key={equipo.id}>
              <TarjetaEquipo href={`/equipos/${equipo.id}`} equipo={equipo} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
