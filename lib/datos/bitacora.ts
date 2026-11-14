import "server-only";
import { db } from "@/lib/db";
import { registrar } from "@/lib/bitacora";
import { requerirRol } from "@/lib/auth/guardas";

export const POR_PAGINA = 10;

/**
 * Eventos de la empresa del admin, del más reciente al más antiguo.
 * La consulta también queda registrada (RS-17).
 */
export async function consultarBitacora(pagina: number) {
  const { usuario } = await requerirRol("ADMIN");
  const where = { empresaId: usuario.empresaId };

  const [eventos, total] = await Promise.all([
    db.bitacora.findMany({
      where,
      select: {
        id: true,
        accion: true,
        resultado: true,
        recurso: true,
        detalle: true,
        ip: true,
        creadoEn: true,
        usuario: { select: { nombre: true } },
      },
      orderBy: { creadoEn: "desc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    db.bitacora.count({ where }),
  ]);

  await registrar({
    accion: "BITACORA_CONSULTA",
    resultado: "EXITO",
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
    detalle: `página ${pagina}`,
  });

  return {
    eventos,
    total,
    paginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
  };
}
