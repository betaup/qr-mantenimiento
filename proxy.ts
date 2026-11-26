import { NextResponse, type NextRequest } from "next/server";

// Politica de seguridad de contenido (RS-11). Cada respuesta lleva un nonce
// nuevo: solo se ejecutan los scripts que Next.js marca con el, asi que un
// script inyectado en un campo de texto no corre aunque llegara a la pagina.
export function proxy(peticion: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const desarrollo = process.env.NODE_ENV === "development";

  const politica = [
    "default-src 'self'",
    // En desarrollo React necesita eval para sus herramientas de depuracion.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${desarrollo ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' ${desarrollo ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "img-src 'self' data:", // el QR se dibuja como data URL
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const cabeceras = new Headers(peticion.headers);
  cabeceras.set("x-nonce", nonce);
  cabeceras.set("Content-Security-Policy", politica);

  const respuesta = NextResponse.next({ request: { headers: cabeceras } });
  respuesta.headers.set("Content-Security-Policy", politica);
  return respuesta;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
