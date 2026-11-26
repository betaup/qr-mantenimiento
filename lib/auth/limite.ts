import "server-only";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Limite de intentos fallidos de inicio de sesion (RS-02).
// Vive en memoria: suficiente para una sola instancia local, y se reinicia
// al reiniciar el servidor.
const VENTANA_SEGUNDOS = 15 * 60;
const FALLOS_POR_CUENTA = 5;
const FALLOS_POR_IP = 20;

const ESCANEOS_DENEGADOS = 20;
const PDF_POR_USUARIO = 10;
const VENTANA_PDF_SEGUNDOS = 10 * 60;

type Limites = {
  cuenta: RateLimiterMemory;
  ip: RateLimiterMemory;
  escaneo: RateLimiterMemory;
  pdf: RateLimiterMemory;
};

const global = globalThis as unknown as { limites?: Limites };

const limites = (global.limites ??= {
  cuenta: new RateLimiterMemory({ points: FALLOS_POR_CUENTA, duration: VENTANA_SEGUNDOS }),
  ip: new RateLimiterMemory({ points: FALLOS_POR_IP, duration: VENTANA_SEGUNDOS }),
  escaneo: new RateLimiterMemory({ points: ESCANEOS_DENEGADOS, duration: VENTANA_SEGUNDOS }),
  pdf: new RateLimiterMemory({ points: PDF_POR_USUARIO, duration: VENTANA_PDF_SEGUNDOS }),
});

async function agotado(limite: RateLimiterMemory, clave: string) {
  const estado = await limite.get(clave);
  return estado !== null && estado.remainingPoints <= 0;
}

export async function loginBloqueado(correo: string, ip: string) {
  return (await agotado(limites.cuenta, correo)) || (await agotado(limites.ip, ip));
}

export async function registrarFalloDeLogin(correo: string, ip: string) {
  // consume() rechaza al pasar el limite; aqui solo interesa contar.
  await Promise.allSettled([limites.cuenta.consume(correo), limites.ip.consume(ip)]);
}

export async function limpiarFallosDeCuenta(correo: string) {
  await limites.cuenta.delete(correo);
}

// Escaneos de QR denegados por usuario: frena a quien prueba tokens (T1).
export function escaneoBloqueado(usuarioId: string) {
  return agotado(limites.escaneo, usuarioId);
}

export async function registrarEscaneoDenegado(usuarioId: string) {
  await Promise.allSettled([limites.escaneo.consume(usuarioId)]);
}

/** Tope de reportes PDF por usuario: generar uno cuesta CPU (RS-22, T9). */
export async function pdfPermitido(usuarioId: string): Promise<boolean> {
  try {
    await limites.pdf.consume(usuarioId);
    return true;
  } catch {
    return false;
  }
}
