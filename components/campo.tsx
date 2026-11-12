import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Etiqueta, campo de texto y una ayuda opcional. */
export function Campo({
  etiqueta,
  ayuda,
  name,
  ...props
}: { etiqueta: string; ayuda?: string; name: string } & ComponentProps<"input">) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={props.id ?? name}>{etiqueta}</Label>
      <Input
        id={name}
        name={name}
        aria-describedby={ayuda ? `${props.id ?? name}-ayuda` : undefined}
        className="h-9"
        {...props}
      />
      {ayuda && (
        <p
          id={`${props.id ?? name}-ayuda`}
          className="text-muted-foreground text-xs leading-relaxed"
        >
          {ayuda}
        </p>
      )}
    </div>
  );
}

/** Confirmación con la contraseña del admin para una acción sensible (RS-09). */
export function CampoPasswordAdmin({ id }: { id: string }) {
  return (
    <Campo
      id={id}
      name="passwordAdmin"
      etiqueta="Tu contraseña"
      type="password"
      autoComplete="current-password"
      required
      ayuda="La pedimos de nuevo para confirmar que eres tú."
    />
  );
}
