"use client";

import { startTransition, useActionState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/visual";
import type { AccionDeFormulario, EstadoFormulario } from "@/lib/formularios";

const inicial: EstadoFormulario = {};

type Persona = { id: string; nombre: string };

/** Técnicos asignados a un equipo en un día, con quitar y agregar. */
export function FilaAsignacion({
  equipoId,
  fecha,
  asignados,
  disponibles,
  editable,
  asignar,
  quitar,
}: {
  equipoId: string;
  fecha: string;
  asignados: { id: string; tecnico: Persona }[];
  disponibles: Persona[];
  editable: boolean;
  asignar: AccionDeFormulario;
  quitar: AccionDeFormulario;
}) {
  const [alAsignar, enviarAsignar, asignando] = useActionState(asignar, inicial);
  const [alQuitar, enviarQuitar, quitando] = useActionState(quitar, inicial);
  const error = alAsignar.error ?? alQuitar.error;

  return (
    <div className="flex flex-col gap-3">
      {asignados.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {asignados.map(({ id, tecnico }) => (
            <li
              key={id}
              className="bg-secondary flex items-center gap-2 rounded-full py-1 pr-1 pl-1 text-sm"
            >
              <Avatar nombre={tecnico.nombre} chico />
              {tecnico.nombre}
              {editable ? (
                <button
                  type="button"
                  disabled={quitando}
                  aria-label={`Quitar a ${tecnico.nombre}`}
                  className="hover:bg-foreground hover:text-background focus-visible:ring-ring/50 flex size-6 cursor-pointer items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-3 disabled:opacity-50"
                  onClick={() => {
                    const datos = new FormData();
                    datos.set("id", id);
                    startTransition(() => enviarQuitar(datos));
                  }}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              ) : (
                <span className="w-1" />
              )}
            </li>
          ))}
        </ul>
      )}

      {editable && disponibles.length > 0 && (
        <form
          className="flex items-center gap-2"
          onSubmit={(evento) => {
            evento.preventDefault();
            const datos = new FormData(evento.currentTarget);
            startTransition(() => enviarAsignar(datos));
          }}
        >
          <input type="hidden" name="equipoId" value={equipoId} />
          <input type="hidden" name="fecha" value={fecha} />
          <div className="relative min-w-0 flex-1">
          <select
            name="tecnicoId"
            required
            defaultValue=""
            aria-label="Técnico"
            className="bg-secondary focus-visible:ring-ring/60 h-10 w-full appearance-none rounded-xl pr-9 pl-3.5 text-sm outline-none focus-visible:ring-3"
          >
            <option value="" disabled>
              Elegir técnico
            </option>
            {disponibles.map((tecnico) => (
              <option key={tecnico.id} value={tecnico.id}>
                {tecnico.nombre}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
          />
          </div>
          <Button
            type="submit"
            disabled={asignando}
            className="h-10 gap-1.5 rounded-xl px-3.5"
          >
            <Plus className="size-4" aria-hidden />
            Asignar
          </Button>
        </form>
      )}

      {!editable && asignados.length === 0 && (
        <p className="text-muted-foreground text-sm">Nadie lo tuvo asignado.</p>
      )}

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
