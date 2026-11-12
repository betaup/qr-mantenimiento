# Mantenimiento QR

Historial de mantenimiento de equipos, consultable al escanear su código QR.
Proyecto Integrador Académico de Desarrollo de Software Seguro.

## Tecnologías

- Next.js 16 (React 19) y TypeScript
- Tailwind CSS y shadcn/ui
- Prisma 6 con SQLite
- Argon2id, Zod, `qrcode` y `pdfkit`

## Cómo levantarlo

1. Instala las dependencias: `npm install`
2. Copia `.env.example` como `.env` y define `SEED_PASSWORD`.
3. Crea la base de datos: `npx prisma migrate dev`
4. Carga los datos de prueba: `npx prisma db seed`
5. Inicia la aplicación: `npm run dev` y abre http://localhost:3000

El seed crea dos empresas ficticias, cada una con un admin y dos técnicos.
Todas las cuentas usan la contraseña definida en `SEED_PASSWORD`.

## Estructura

- `app/`: páginas y rutas de la API.
- `components/ui/`: componentes de shadcn/ui.
- `lib/`: conexión a la base de datos y valores del dominio.
- `prisma/`: modelo de datos, migraciones y datos de prueba.

Los servicios y la bitácora son inmutables: la base de datos tiene triggers
que rechazan cualquier `UPDATE` o `DELETE` sobre esas tablas.
