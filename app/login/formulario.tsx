"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { iniciarSesion, type EstadoLogin } from "./acciones";

const inicial: EstadoLogin = {};

export function FormularioLogin() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, inicial);

  return (
    <form action={accion} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="correo">Correo</Label>
        <Input
          id="correo"
          name="correo"
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          defaultValue={estado.correo}
          required
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11"
        />
      </div>

      {estado.error && (
        <p role="alert" className="text-destructive text-sm">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={enviando} className="h-11 text-base">
        {enviando ? "Entrando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
