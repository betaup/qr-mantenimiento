/** Lo que devuelve una acción de formulario para mostrarse en pantalla. */
export type EstadoFormulario = { error?: string; exito?: string };

export type AccionDeFormulario = (
  previo: EstadoFormulario,
  formulario: FormData,
) => Promise<EstadoFormulario>;

/** Resultado de una operación de la capa de datos. */
export type Respuesta = { ok: true } | { ok: false; error: string };

export const hecho: Respuesta = { ok: true };
export const fallo = (error: string): Respuesta => ({ ok: false, error });
