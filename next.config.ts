import type { NextConfig } from "next";

const cabecerasDeSeguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  // La dirección de un QR lleva su token: no debe viajar como referencia.
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Solo tiene efecto cuando la aplicación se sirve por HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

// Sin Cache Components: toda página con sesión se genera en cada petición y
// nunca se guarda en caché, así una sesión revocada deja de servir al instante.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // pdfkit lee sus tipografías del disco y no debe empaquetarse.
  serverExternalPackages: ["pdfkit"],
  experimental: {
    // Tamaño máximo del cuerpo de un formulario (RS-22).
    serverActions: { bodySizeLimit: "100kb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: cabecerasDeSeguridad }];
  },
};

export default nextConfig;
