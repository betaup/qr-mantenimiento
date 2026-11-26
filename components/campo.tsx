import type { ComponentProps } from "react";
import { KeyRound, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const claseDeCampo =
  "bg-secondary placeholder:text-muted-foreground/70 focus-visible:ring-ring/60 h-11 w-full min-w-0 rounded-xl px-3.5 text-base outline-none transition-shadow focus-visible:bg-card focus-visible:ring-3 md:text-sm";

export function Campo({
  etiqueta,
  ayuda,
  icono: Icono,
  name,
  className,
  ...props
}: {
  etiqueta: string;
  ayuda?: string;
  icono?: LucideIcon;
  name: string;
} & ComponentProps<"input">) {
  const id = props.id ?? name;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      <div className="relative">
        {Icono && (
          <Icono
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
          />
        )}
        <input
          name={name}
          aria-describedby={ayuda ? `${id}-ayuda` : undefined}
          className={cn(claseDeCampo, Icono && "pl-10", className)}
          {...props}
          id={id}
        />
      </div>
      {ayuda && (
        <p id={`${id}-ayuda`} className="text-muted-foreground text-xs">
          {ayuda}
        </p>
      )}
    </div>
  );
}

/** Confirmacion con la contraseña del admin para una accion sensible (RS-09). */
export function CampoPasswordAdmin({ id }: { id: string }) {
  return (
    <Campo
      id={id}
      name="passwordAdmin"
      etiqueta="Tu contraseña"
      icono={KeyRound}
      type="password"
      autoComplete="current-password"
      required
      ayuda="Para confirmar que eres tú."
    />
  );
}
