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
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="panel flex w-full max-w-sm flex-col gap-4 p-7">
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
      </div>
    </main>
  );
}
