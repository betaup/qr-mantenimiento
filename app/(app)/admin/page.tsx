import { FilaAsignacion } from "@/components/fila-asignacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { asignacionesDelDia } from "@/lib/datos/asignaciones";
import { fechaDeHoy } from "@/lib/dominio";
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
  const hoy = fechaDeHoy();
  const pedida = esquemaDeFecha.safeParse((await searchParams).fecha);
  const fecha = pedida.success ? pedida.data : hoy;

  const { equipos, tecnicos, servicios } = await asignacionesDelDia(fecha);
  const asignados = equipos.filter((e) => e.asignaciones.length > 0).length;
  const avance = equipos.length ? (asignados / equipos.length) * 100 : 0;
  const editable = fecha >= hoy;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Asignaciones
          </h1>
          <p className="text-muted-foreground first-letter:uppercase">
            {formato.format(new Date(`${fecha}T00:00:00Z`))}
            {fecha === hoy && " (hoy)"}
          </p>
        </div>

        <form className="flex items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha">Día</Label>
            <Input
              id="fecha"
              name="fecha"
              type="date"
              defaultValue={fecha}
              className="bg-card h-9"
            />
          </div>
          <Button type="submit" variant="outline" className="bg-card h-9">
            Ver día
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel flex flex-col gap-3 sm:col-span-2">
          <p className="text-muted-foreground text-sm">Equipos asignados</p>
          <p className="text-3xl font-semibold tracking-tight">
            {asignados}
            <span className="text-muted-foreground text-lg font-normal">
              {" "}
              de {equipos.length}
            </span>
          </p>
          {/* Barra en SVG: la CSP no permite estilos en línea, y el ancho
              depende de los datos. */}
          <svg
            role="img"
            aria-label={`${asignados} de ${equipos.length} equipos asignados`}
            className="h-3 w-full overflow-hidden rounded-full"
          >
            <defs>
              <pattern
                id="trama"
                width="7"
                height="7"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="2" height="7" fill="white" fillOpacity="0.35" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" className="fill-secondary" />
            <rect width={`${avance}%`} height="100%" rx="6" className="fill-brand" />
            <rect width={`${avance}%`} height="100%" rx="6" fill="url(#trama)" />
          </svg>
        </div>
        <div className="panel flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">Técnicos activos</p>
          <p className="text-3xl font-semibold tracking-tight">
            {tecnicos.length}
          </p>
        </div>
        <div className="panel flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">Servicios registrados</p>
          <p className="text-3xl font-semibold tracking-tight">{servicios}</p>
        </div>
      </div>

      <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
        {editable
          ? "Un técnico solo puede ver y registrar servicios en los equipos que tiene asignados ese día."
          : "Este día ya pasó: las asignaciones se muestran solo para consulta."}
      </p>

      {equipos.length === 0 ? (
        <p className="panel text-muted-foreground">
          Todavía no hay equipos. Agrega uno en la sección Equipos.
        </p>
      ) : (
        <ul className="bg-card divide-y rounded-xl px-5">
          {equipos.map((equipo) => {
            const ocupados = new Set(
              equipo.asignaciones.map((a) => a.tecnico.id),
            );
            return (
              <li
                key={equipo.id}
                className="grid gap-3 py-4 sm:grid-cols-[16rem_1fr] sm:gap-6"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium">{equipo.nombre}</p>
                  <p className="text-muted-foreground text-sm">
                    <span className="font-mono text-[0.8rem]">
                      {equipo.serie}
                    </span>
                    , {equipo.ubicacion}
                  </p>
                </div>
                <FilaAsignacion
                  equipoId={equipo.id}
                  fecha={fecha}
                  asignados={equipo.asignaciones}
                  disponibles={tecnicos.filter((t) => !ocupados.has(t.id))}
                  editable={editable}
                  asignar={asignarEquipo}
                  quitar={quitarAsignacionDeEquipo}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
