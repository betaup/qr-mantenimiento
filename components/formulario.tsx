"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AccionDeFormulario, EstadoFormulario } from "@/lib/formularios";

const inicial: EstadoFormulario = {};

/**
 * Formulario que llama a una acción del servidor y muestra su resultado.
 * Conserva lo escrito si la acción falla y se limpia cuando termina bien.
 */
export function Formulario({
  accion,
  boton,
  enviando = "Guardando…",
  variante = "default",
  className,
  children,
}: {
  accion: AccionDeFormulario;
  boton: string;
  enviando?: string;
  variante?: "default" | "outline" | "destructive";
  className?: string;
  children?: ReactNode;
}) {
  const [estado, enviar, pendiente] = useActionState(accion, inicial);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.exito) formulario.current?.reset();
  }, [estado]);

  return (
    <form
      ref={formulario}
      className={cn("flex flex-col gap-4", className)}
      onSubmit={(evento) => {
        evento.preventDefault();
        const datos = new FormData(evento.currentTarget);
        startTransition(() => enviar(datos));
      }}
    >
      {children}

      {estado.error && (
        <p role="alert" className="text-destructive text-sm">
          {estado.error}
        </p>
      )}
      {estado.exito && (
        <p role="status" className="text-sm font-medium">
          {estado.exito}
        </p>
      )}

      <Button
        type="submit"
        variant={variante}
        disabled={pendiente}
        className="h-9 self-start px-3.5"
      >
        {pendiente ? enviando : boton}
      </Button>
    </form>
  );
}
