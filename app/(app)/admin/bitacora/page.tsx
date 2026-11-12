import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  OctagonX,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { z } from "zod";
import { consultarBitacora } from "@/lib/datos/bitacora";
import { ZONA_HORARIA } from "@/lib/dominio";
import { cn } from "@/lib/utils";

const fechaYHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: ZONA_HORARIA,
});

const NOMBRE_DE_ACCION: Record<string, string> = {
  LOGIN: "Inicio de sesión",
  LOGOUT: "Cierre de sesión",
  REAUTENTICACION: "Confirmación de contraseña",
  TECNICO_ALTA: "Alta de técnico",
  TECNICO_BAJA: "Cuenta desactivada",
  TECNICO_REACTIVADO: "Cuenta reactivada",
  PASSWORD_RESTABLECIDA: "Contraseña restablecida",
  EQUIPO_ALTA: "Alta de equipo",
  EQUIPO_CONSULTA: "Consulta de equipo",
  QR_REGENERADO: "QR regenerado",
  QR_ESCANEO: "Escaneo de QR",
  ASIGNACION_ALTA: "Asignación",
  ASIGNACION_BAJA: "Asignación quitada",
  SERVICIO_ALTA: "Servicio registrado",
  SERVICIO_CORRECCION: "Servicio corregido",
  SERVICIO_ANULACION: "Servicio anulado",
  PDF_GENERADO: "Reporte PDF",
  BITACORA_CONSULTA: "Consulta de bitácora",
};

const RESULTADO: Record<
  string,
  { nombre: string; icono: LucideIcon; color: string }
> = {
  EXITO: { nombre: "Éxito", icono: CircleCheck, color: "text-lime-700" },
  FALLO: { nombre: "Fallo", icono: TriangleAlert, color: "text-amber-600" },
  DENEGADO: { nombre: "Denegado", icono: OctagonX, color: "text-red-600" },
};

const numeroDePagina = z.coerce.number().int().min(1).max(100_000).catch(1);

/** Páginas a mostrar: la primera, la última y las vecinas de la actual. */
function paginasVisibles(actual: number, total: number): (number | null)[] {
  const visibles = new Set([1, total, actual - 1, actual, actual + 1]);
  const numeros = [...visibles]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  // null marca un salto entre números no consecutivos.
  return numeros.flatMap((n, i) =>
    i > 0 && n - numeros[i - 1] > 1 ? [null, n] : [n],
  );
}

const botonDePagina =
  "focus-visible:ring-ring/60 flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-2.5 text-sm font-medium outline-none focus-visible:ring-3";

// Sin título propio: se mostraría también a quien no tiene este rol y
// revelaría que la ruta existe (RS-08).
export default async function PaginaBitacora({
  searchParams,
}: PageProps<"/admin/bitacora">) {
  const pedida = numeroDePagina.parse((await searchParams).pagina);
  const { eventos, total, paginas } = await consultarBitacora(pedida);
  const pagina = Math.min(pedida, paginas);
  const enlace = (n: number) => `/admin/bitacora?pagina=${n}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Bitácora</h1>
        <p className="text-muted-foreground">
          No se puede modificar ni borrar. Cada consulta queda anotada.
        </p>
      </div>

      <div className="bg-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left">
                <th className="px-5 py-3.5 font-medium">Resultado</th>
                <th className="px-5 py-3.5 font-medium">Fecha</th>
                <th className="px-5 py-3.5 font-medium">Evento</th>
                <th className="px-5 py-3.5 font-medium">Quién</th>
                <th className="px-5 py-3.5 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {eventos.map((evento) => {
                const resultado = RESULTADO[evento.resultado];
                const Icono = resultado?.icono ?? CircleCheck;
                return (
                  <tr key={evento.id}>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={cn(
                          "flex items-center gap-2 font-medium",
                          resultado?.color,
                        )}
                      >
                        <Icono className="size-[1.15rem]" aria-hidden />
                        {resultado?.nombre ?? evento.resultado}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-5 py-3.5 whitespace-nowrap tabular-nums">
                      {fechaYHora.format(evento.creadoEn)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium">
                        {NOMBRE_DE_ACCION[evento.accion] ?? evento.accion}
                      </p>
                      {evento.detalle && (
                        <p className="text-muted-foreground max-w-md truncate text-xs">
                          {evento.detalle}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {evento.usuario?.nombre ?? "Sin sesión"}
                    </td>
                    <td className="text-muted-foreground px-5 py-3.5 font-mono text-xs">
                      {evento.ip}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {eventos.length === 0 && (
          <p className="text-muted-foreground px-5 py-8 text-center">
            No hay eventos en esta página.
          </p>
        )}

        <nav
          aria-label="Páginas"
          className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5"
        >
          <p className="text-muted-foreground text-sm">
            {eventos.length} de {total} eventos
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            {pagina > 1 ? (
              <Link
                href={enlace(pagina - 1)}
                className={cn(botonDePagina, "hover:bg-secondary pr-3")}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Anterior
              </Link>
            ) : (
              <span
                className={cn(botonDePagina, "text-muted-foreground/50 pr-3")}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Anterior
              </span>
            )}

            {paginasVisibles(pagina, paginas).map((n, i) =>
              n === null ? (
                <span key={`salto-${i}`} className="text-muted-foreground px-1">
                  …
                </span>
              ) : (
                <Link
                  key={n}
                  href={enlace(n)}
                  aria-current={n === pagina ? "page" : undefined}
                  className={cn(
                    botonDePagina,
                    n === pagina
                      ? "bg-foreground text-background border-transparent"
                      : "hover:bg-secondary",
                  )}
                >
                  {n}
                </Link>
              ),
            )}

            {pagina < paginas ? (
              <Link
                href={enlace(pagina + 1)}
                className={cn(botonDePagina, "hover:bg-secondary pl-3")}
              >
                Siguiente
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <span
                className={cn(botonDePagina, "text-muted-foreground/50 pl-3")}
              >
                Siguiente
                <ChevronRight className="size-4" aria-hidden />
              </span>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
