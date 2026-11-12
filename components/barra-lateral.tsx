"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AirVent,
  CalendarCheck,
  LogOut,
  QrCode,
  ScrollText,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Rol } from "@/lib/dominio";

type Seccion = { href: string; nombre: string; icono: LucideIcon; tambien?: string };

// La página de un equipo (/equipos/…) pertenece a "Equipos" para el admin y
// a "Mis equipos" para el técnico.
const SECCIONES: Record<Rol, Seccion[]> = {
  ADMIN: [
    { href: "/admin", nombre: "Asignaciones", icono: CalendarCheck },
    { href: "/admin/equipos", nombre: "Equipos", icono: AirVent, tambien: "/equipos" },
    { href: "/admin/tecnicos", nombre: "Técnicos", icono: Users },
    { href: "/admin/bitacora", nombre: "Bitácora", icono: ScrollText },
  ],
  TECNICO: [
    { href: "/tecnico", nombre: "Mis equipos", icono: Wrench, tambien: "/equipos" },
  ],
};

function Marca() {
  return (
    <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      <span className="bg-brand text-brand-foreground flex size-7 items-center justify-center rounded-lg">
        <QrCode className="size-4" aria-hidden />
      </span>
      Mantenimiento QR
    </span>
  );
}

export function BarraLateral({
  rol,
  nombre,
  empresa,
  salir,
}: {
  rol: Rol;
  nombre: string;
  empresa: string;
  salir: () => Promise<void>;
}) {
  const ruta = usePathname();
  const secciones = SECCIONES[rol];

  const esActual = ({ href, tambien }: Seccion) =>
    href === "/admin"
      ? ruta === href
      : ruta.startsWith(href) || (!!tambien && ruta.startsWith(tambien));

  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Celular: marca, salir y las secciones en una fila. */}
      <header className="flex flex-col gap-3 px-4 pt-4 lg:hidden print:hidden">
        <div className="flex items-center justify-between gap-3">
          <Marca />
          <form action={salir}>
            <Button type="submit" variant="outline" className="bg-card h-9">
              Salir
            </Button>
          </form>
        </div>
        {secciones.length > 1 && (
          <nav aria-label="Secciones" className="-mx-4 flex gap-1 overflow-x-auto px-4">
            {secciones.map((seccion) => (
              <Link
                key={seccion.href}
                href={seccion.href}
                aria-current={esActual(seccion) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap",
                  esActual(seccion)
                    ? "bg-card text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {seccion.nombre}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Escritorio: barra lateral fija. */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 p-5 lg:flex print:hidden">
        <Marca />

        <nav aria-label="Secciones" className="flex flex-col gap-1">
          {secciones.map((seccion) => {
            const actual = esActual(seccion);
            const Icono = seccion.icono;
            return (
              <Link
                key={seccion.href}
                href={seccion.href}
                aria-current={actual ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors",
                  actual
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {actual && (
                  <span className="bg-foreground absolute top-3 bottom-3 left-0 w-0.5 rounded-full" />
                )}
                <Icono className="size-5" aria-hidden />
                {seccion.nombre}
              </Link>
            );
          })}
        </nav>

        <div className="bg-card mt-auto flex flex-col gap-4 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="bg-foreground text-background flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-medium">
              {iniciales}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-medium">{nombre}</p>
              <p className="text-muted-foreground truncate text-sm">{empresa}</p>
            </div>
          </div>
          <form action={salir}>
            <Button type="submit" className="h-10 w-full">
              <LogOut aria-hidden />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
