"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "/admin", nombre: "Asignaciones" },
  { href: "/admin/equipos", nombre: "Equipos" },
  { href: "/admin/tecnicos", nombre: "Técnicos" },
];

export function NavAdmin() {
  const ruta = usePathname();

  return (
    <nav aria-label="Secciones" className="-mx-1 flex gap-1 print:hidden">
      {SECCIONES.map(({ href, nombre }) => {
        const actual = href === "/admin" ? ruta === href : ruta.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={actual ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              actual
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {nombre}
          </Link>
        );
      })}
    </nav>
  );
}
