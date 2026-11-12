import { ClipboardCheck, HardHat, MapPin } from "lucide-react";
import { FilaAsignacion } from "@/components/fila-asignacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Estado,
  Etiqueta,
  IconoDeEquipo,
  IconoEnCaja,
} from "@/components/visual";
import { asignacionesDelDia } from "@/lib/datos/asignaciones";
import { fechaDeHoy } from "@/lib/dominio";
import { requerirRol } from "@/lib/auth/guardas";
import { fecha as esquemaDeFecha } from "@/lib/validacion";
import { asignarEquipo, quitarAsignacionDeEquipo } from "./acciones";

const formato = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "full",
  timeZone: "UTC",
});

// Sin título propio: se mostraría también a quien no tiene este rol y
// revelaría que la ruta existe (RS-08).
export default async function PaginaAsignaciones({
  searchParams,
}: PageProps<"/admin">) {
  const { usuario } = await requerirRol("ADMIN");
  const hoy = fechaDeHoy();
  const pedida = esquemaDeFecha.safeParse((await searchParams).fecha);
  const fecha = pedida.success ? pedida.data : hoy;

  const { equipos, tecnicos, servicios } = await asignacionesDelDia(fecha);
  const editable = fecha >= hoy;
  const asignados = equipos.filter((e) => e.asignaciones.length > 0).length;
  const avance = equipos.length ? (asignados / equipos.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Hola, {usuario.nombre.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground first-letter:uppercase">
            {formato.format(new Date(`${fecha}T00:00:00Z`))}
            {fecha === hoy && " (hoy)"}
          </p>
        </div>

        <form className="flex items-center gap-2">
          <Input
            name="fecha"
            type="date"
            aria-label="Día"
            defaultValue={fecha}
            className="bg-card h-10 border-transparent"
          />
          <Button type="submit" className="h-10 px-4">
            Ver día
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-foreground text-background flex flex-col justify-between gap-5 rounded-xl p-5 sm:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-background/70">Equipos asignados</p>
            <p className="text-background/70 text-sm">
              {Math.round(avance)}%
            </p>
          </div>
          <p className="text-4xl font-semibold tracking-tight">
            {asignados}
            <span className="text-background/60 text-xl font-normal">
              {" "}
              de {equipos.length}
            </span>
          </p>
          {/* Barra en SVG: la CSP no permite estilos en línea, y el ancho
              depende de los datos. */}
          <svg
            role="img"
            aria-label={`${asignados} de ${equipos.length} equipos asignados`}
            className="h-3.5 w-full overflow-hidden rounded-full"
          >
            <defs>
              <pattern
                id="trama"
                width="7"
                height="7"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="2" height="7" fill="white" fillOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="white" fillOpacity="0.15" />
            <rect width={`${avance}%`} height="100%" rx="7" className="fill-brand" />
            <rect width={`${avance}%`} height="100%" rx="7" fill="url(#trama)" />
          </svg>
        </div>

        <div className="panel flex flex-col justify-between gap-5">
          <IconoEnCaja icono={HardHat} tono="azul" />
          <div>
            <p className="text-4xl font-semibold tracking-tight">
              {tecnicos.length}
            </p>
            <p className="text-muted-foreground">Técnicos activos</p>
          </div>
        </div>

        <div className="panel flex flex-col justify-between gap-5">
          <IconoEnCaja icono={ClipboardCheck} tono="naranja" />
          <div>
            <p className="text-4xl font-semibold tracking-tight">{servicios}</p>
            <p className="text-muted-foreground">Servicios registrados</p>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Asignaciones del día
        </h2>
        {!editable && (
          <p className="text-muted-foreground text-sm">
            Este día ya pasó: solo consulta.
          </p>
        )}
      </div>

      {equipos.length === 0 ? (
        <p className="panel text-muted-foreground">
          Todavía no hay equipos. Agrega uno en la sección Equipos.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {equipos.map((equipo) => {
            const ocupados = new Set(
              equipo.asignaciones.map((a) => a.tecnico.id),
            );
            const asignado = equipo.asignaciones.length > 0;
            return (
              <li key={equipo.id} className="panel flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <IconoEnCaja
                    icono={IconoDeEquipo}
                    tono={asignado ? "verde" : "gris"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{equipo.nombre}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {equipo.serie}
                    </p>
                  </div>
                  <Estado tono={asignado ? "verde" : "naranja"}>
                    {asignado ? "Asignado" : "Sin asignar"}
                  </Estado>
                </div>
                <Etiqueta icono={MapPin}>{equipo.ubicacion}</Etiqueta>
                <div className="mt-auto border-t pt-4">
                  <FilaAsignacion
                    equipoId={equipo.id}
                    fecha={fecha}
                    asignados={equipo.asignaciones}
                    disponibles={tecnicos.filter((t) => !ocupados.has(t.id))}
                    editable={editable}
                    asignar={asignarEquipo}
                    quitar={quitarAsignacionDeEquipo}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
