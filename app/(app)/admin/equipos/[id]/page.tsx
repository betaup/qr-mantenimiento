import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonImprimir } from "@/components/boton-imprimir";
import { CampoPasswordAdmin } from "@/components/campo";
import { Formulario } from "@/components/formulario";
import { buttonVariants } from "@/components/ui/button";
import { obtenerEquipo } from "@/lib/datos/equipos";
import { imagenDelQr } from "@/lib/qr";
import { regenerarQrDeEquipo } from "../acciones";

export default async function PaginaEquipo({
  params,
}: PageProps<"/admin/equipos/[id]">) {
  const { id } = await params;
  const equipo = await obtenerEquipo(id);
  if (!equipo) notFound();

  const qr = await imagenDelQr(equipo.qrToken);

  const datos = [
    ["Modelo", equipo.modelo],
    ["Ubicación", equipo.ubicacion],
    ["Sección", equipo.seccion ?? "Sin sección"],
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 print:hidden">
        <Link
          href="/admin/equipos"
          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
        >
          Volver a equipos
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {equipo.nombre}
        </h1>
        <dl className="text-sm">
          {datos.map(([termino, valor]) => (
            <div key={termino} className="flex gap-2 py-0.5">
              <dt className="text-muted-foreground w-24 shrink-0">{termino}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>
        <Link
          href={`/equipos/${equipo.id}`}
          className={buttonVariants({
            variant: "outline",
            className: "bg-card mt-1 h-9 w-fit",
          })}
        >
          Ver historial de servicios
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold print:hidden">Etiqueta</h2>

          {/* La etiqueta lleva la serie legible para que el técnico confirme
              que el QR está pegado en el equipo correcto (T6). */}
          <div className="bg-card flex w-64 flex-col items-center gap-3 rounded-xl p-4 text-center print:border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr}
              alt={`Código QR de ${equipo.nombre}`}
              width={224}
              height={224}
            />
            <div className="flex flex-col gap-0.5">
              <p className="leading-tight font-semibold">{equipo.nombre}</p>
              <p className="font-mono text-sm">{equipo.serie}</p>
            </div>
          </div>

          <BotonImprimir>Imprimir etiqueta</BotonImprimir>
        </section>

        <section className="panel flex max-w-md flex-col gap-4 print:hidden">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">Regenerar código QR</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Úsalo si la etiqueta se perdió o alguien la copió. El código
              anterior deja de funcionar al instante, así que tendrás que
              imprimir y pegar la etiqueta nueva.
            </p>
          </div>
          <Formulario
            accion={regenerarQrDeEquipo}
            boton="Regenerar código"
            variante="destructive"
          >
            <input type="hidden" name="id" value={equipo.id} />
            <CampoPasswordAdmin id="passwordAdmin-qr" />
          </Formulario>
        </section>
      </div>
    </div>
  );
}
