// Esquemas de validación de entradas (RS-10). Todo lo que llega de un
// formulario pasa por aquí antes de tocar la base de datos.
import { z } from "zod";
import { LONGITUD_MAXIMA, validarPassword } from "@/lib/auth/reglas";
import { TIPOS_SERVICIO, fechaDeHoy } from "@/lib/dominio";

const texto = (minimo: number, maximo: number) =>
  z.string().trim().min(minimo).max(maximo);

const id = z.string().min(1).max(40);

export const correo = z.string().trim().toLowerCase().max(254).pipe(z.email());

const passwordNueva = z
  .string()
  .max(LONGITUD_MAXIMA)
  .superRefine((valor, contexto) => {
    const motivo = validarPassword(valor);
    if (motivo) contexto.addIssue({ code: "custom", message: motivo });
  });

/** Fecha YYYY-MM-DD que además existe en el calendario. */
export const fecha = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((valor) => {
    const d = new Date(`${valor}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(valor);
  });

export const tecnicoNuevo = z.object({
  nombre: texto(2, 80),
  correo,
  password: passwordNueva,
});

export const passwordRestablecida = z.object({
  tecnicoId: id,
  password: passwordNueva,
});

export const equipoNuevo = z.object({
  nombre: texto(2, 80),
  modelo: texto(1, 80),
  serie: texto(1, 60),
  ubicacion: texto(1, 120),
  seccion: z
    .string()
    .trim()
    .max(60)
    .transform((valor) => valor || null),
});

export const asignacionNueva = z.object({
  equipoId: id,
  tecnicoId: id,
  fecha: fecha.refine((valor) => valor >= fechaDeHoy()),
});

const tipo = z.enum(TIPOS_SERVICIO);
const descripcion = texto(5, 2000);
const motivo = texto(5, 500);

export const servicioNuevo = z.object({
  equipoId: id,
  tipo,
  descripcion,
  // El técnico confirma que está frente al equipo correcto (RS-15).
  confirmado: z.literal("on"),
});

export const correccionNueva = z.object({
  servicioId: id,
  tipo,
  descripcion,
  motivo,
});

export const anulacionNueva = z.object({ servicioId: id, motivo });

export const soloId = z.object({ id });

const RUTA_DE_QR = /^\/e\/[A-Za-z0-9_-]{20,64}$/;

/**
 * Destino al que volver después de iniciar sesión. Solo se acepta la ruta de
 * un QR, así el parámetro no sirve para redirigir a otro sitio.
 */
export function destinoSeguro(valor: unknown): string | null {
  return typeof valor === "string" && RUTA_DE_QR.test(valor) ? valor : null;
}

/** Primer mensaje útil de un error de validación. */
export function mensajeDe(error: z.ZodError, porDefecto: string): string {
  const propio = error.issues.find((i) => i.code === "custom");
  return propio?.message ?? porDefecto;
}
