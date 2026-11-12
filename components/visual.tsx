import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Mail,
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
  // Sobre una tarjeta de color.
  claro: "bg-white/60 text-foreground",
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

/** Cuadro con flecha que marca una tarjeta como enlace. El mismo en todas. */
export function Flecha() {
  return (
    <span className="group-hover:bg-foreground group-hover:text-background flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/60 transition-colors">
      <ArrowUpRight className="size-5" aria-hidden />
    </span>
  );
}

/** Forma común de las tarjetas de color; el fondo lo pone tarjeta-verde o tarjeta-gris. */
export const tarjeta =
  "group focus-visible:ring-ring/60 flex flex-col rounded-2xl p-5 outline-none focus-visible:ring-3";

/** Tamaño y reparto de las tarjetas de una lista: todas miden lo mismo. */
const tarjetaDeLista = "h-48 justify-between gap-6";

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
      className={cn(tarjeta, tarjetaDeLista, "tarjeta-verde")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg leading-tight font-medium">
            {equipo.nombre}
          </p>
          <p className="text-foreground/60 mt-1 truncate text-sm">
            {equipo.modelo}
          </p>
        </div>
        <Flecha />
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

/**
 * Tarjeta de un técnico, con la misma estructura que la de un equipo. Va en
 * azul hielo para distinguir a las personas de los equipos; en gris si la
 * cuenta está desactivada.
 */
export function TarjetaTecnico({
  href,
  tecnico,
}: {
  href: string;
  tecnico: { nombre: string; correo: string; activo: boolean };
}) {
  return (
    <Link
      href={href}
      className={cn(
        tarjeta,
        tarjetaDeLista,
        tecnico.activo ? "tarjeta-hielo" : "tarjeta-gris",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar nombre={tecnico.nombre} />
          <div className="min-w-0">
            <p className="truncate text-lg leading-tight font-medium">
              {tecnico.nombre}
            </p>
            <p className="text-foreground/60 mt-1 truncate text-sm">Técnico</p>
          </div>
        </div>
        <Flecha />
      </div>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <Estado tono={tecnico.activo ? "verde" : "gris"}>
          {tecnico.activo ? "Activo" : "Desactivado"}
        </Estado>
        <p className="text-foreground/60 flex max-w-full items-center gap-1.5 text-sm">
          <Mail className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{tecnico.correo}</span>
        </p>
      </div>
    </Link>
  );
}
