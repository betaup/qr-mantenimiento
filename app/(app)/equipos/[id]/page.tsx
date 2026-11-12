import Link from "next/link";
import { notFound } from "next/navigation";
import { CampoMotivo, CamposServicio } from "@/components/campos-servicio";
import { Formulario } from "@/components/formulario";
import { AirVent, Ban, ClipboardCheck, Download, MapPin, PackagePlus, Wrench, type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Estado, Etiqueta, IconoEnCaja, type Tono } from "@/components/visual";
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
import { anular, corregir, registrar } from "./acciones";

const fechaYHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: ZONA_HORARIA,
});

const ICONO_DE_TIPO: Record<TipoServicio, { icono: LucideIcon; tono: Tono }> =
  {
    INSTALACION: { icono: PackagePlus, tono: "azul" },
    MANTENIMIENTO: { icono: ClipboardCheck, tono: "verde" },
    REPARACION: { icono: Wrench, tono: "naranja" },
  };

const desplegable =
  "text-sm font-medium underline-offset-4 hover:underline cursor-pointer w-fit";

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
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="panel flex flex-col gap-4">
        <Link
          href={esAdmin ? `/admin/equipos/${equipo.id}` : "/tecnico"}
          className="text-muted-foreground w-fit text-sm underline-offset-4 hover:underline"
        >
          {esAdmin ? "Volver al equipo" : "Volver a tus equipos"}
        </Link>
        <div className="flex items-center gap-4">
          <IconoEnCaja icono={AirVent} grande />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {equipo.nombre}
            </h1>
            <p className="text-muted-foreground truncate">{equipo.modelo}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Etiqueta mono>{equipo.serie}</Etiqueta>
          <Etiqueta icono={MapPin}>{equipo.ubicacion}</Etiqueta>
        </div>
        {/* Enlace normal, no <Link>: es una descarga, no una página. */}
        <a
          href={`/equipos/${equipo.id}/reporte`}
          className={buttonVariants({
            variant: "outline",
            className: "h-11 w-full sm:h-9 sm:w-fit",
          })}
        >
          <Download aria-hidden />
          Descargar reporte PDF
        </a>
      </div>

      {!esAdmin && (
        <section className="panel flex flex-col gap-4">
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
            <label className="bg-muted/60 flex cursor-pointer items-start gap-3 rounded-lg p-3 text-sm leading-relaxed">
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

      <section className="panel flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Historial</h2>

        {historial.length === 0 ? (
          <p className="text-muted-foreground">
            Este equipo todavía no tiene servicios registrados.
          </p>
        ) : (
          <ol className="divide-y">
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
      </section>
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
          <summary className={desplegable}>Corregir</summary>
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
          <summary className={desplegable}>Anular</summary>
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
