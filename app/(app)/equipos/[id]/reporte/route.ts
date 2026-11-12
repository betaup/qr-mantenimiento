import type { NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { registrar } from "@/lib/bitacora";
import { equipoAccesible, historialDe } from "@/lib/datos/servicios";
import { reporteDeEquipo } from "@/lib/pdf";
import { requerirSesion } from "@/lib/auth/guardas";
import { pdfPermitido } from "@/lib/auth/limite";

// Historial acotado: un equipo con miles de servicios no debe poder usarse
// para saturar el servidor (RS-22).
const MAXIMO_DE_SERVICIOS = 200;

export async function GET(
  _peticion: NextRequest,
  contexto: RouteContext<"/equipos/[id]/reporte">,
) {
  const { id } = await contexto.params;
  const { usuario } = await requerirSesion();
  const equipo = await equipoAccesible(id);
  if (!equipo) notFound();

  const evento = {
    accion: "PDF_GENERADO",
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
    recurso: `equipo:${equipo.id}`,
  };

  if (!(await pdfPermitido(usuario.id))) {
    await registrar({ ...evento, resultado: "DENEGADO", detalle: "Tope de reportes alcanzado" });
    return new Response("Generaste muchos reportes. Espera unos minutos.", {
      status: 429,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "600" },
    });
  }

  const historial = await historialDe(equipo.id);
  const pdf = await reporteDeEquipo({
    empresa: usuario.empresa,
    equipo,
    historial: historial.slice(0, MAXIMO_DE_SERVICIOS),
    recortado: historial.length > MAXIMO_DE_SERVICIOS,
  });

  await registrar({ ...evento, resultado: "EXITO" });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="historial-de-mantenimiento.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
