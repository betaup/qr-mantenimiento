"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { ROLES } from "@/lib/dominio";
import { registrar } from "@/lib/bitacora";
import { ipDeLaPeticion } from "@/lib/peticion";
import { rutaDeInicio } from "@/lib/auth/guardas";
import { verificarPassword } from "@/lib/auth/password";
import { LONGITUD_MAXIMA } from "@/lib/auth/reglas";
import { crearSesion } from "@/lib/auth/sesion";
import {
  limpiarFallosDeCuenta,
  loginBloqueado,
  registrarFalloDeLogin,
} from "@/lib/auth/limite";

// Se devuelve el correo para no obligar a escribirlo otra vez; la contraseña nunca.
export type EstadoLogin = { error?: string; correo?: string };

// El mismo mensaje si falla el correo o la contraseña (RS-03).
const CREDENCIALES = "Correo o contraseña incorrectos.";
const DEMASIADOS =
  "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";

const esquema = z.object({
  correo: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(1).max(LONGITUD_MAXIMA),
});

export async function iniciarSesion(
  _previo: EstadoLogin,
  formulario: FormData,
): Promise<EstadoLogin> {
  const datos = esquema.safeParse({
    correo: formulario.get("correo"),
    password: formulario.get("password"),
  });
  if (!datos.success) {
    const escrito = formulario.get("correo");
    return {
      error: CREDENCIALES,
      correo: typeof escrito === "string" ? escrito.slice(0, 254) : undefined,
    };
  }

  const { correo, password } = datos.data;
  const ip = await ipDeLaPeticion();

  if (await loginBloqueado(correo, ip)) {
    await registrar({
      accion: "LOGIN",
      resultado: "DENEGADO",
      detalle: "Límite de intentos alcanzado",
    });
    return { error: DEMASIADOS, correo };
  }

  const usuario = await db.usuario.findUnique({ where: { correo } });
  const rol = ROLES.find((r) => r === usuario?.rol);
  const passwordCorrecta = await verificarPassword(
    usuario?.passwordHash,
    password,
  );

  if (!usuario || !rol || !usuario.activo || !passwordCorrecta) {
    await registrarFalloDeLogin(correo, ip);
    await registrar({
      accion: "LOGIN",
      resultado: "FALLO",
      usuarioId: usuario?.id,
      empresaId: usuario?.empresaId,
    });
    return { error: CREDENCIALES, correo };
  }

  await limpiarFallosDeCuenta(correo);
  await crearSesion({ id: usuario.id, rol });
  await registrar({
    accion: "LOGIN",
    resultado: "EXITO",
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
  });

  redirect(rutaDeInicio(rol));
}
