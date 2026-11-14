export type EstadoFormulario = { error?: string; exito?: string };

export type AccionDeFormulario = (
  previo: EstadoFormulario,
  formulario: FormData,
) => Promise<EstadoFormulario>;

export type Respuesta = { ok: true } | { ok: false; error: string };

export const hecho: Respuesta = { ok: true };
export const fallo = (error: string): Respuesta => ({ ok: false, error });
