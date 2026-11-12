import { describe, expect, it } from "vitest";
import {
  PLAZOS,
  hashDeToken,
  nuevoToken,
  sesionVigente,
  validarPassword,
} from "./reglas";

const MINUTO = 60_000;
const HORA = 60 * MINUTO;

describe("tokens de sesión", () => {
  it("son largos y no se repiten", () => {
    const a = nuevoToken();
    const b = nuevoToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(43); // 32 bytes en base64url
  });

  it("se guardan como hash, distinto del token", () => {
    const token = nuevoToken();
    expect(hashDeToken(token)).not.toContain(token);
    expect(hashDeToken(token)).toBe(hashDeToken(token));
    expect(hashDeToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("expiración de la sesión (RS-04)", () => {
  const ahora = new Date("2026-11-11T12:00:00Z");
  const hace = (ms: number) => new Date(ahora.getTime() - ms);
  const dentroDe = (ms: number) => new Date(ahora.getTime() + ms);

  it("sigue vigente con uso reciente", () => {
    const sesion = { ultimoUsoEn: hace(5 * MINUTO), expiraEn: dentroDe(HORA) };
    expect(sesionVigente(sesion, "ADMIN", ahora)).toBe(true);
  });

  it("expira por inactividad antes para el admin que para el técnico", () => {
    const sesion = { ultimoUsoEn: hace(31 * MINUTO), expiraEn: dentroDe(HORA) };
    expect(sesionVigente(sesion, "ADMIN", ahora)).toBe(false);
    expect(sesionVigente(sesion, "TECNICO", ahora)).toBe(true);
  });

  it("el técnico expira tras 8 horas sin uso", () => {
    const sesion = { ultimoUsoEn: hace(8 * HORA), expiraEn: dentroDe(HORA) };
    expect(sesionVigente(sesion, "TECNICO", ahora)).toBe(false);
  });

  it("expira de forma absoluta aunque se siga usando", () => {
    const sesion = { ultimoUsoEn: hace(MINUTO), expiraEn: hace(1) };
    expect(sesionVigente(sesion, "ADMIN", ahora)).toBe(false);
    expect(sesionVigente(sesion, "TECNICO", ahora)).toBe(false);
  });

  it("los plazos del admin son más cortos", () => {
    expect(PLAZOS.ADMIN.inactividad).toBeLessThan(PLAZOS.TECNICO.inactividad);
    expect(PLAZOS.ADMIN.absoluto).toBeLessThan(PLAZOS.TECNICO.absoluto);
  });
});

describe("política de contraseñas", () => {
  it("rechaza las cortas", () => {
    expect(validarPassword("corta")).not.toBeNull();
  });

  it("rechaza las comunes sin importar mayúsculas", () => {
    expect(validarPassword("Password1234")).not.toBeNull();
  });

  it("rechaza las demasiado largas", () => {
    expect(validarPassword("a".repeat(201))).not.toBeNull();
  });

  it("acepta una larga y poco común", () => {
    expect(validarPassword("tornillo-azul-compresor-42")).toBeNull();
  });
});
