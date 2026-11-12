import "server-only";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Límite de intentos fallidos de inicio de sesión (RS-02).
// Vive en memoria: suficiente para una sola instancia local, y se reinicia
// al reiniciar el servidor.
const VENTANA_SEGUNDOS = 15 * 60;
const FALLOS_POR_CUENTA = 5;
const FALLOS_POR_IP = 20;

const global = globalThis as unknown as {
  limites?: { cuenta: RateLimiterMemory; ip: RateLimiterMemory };
};

const limites = (global.limites ??= {
  cuenta: new RateLimiterMemory({ points: FALLOS_POR_CUENTA, duration: VENTANA_SEGUNDOS }),
  ip: new RateLimiterMemory({ points: FALLOS_POR_IP, duration: VENTANA_SEGUNDOS }),
});

async function agotado(limite: RateLimiterMemory, clave: string) {
  const estado = await limite.get(clave);
  return estado !== null && estado.remainingPoints <= 0;
}

export async function loginBloqueado(correo: string, ip: string) {
  return (await agotado(limites.cuenta, correo)) || (await agotado(limites.ip, ip));
}

export async function registrarFalloDeLogin(correo: string, ip: string) {
  // consume() rechaza al pasar el límite; aquí solo interesa contar.
  await Promise.allSettled([limites.cuenta.consume(correo), limites.ip.consume(ip)]);
}

export async function limpiarFallosDeCuenta(correo: string) {
  await limites.cuenta.delete(correo);
}
