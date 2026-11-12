import "server-only";
import { db } from "@/lib/db";
import type { Resultado } from "@/lib/dominio";
import { ipDeLaPeticion } from "@/lib/peticion";

type Evento = {
  accion: string;
  resultado: Resultado;
  usuarioId?: string;
  empresaId?: string;
  recurso?: string;
  detalle?: string;
};

/**
 * Agrega un evento a la bitácora (RS-17). Guarda quién, qué, cuándo, empresa
 * y resultado; nunca contraseñas, tokens ni contenido sensible (RS-20).
 */
export async function registrar(evento: Evento) {
  await db.bitacora.create({
    data: { ...evento, ip: await ipDeLaPeticion() },
  });
}
