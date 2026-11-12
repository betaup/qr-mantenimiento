"use client";

import { Button } from "@/components/ui/button";

export function BotonImprimir({ children }: { children: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 self-start px-3.5 print:hidden"
      onClick={() => window.print()}
    >
      {children}
    </Button>
  );
}
