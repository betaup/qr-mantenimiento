import { notFound } from "next/navigation";
import { CampoMotivo, CamposServicio } from "@/components/campos-servicio";
import { Formulario } from "@/components/formulario";
import {
  Ban,
  ChevronDown,
  ClipboardCheck,
  Cog,
  Download,
  MapPin,
  Package,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Estado,
  Etiqueta,
  IconoDeEquipo,
  IconoEnCaja,
  Volver,
  type Tono,
} from "@/components/visual";
import {
  equipoAccesible,
  historialDe,
  type EntradaDeHistorial,
} from "@/lib/datos/servicios";
import {
  NOMBRE_DE_TIPO,
  ZONA_HORARIA,
  type TipoServicio,
} from "@/lib/dominio";
import { requerirSesion } from "@/lib/auth/guardas";
import { cn } from "@/lib/utils";
import { anular, corregir, registrar } from "./acciones";

const fechaYHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: ZONA_HORARIA,
});

const ICONO_DE_TIPO: Record<TipoServicio, { icono: LucideIcon; tono: Tono }> =
  {
    INSTALACION: { icono: Package, tono: "azul" },
    MANTENIMIENTO: { icono: ClipboardCheck, tono: "verde" },
    REPARACION: { icono: Cog, tono: "naranja" },
  };

// Los desplegables se ven como botones, con su icono, para que se note que
// se pueden abrir.
const desplegable =
  "hover:bg-secondary focus-visible:ring-ring/60 inline-flex h-9 w-fit cursor-pointer list-none items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none focus-visible:ring-3 [&::-webkit-details-marker]:hidden";

