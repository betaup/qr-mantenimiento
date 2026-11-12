"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
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
  icono,
  completo = false,
  className,
  children,
}: {
  accion: AccionDeFormulario;
  boton: string;
  enviando?: string;
  variante?: "default" | "outline" | "destructive";
  /** Icono del botón, ya como elemento: <Plus />. */
  icono?: ReactNode;
  /** Botón a todo el ancho del formulario. */
  completo?: boolean;
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
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {estado.error}
        </p>
      )}
      {estado.exito && (
        <p
          role="status"
          className="bg-brand/20 flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          {estado.exito}
        </p>
      )}

      <Button
        type="submit"
        variant={variante}
        disabled={pendiente}
        className={cn(
          "h-11 w-full px-4 text-base sm:text-sm",
          !completo && "sm:h-10 sm:w-auto sm:self-start",
        )}
      >
        {icono}
        {pendiente ? enviando : boton}
      </Button>
    </form>
  );
}
