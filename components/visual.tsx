import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Snowflake,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Piezas visuales que se repiten en las pantallas: icono en caja, estado con
// punto, avatar con iniciales, etiqueta y tarjeta de equipo.

const TONOS = {
  verde: "bg-brand/25 text-brand-foreground",
  naranja: "bg-amber-100 text-amber-800",
  azul: "bg-sky-100 text-sky-800",
  violeta: "bg-violet-100 text-violet-800",
  gris: "bg-secondary text-muted-foreground",
  oscuro: "bg-foreground text-background",
} as const;

export type Tono = keyof typeof TONOS;

export function IconoEnCaja({
  icono: Icono,
  tono = "verde",
  grande = false,
}: {
  icono: LucideIcon;
  tono?: Tono;
  grande?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        grande ? "size-14" : "size-11",
        TONOS[tono],
      )}
    >
      <Icono className={grande ? "size-7" : "size-5"} aria-hidden />
    </span>
  );
}

const PUNTOS = {
  verde: "bg-lime-500",
  naranja: "bg-amber-400",
  rojo: "bg-red-500",
  gris: "bg-neutral-400",
} as const;

/** Estado corto con un punto de color. */
export function Estado({
  tono,
  children,
}: {
  tono: keyof typeof PUNTOS;
  children: React.ReactNode;
}) {
  return (
    <span className="bg-secondary inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap">
      <span className={cn("size-1.5 rounded-full", PUNTOS[tono])} />
      {children}
    </span>
  );
}

export function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
}

export function Avatar({
  nombre,
  chico = false,
}: {
  nombre: string;
  chico?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-foreground text-background flex shrink-0 items-center justify-center rounded-full font-medium",
        chico ? "size-6 text-[0.65rem]" : "size-11 text-sm",
      )}
    >
      {iniciales(nombre)}
    </span>
  );
}

/** Dato corto en una pastilla, con icono opcional. */
export function Etiqueta({
  icono: Icono,
  mono = false,
  children,
}: {
  icono?: LucideIcon;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "bg-secondary inline-flex w-fit max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs",
        mono && "font-mono",
      )}
    >
      {Icono && <Icono className="size-3.5 shrink-0" aria-hidden />}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Círculo con flecha que marca una tarjeta como enlace. */
export function Flecha() {
  return (
    <span className="bg-secondary group-hover:bg-foreground group-hover:text-background flex size-9 shrink-0 items-center justify-center rounded-full transition-colors">
      <ArrowUpRight className="size-4" aria-hidden />
    </span>
  );
}

export const tarjetaEnlace =
  "panel group focus-visible:ring-ring/50 flex flex-col gap-4 outline-none focus-visible:ring-3";

/** Icono de un equipo de clima o refrigeración. */
export const IconoDeEquipo = Snowflake;

/** Enlace para regresar: una pastilla con flecha, para que se note que se puede usar. */
export function Volver({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="bg-secondary hover:bg-foreground hover:text-background focus-visible:ring-ring/60 inline-flex w-fit items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-3"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children}
    </Link>
  );
}

/** Tarjeta de un equipo: nombre arriba, serie grande abajo, sobre un fondo verde suave. */
export function TarjetaEquipo({
  href,
  equipo,
}: {
  href: string;
  equipo: { nombre: string; modelo: string; serie: string; ubicacion: string };
}) {
  return (
    <Link
      href={href}
      className="tarjeta-verde group focus-visible:ring-ring/60 flex min-h-48 flex-col justify-between gap-8 rounded-2xl p-5 outline-none focus-visible:ring-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg leading-tight font-medium">{equipo.nombre}</p>
          <p className="text-foreground/60 mt-1 truncate text-sm">
            {equipo.modelo}
          </p>
        </div>
        <span className="group-hover:bg-foreground group-hover:text-background flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/60 transition-colors">
          <ArrowUpRight className="size-5" aria-hidden />
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate font-mono text-2xl font-medium tracking-tight">
          {equipo.serie}
        </p>
        <p className="text-foreground/60 mt-1 flex items-center gap-1.5 text-sm">
          <MapPin className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{equipo.ubicacion}</span>
        </p>
      </div>
    </Link>
  );
}