export default async function PaginaEquipo({
  params,
}: PageProps<"/equipos/[id]">) {
  const { id } = await params;
  const { usuario } = await requerirSesion();
  const equipo = await equipoAccesible(id);
  if (!equipo) notFound();

  const historial = await historialDe(equipo.id);
  const esAdmin = usuario.rol === "ADMIN";

  return (
    <div className="@container/equipo flex min-w-0 flex-col gap-5">
      <Volver href={esAdmin ? `/admin/equipos/${equipo.id}` : "/tecnico"}>
        {esAdmin ? "Volver al equipo" : "Volver a tus equipos"}
      </Volver>

      <div className="tarjeta-verde flex min-w-0 flex-col gap-4 rounded-2xl p-5 @min-[40rem]/equipo:flex-row @min-[40rem]/equipo:items-center @min-[40rem]/equipo:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-4">
            <IconoEnCaja icono={IconoDeEquipo} tono="claro" grande />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight wrap-anywhere">
                {equipo.nombre}
              </h1>
              <p className="text-foreground/60 wrap-anywhere">{equipo.modelo}</p>
            </div>
          </div>
          <div className="flex min-w-0 flex-wrap gap-2">
            <Etiqueta mono>{equipo.serie}</Etiqueta>
            <Etiqueta icono={MapPin}>{equipo.ubicacion}</Etiqueta>
          </div>
        </div>
        {/* Enlace normal, no <Link>: es una descarga, no una página. */}
        <a
          href={`/equipos/${equipo.id}/reporte`}
          className={buttonVariants({
            variant: "outline",
            className: "h-11 w-full shrink-0 border-transparent bg-white/70 @min-[40rem]/equipo:w-auto",
          })}
        >
          <Download aria-hidden />
          Descargar reporte PDF
        </a>
      </div>

      <div
        className={cn(
          "grid min-w-0 gap-5",
          !esAdmin &&
            "@min-[56rem]/equipo:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] print:grid-cols-1",
        )}
      >
        {!esAdmin && (
          <section className="panel flex min-w-0 flex-col gap-4">
            <h2 className="text-lg font-semibold">Registrar servicio</h2>
            <Formulario
              accion={registrar}
              boton="Registrar servicio"
              enviando="Registrando…"
            >
              <input type="hidden" name="equipoId" value={equipo.id} />
              <CamposServicio prefijo="nuevo" />

              {/* El QR pudo pegarse en otro equipo: el técnico compara la placa
                  con estos datos antes de registrar (RS-15, T6). */}
              <label className="bg-muted/60 flex cursor-pointer items-start gap-3 rounded-lg p-3 text-sm leading-relaxed wrap-anywhere">
                <input
                  type="checkbox"
                  name="confirmado"
                  required
                  className="accent-primary mt-0.5 size-4 shrink-0"
                />
                <span>
                  Confirmo que la placa del equipo dice {equipo.modelo}, serie{" "}
                  <span className="font-mono">{equipo.serie}</span>, y que está
                  en {equipo.ubicacion}.
                </span>
              </label>
            </Formulario>
          </section>
        )}

        <section
          className={cn(
            "panel flex min-h-0 min-w-0 flex-col gap-2",
            !esAdmin &&
              "@min-[56rem]/equipo:[contain:size] print:[contain:none]",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="historial-equipo" className="text-lg font-semibold">
              Historial
            </h2>
            <span className="text-muted-foreground text-sm">
              {historial.length} {historial.length === 1 ? "registro" : "registros"}
            </span>
          </div>

          {/* En dos columnas, el historial ocupa la altura del formulario y
              se desplaza por dentro. En móvil e impresión conserva su altura. */}
          <div
            role="region"
            aria-labelledby="historial-equipo"
            tabIndex={historial.length > 0 ? 0 : undefined}
            className={cn(
              "min-w-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
              !esAdmin &&
                "@min-[56rem]/equipo:min-h-0 @min-[56rem]/equipo:flex-1 @min-[56rem]/equipo:overflow-y-auto @min-[56rem]/equipo:overscroll-y-contain @min-[56rem]/equipo:[scrollbar-gutter:stable] print:flex-none print:overflow-visible",
            )}
          >
            {historial.length === 0 ? (
              <p className="text-muted-foreground">
                Este equipo todavía no tiene servicios registrados.
              </p>
            ) : (
              <ol className="divide-y wrap-anywhere">
                {historial.map((entrada) => (
                  <Entrada
                    key={entrada.id}
                    entrada={entrada}
                    equipoId={equipo.id}
                    puedeCorregir={
                      !entrada.anulacion &&
                      (esAdmin || entrada.autorId === usuario.id)
                    }
                    puedeAnular={!entrada.anulacion && esAdmin}
                  />
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Entrada({
  entrada,
  equipoId,
  puedeCorregir,
  puedeAnular,
}: {
  entrada: EntradaDeHistorial;
  equipoId: string;
  puedeCorregir: boolean;
  puedeAnular: boolean;
}) {
  const corregido = entrada.correcciones.length > 0;
  const anulado = entrada.anulacion !== null;

  return (
    <li className="flex gap-4 py-5 last:pb-1">
      <IconoEnCaja
        icono={anulado || !entrada.tipo ? Ban : ICONO_DE_TIPO[entrada.tipo].icono}
        tono={anulado || !entrada.tipo ? "gris" : ICONO_DE_TIPO[entrada.tipo].tono}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            {entrada.tipo ? NOMBRE_DE_TIPO[entrada.tipo] : "Servicio"}
          </span>
          {anulado && <Estado tono="rojo">Anulado</Estado>}
          {corregido && !anulado && <Estado tono="naranja">Corregido</Estado>}
        </div>
        <p className="text-muted-foreground text-sm">
          {entrada.autor}, {fechaYHora.format(entrada.creadoEn)}
        </p>
      </div>

      <p
        className={
          anulado
            ? "text-muted-foreground leading-relaxed whitespace-pre-wrap line-through"
            : "leading-relaxed whitespace-pre-wrap"
        }
      >
        {entrada.descripcion}
      </p>

      {entrada.anulacion && (
        <div className="text-sm leading-relaxed">
          <p>
            Anulado por {entrada.anulacion.autor},{" "}
            {fechaYHora.format(entrada.anulacion.creadoEn)}
          </p>
          <p>Motivo: {entrada.anulacion.motivo}</p>
        </div>
      )}

      {corregido && (
        <details className="flex flex-col gap-2">
          <summary className={desplegable}>
            <ChevronDown className="size-4" aria-hidden />
            Ver correcciones y texto original
          </summary>
          <div className="bg-muted/60 mt-3 flex flex-col gap-3 rounded-lg p-3 text-sm leading-relaxed">
            {entrada.correcciones.map((correccion) => (
              <div key={correccion.id}>
                <p>
                  Corregido por {correccion.autor},{" "}
                  {fechaYHora.format(correccion.creadoEn)}
                </p>
                <p>Motivo: {correccion.motivo}</p>
              </div>
            ))}
            <div>
              <p className="font-medium">
                Registro original
                {entrada.original.tipo &&
                  ` (${NOMBRE_DE_TIPO[entrada.original.tipo]})`}
              </p>
              <p className="whitespace-pre-wrap">
                {entrada.original.descripcion}
              </p>
            </div>
          </div>
        </details>
      )}

      {puedeCorregir && (
        <details>
          <summary className={desplegable}>
            <Pencil className="size-4" aria-hidden />
            Corregir
          </summary>
          <div className="mt-3 rounded-lg border p-4">
            <Formulario accion={corregir} boton="Guardar corrección">
              <input type="hidden" name="equipoId" value={equipoId} />
              <input type="hidden" name="servicioId" value={entrada.id} />
              <CamposServicio
                prefijo={`corregir-${entrada.id}`}
                tipo={entrada.tipo}
                descripcion={entrada.descripcion}
              />
              <CampoMotivo prefijo={`corregir-${entrada.id}`} />
            </Formulario>
          </div>
        </details>
      )}

      {puedeAnular && (
        <details>
          <summary className={desplegable}>
            <Ban className="size-4" aria-hidden />
            Anular
          </summary>
          <div className="mt-3 flex flex-col gap-3 rounded-lg border p-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              El servicio queda marcado como anulado y ya no cuenta en el
              historial. El registro original se conserva.
            </p>
            <Formulario
              accion={anular}
              boton="Anular servicio"
              variante="destructive"
            >
              <input type="hidden" name="equipoId" value={equipoId} />
              <input type="hidden" name="servicioId" value={entrada.id} />
              <CampoMotivo prefijo={`anular-${entrada.id}`} />
            </Formulario>
          </div>
        </details>
      )}
      </div>
    </li>
  );
}
