"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, WandSparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { claseDeCampo } from "@/components/campo";
import { cn } from "@/lib/utils";

// Sin caracteres que se confunden al dictarlos o escribirlos (0/O, 1/l).
const ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789";

function passwordAleatoria(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const letras = Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]);
  return [0, 4, 8, 12].map((i) => letras.slice(i, i + 4).join("")).join("-");
}

const botonDeCampo =
  "text-muted-foreground hover:bg-card hover:text-foreground focus-visible:ring-ring/60 flex size-8 cursor-pointer items-center justify-center rounded-lg outline-none focus-visible:ring-3";

/**
 * Contraseña nueva para un técnico: se puede ver, ocultar o generar al azar.
 * Una generada se muestra para que el admin la anote y la entregue.
 */
export function CampoPassword({
  name,
  etiqueta,
  ayuda,
}: {
  name: string;
  etiqueta: string;
  ayuda: string;
}) {
  const [valor, setValor] = useState("");
  const [visible, setVisible] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  // El formulario se limpia al guardar; este campo guarda su valor en estado
  // y hay que vaciarlo a mano.
  useEffect(() => {
    const formulario = campo.current?.form;
    const limpiar = () => {
      setValor("");
      setVisible(false);
    };
    formulario?.addEventListener("reset", limpiar);
    return () => formulario?.removeEventListener("reset", limpiar);
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{etiqueta}</Label>
      <div className="relative">
        <KeyRound
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
        />
        <input
          ref={campo}
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={valor}
          onChange={(evento) => setValor(evento.target.value)}
          required
          autoComplete="new-password"
          aria-describedby={`${name}-ayuda`}
          className={cn(claseDeCampo, "pr-20 pl-10", visible && "font-mono")}
        />
        <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 gap-0.5">
          <button
            type="button"
            className={botonDeCampo}
            aria-label="Generar una contraseña"
            title="Generar una contraseña"
            onClick={() => {
              setValor(passwordAleatoria());
              setVisible(true);
            }}
          >
            <WandSparkles className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            className={botonDeCampo}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={visible ? "Ocultar" : "Mostrar"}
            onClick={() => setVisible(!visible)}
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
      <p id={`${name}-ayuda`} className="text-muted-foreground text-xs">
        {ayuda}
      </p>
    </div>
  );
}
