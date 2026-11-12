// Valores fijos del dominio. SQLite no tiene enums, así que estos arreglos
// son la única fuente de los valores permitidos.

export const ROLES = ["ADMIN", "TECNICO"] as const;
export type Rol = (typeof ROLES)[number];

export const TIPOS_SERVICIO = [
  "INSTALACION",
  "MANTENIMIENTO",
  "REPARACION",
] as const;
export type TipoServicio = (typeof TIPOS_SERVICIO)[number];

export const NOMBRE_DE_TIPO: Record<TipoServicio, string> = {
  INSTALACION: "Instalación",
  MANTENIMIENTO: "Mantenimiento",
  REPARACION: "Reparación",
};

export const CLASES_SERVICIO = ["ORIGINAL", "CORRECCION", "ANULACION"] as const;
export type ClaseServicio = (typeof CLASES_SERVICIO)[number];

export const RESULTADOS = ["EXITO", "DENEGADO", "FALLO"] as const;
export type Resultado = (typeof RESULTADOS)[number];

export const ZONA_HORARIA = "America/Monterrey";

/** Fecha de hoy como YYYY-MM-DD en la zona horaria del sistema. */
export function fechaDeHoy(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(
    ahora,
  );
}
