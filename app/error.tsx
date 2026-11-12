"use client";

import { Button } from "@/components/ui/button";

// Error genérico (RS-19): al navegador no llega el detalle ni la traza. El
// detalle queda en los logs del servidor, ligado al código que se muestra.
export default function ErrorDePagina({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const codigo =
    error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        No pudimos completar la acción
      </h1>
      <p className="text-muted-foreground leading-relaxed">
        Ocurrió un error de nuestro lado. Inténtalo de nuevo; si sigue pasando,
        avisa al admin de tu empresa.
      </p>
      {codigo && (
        <p className="text-muted-foreground text-sm">
          Código del error: <span className="font-mono">{codigo}</span>
        </p>
      )}
      <Button onClick={() => retry()} className="h-11 text-base">
        Intentar de nuevo
      </Button>
    </main>
  );
}
