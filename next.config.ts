import type { NextConfig } from "next";

// Sin Cache Components: toda página con sesión se genera en cada petición y
// nunca se guarda en caché, así una sesión revocada deja de servir al instante.
const nextConfig: NextConfig = {};

export default nextConfig;
