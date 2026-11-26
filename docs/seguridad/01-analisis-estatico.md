# Parte 1. Análisis estático y de dependencias

Fecha de ejecución: 25 de noviembre de 2026. Las salidas completas de cada herramienta están en la carpeta `evidencias/`.

## Herramientas

| Herramienta | Versión | Qué revisa |
| --- | --- | --- |
| ESLint con `eslint-plugin-security` | ESLint 9.39.5, plugin 3 | Patrones de código peligrosos: `eval`, expresiones regulares vulnerables, accesos dinámicos a objetos y archivos |
| ESLint de Next.js y TypeScript | 16.4.6 | Errores comunes de React, Next.js y tipos |
| TypeScript en modo estricto | 5.9 | Errores de tipos en todo el proyecto |
| `npm audit` | npm 11.19.0 | Vulnerabilidades conocidas en las dependencias |
| Revisión manual | | Lógica de autorización, manejo de sesiones y uso de cabeceras |

Comandos usados:

```bash
npx eslint . -f json -o docs/seguridad/evidencias/eslint-security-inicial.json
npx tsc --noEmit
npm audit --json > docs/seguridad/evidencias/npm-audit-inicial.json
npm audit --omit=dev
```

## Resultado del análisis de código

ESLint marcó **6 avisos**, todos de la regla `security/detect-object-injection`, y **ningún error**. TypeScript no reportó errores.

| Archivo | Línea | Código | Clasificación |
| --- | --- | --- | --- |
| `components/barra-lateral.tsx` | 63 | `SECCIONES[rol]` | Falso positivo |
| `components/barra-lateral.tsx` | 151 | `NOMBRE_DE_ROL[rol]` | Falso positivo |
| `components/campos-servicio.tsx` | 38 | `NOMBRE_DE_TIPO[valor]` | Falso positivo |
| `components/visual.tsx` | 40 | `TONOS[tono]` | Falso positivo |
| `components/visual.tsx` | 64 | `PUNTOS[tono]` | Falso positivo |
| `lib/auth/reglas.ts` | 32 | `PLAZOS[rol]` | Falso positivo |

La regla avisa cada vez que se lee un objeto con una clave variable, porque si la clave la controla un atacante podría leer propiedades como `__proto__`. En los seis casos la clave tiene un tipo cerrado (`Rol`, `TipoServicio` o el tono de un componente) y nunca viene directamente de una petición: el rol sale de la sesión y los tipos se validan antes con Zod. Por eso los clasificamos como falsos positivos y los marcamos en el código con un comentario que explica la razón, para que el análisis quede limpio y cualquier aviso nuevo se note.

## Resultado de la revisión de dependencias

`npm audit` reportó **17 paquetes vulnerables**: 2 críticos, 4 altos y 11 moderados. Al separar las dependencias de producción quedan 8 (4 altos y 4 moderados).

| Paquete | Versión instalada | Severidad | Aviso | Llega por | Alcance |
| --- | --- | --- | --- | --- | --- |
| tinypool | 1.1.1 | Crítica | GHSA-5gmw-xhrv-c9v3, GHSA-85c8-ppgw-ccpr | vitest 3.2.7 | Desarrollo |
| vitest, @vitest/mocker | 3.2.7 | Moderada | GHSA-82fw-gwwq-j7x9, GHSA-qxg6-89mg-rqv8 | Dependencia directa | Desarrollo |
| deepmerge-ts | 7.1.5 | Alta | GHSA-ggr8-5vv4-36mx | prisma 6.19.3 | Producción |
| effect | 3.21.0 | Alta | GHSA-7589-6fvf-x4pw | prisma 6.19.3 | Producción |
| prisma, @prisma/config | 6.19.3 | Alta | Por las dos anteriores | Dependencia directa | Producción |
| minimatch | rango 7 a 11.0.0 | Moderada | GHSA-g3hv-75wg-m249 | shadcn y typescript-eslint | Ambos |
| shadcn, ts-morph | 4.23.0 | Moderada | Por minimatch | Dependencia directa | Producción |
| typescript-eslint y sus módulos | | Moderada | Por minimatch | eslint-config-next | Desarrollo |

Observaciones:

- Las dos críticas están en `tinypool`, que solo usa el ejecutor de pruebas. No llegan a la aplicación en producción, pero sí al equipo de quien corre las pruebas y al servidor de integración continua.
- `prisma` aparece como dependencia de producción porque `@prisma/client` la pide como dependencia par. Las dos vulnerabilidades altas están en su configuración del CLI, no en el cliente que corre dentro de la aplicación.
- `shadcn` es una herramienta de línea de comandos que solo se usa para agregar componentes, pero quedó instalada como dependencia de producción. No debería estar ahí.

## Hallazgos de la revisión manual

| ID | Hallazgo | Archivo | Severidad estimada |
| --- | --- | --- | --- |
| H-01 | La IP del cliente se toma de la cabecera `X-Forwarded-For` sin comprobar que venga de un proxy de confianza. Un atacante puede enviar una IP falsa en cada intento y así esquivar el límite de intentos por IP, además de dejar IPs falsas en la bitácora. | `lib/peticion.ts` | Media |
| H-02 | `quitarAsignacion` no revisa la fecha. La pantalla solo permite quitar asignaciones de hoy en adelante, pero una petición hecha a mano puede borrar asignaciones de días pasados y alterar lo que muestra el historial de asignaciones. | `lib/datos/asignaciones.ts` | Baja |
| H-03 | La herramienta `shadcn` está en las dependencias de producción, lo que suma superficie de ataque y vulnerabilidades sin ninguna necesidad. | `package.json` | Baja |
| H-04 | Hay 17 dependencias con vulnerabilidades conocidas, 2 de ellas críticas. | `package.json` | Alta |

Estos hallazgos pasan al registro de vulnerabilidades (Parte 3), donde se clasifican con más detalle, y se corrigen en la Parte 4. Antes de corregirlos se confirmarán con pruebas dinámicas en la Parte 2.

## Lo que falta

En la Parte 5 se agregarán al flujo de integración continua dos analizadores más completos que no conviene instalar en cada computadora: CodeQL, que analiza el flujo de datos del código, y gitleaks, que busca secretos en el historial del repositorio.
