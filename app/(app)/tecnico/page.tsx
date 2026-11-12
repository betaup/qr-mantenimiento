import Link from "next/link";
import { equiposDeHoy } from "@/lib/datos/servicios";

// Sin título propio: se mostraría también a quien no tiene este rol y
// revelaría que la ruta existe (RS-08).
export default async function PaginaTecnico() {
  const equipos = await equiposDeHoy();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tus equipos de hoy
        </h1>
        <p className="text-muted-foreground">
          Abre uno de la lista o escanea su código QR.
        </p>
      </div>

      {equipos.length === 0 ? (
        <p className="rounded-lg border border-dashed p-5 leading-relaxed">
          Hoy no tienes equipos asignados. Pide al admin de tu empresa que te
          asigne los que vas a atender.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {equipos.map((equipo) => (
            <li key={equipo.id}>
              <Link
                href={`/equipos/${equipo.id}`}
                className="hover:bg-muted/60 focus-visible:bg-muted/60 flex flex-col gap-0.5 px-4 py-4 outline-none"
              >
                <span className="font-medium">{equipo.nombre}</span>
                <span className="text-muted-foreground text-sm">
                  {equipo.ubicacion}
                </span>
                <span className="font-mono text-sm">{equipo.serie}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
