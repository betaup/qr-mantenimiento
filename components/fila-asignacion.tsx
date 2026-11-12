"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {asignados.length === 0 && (
          <span className="text-muted-foreground text-sm">Sin asignar</span>
        )}

        {asignados.map(({ id, tecnico }) => (
          <span
            key={id}
            className="bg-secondary flex items-center gap-1 rounded-md py-1 pr-1 pl-2.5 text-sm"
          >
            {tecnico.nombre}
            {editable && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                disabled={quitando}
                aria-label={`Quitar a ${tecnico.nombre}`}
                onClick={() => {
                  const datos = new FormData();
                  datos.set("id", id);
                  startTransition(() => enviarQuitar(datos));
                }}
              >
                Quitar
              </Button>
            )}
          </span>
        ))}

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
            <select
              name="tecnicoId"
              required
              defaultValue=""
              aria-label="Técnico"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2 text-sm outline-none focus-visible:ring-3"
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
            <Button type="submit" variant="outline" disabled={asignando}>
              Asignar
            </Button>
          </form>
        )}
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
