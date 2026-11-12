"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotonImprimir({ children }: { children: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="bg-card h-9 self-start px-3.5 print:hidden"
      onClick={() => window.print()}
    >
      <Printer aria-hidden />
      {children}
    </Button>
  );
}
