import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Reglas de seguridad: patrones peligrosos como eval, expresiones
  // regulares vulnerables o accesos dinámicos a objetos y archivos.
  security.configs.recommended,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "lib/generated/**",
    "components/ui/**",
  ]),
]);

export default eslintConfig;
