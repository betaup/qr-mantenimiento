import { randomBytes } from "node:crypto";
import QRCode from "qrcode";

/**
 * Token del QR: 256 bits de un generador criptografico, sin relacion con el
 * id interno del equipo (RS-16).
 */
export function nuevoQrToken(): string {
  return randomBytes(32).toString("base64url");
}

/** La direccion base sale de la configuracion, nunca de la cabecera Host. */
export function urlDelQr(token: string): string {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/e/${token}`;
}

export function imagenDelQr(token: string): Promise<string> {
  return QRCode.toDataURL(urlDelQr(token), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}
