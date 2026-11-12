"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown } from "lucide-react";
import { es } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Las fechas viajan como texto YYYY-MM-DD. Aquí se convierten a un Date
// local solo para dibujar el calendario, sin pasar por zonas horarias.
function aFecha(texto: string): Date {
  const [anio, mes, dia] = texto.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function aTexto(fecha: Date): string {
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

const corta = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });

/** Botón con la fecha que abre un calendario; al elegir un día navega a él. */
export function SelectorDeDia({ fecha, hoy }: { fecha: string; hoy: string }) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();
  const seleccionada = aFecha(fecha);

  const ir = (destino: string) => {
    setAbierto(false);
    router.push(destino === hoy ? "/admin" : `/admin?fecha=${destino}`);
  };

  return (
    <div className="flex items-center gap-2">
      {fecha !== hoy && (
        <button
          type="button"
          onClick={() => ir(hoy)}
          className="bg-card hover:bg-foreground hover:text-background focus-visible:ring-ring/60 h-10 cursor-pointer rounded-xl px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-3"
        >
          Ir a hoy
        </button>
      )}

      <Popover open={abierto} onOpenChange={setAbierto}>
        <PopoverTrigger
          aria-label={`Día: ${corta.format(seleccionada)}. Cambiar`}
          className="bg-card focus-visible:ring-ring/60 flex h-10 cursor-pointer items-center gap-2 rounded-xl pr-3 pl-3.5 text-sm font-medium outline-none focus-visible:ring-3"
        >
          <CalendarDays className="size-4" aria-hidden />
          {corta.format(seleccionada)}
          <ChevronDown className="text-muted-foreground size-4" aria-hidden />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto rounded-2xl p-2">
          <Calendar
            mode="single"
            locale={es}
            selected={seleccionada}
            defaultMonth={seleccionada}
            today={aFecha(hoy)}
            onSelect={(dia) => dia && ir(aTexto(dia))}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
