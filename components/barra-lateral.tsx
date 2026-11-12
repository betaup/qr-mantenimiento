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
import { Avatar } from "@/components/visual";
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

const NOMBRE_DE_ROL: Record<Rol, string> = {
  ADMIN: "Admin",
  TECNICO: "Técnico",
};

function Marca() {
  return (
    <span className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
      <span className="bg-brand text-brand-foreground flex size-8 items-center justify-center rounded-lg">
        <QrCode className="size-[1.1rem]" aria-hidden />
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

  return (
    <>
      {/* Celular: marca, salir y las secciones en una fila. */}
      <header className="flex flex-col gap-3 px-4 pt-4 lg:hidden print:hidden">
        <div className="flex items-center justify-between gap-3">
          <Marca />
          <form action={salir}>
            <Button type="submit" variant="outline" className="bg-card h-9">
              <LogOut aria-hidden />
              Salir
            </Button>
          </form>
        </div>
        {secciones.length > 1 && (
          <nav aria-label="Secciones" className="-mx-4 flex gap-1 overflow-x-auto px-4">
            {secciones.map((seccion) => {
              const Icono = seccion.icono;
              return (
                <Link
                  key={seccion.href}
                  href={seccion.href}
                  aria-current={esActual(seccion) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap",
                    esActual(seccion)
                      ? "bg-foreground text-background"
                      : "bg-card text-muted-foreground",
                  )}
                >
                  <Icono className="size-4" aria-hidden />
                  {seccion.nombre}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Escritorio: panel blanco de alto completo. */}
      <aside className="sticky top-0 hidden h-dvh p-4 pr-2 lg:block print:hidden">
        <div className="bg-card flex h-full flex-col gap-8 rounded-3xl p-4">
          <div className="px-2 pt-3">
            <Marca />
          </div>

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
                    "flex items-center gap-3 rounded-full p-1.5 pr-4 font-medium transition-colors",
                    actual
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full",
                      actual && "bg-foreground text-background",
                    )}
                  >
                    <Icono className="size-[1.15rem]" aria-hidden />
                  </span>
                  {seccion.nombre}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1">
            <div className="bg-background flex items-center gap-3 rounded-2xl p-3">
              <Avatar nombre={nombre} />
              <div className="min-w-0 leading-tight">
                <p className="truncate font-medium">{nombre}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {NOMBRE_DE_ROL[rol]}, {empresa}
                </p>
              </div>
            </div>
            <form action={salir}>
              <button
                type="submit"
                className="text-muted-foreground hover:bg-background/60 hover:text-foreground focus-visible:ring-ring/50 flex w-full cursor-pointer items-center gap-3 rounded-full p-1.5 pr-4 font-medium outline-none transition-colors focus-visible:ring-3"
              >
                <span className="flex size-9 items-center justify-center">
                  <LogOut className="size-[1.15rem]" aria-hidden />
                </span>
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
