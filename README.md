<div align="center">

# Mantenimiento QR

Historial de mantenimiento de equipos de clima y refrigeración, consultable al escanear el código QR pegado en cada equipo.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

Proyecto Integrador Académico de **Desarrollo de Software Seguro**, FCFM UANL.

![Panel del administrador](docs/capturas/asignaciones.png)

</div>

## De qué trata

En muchas empresas de servicio técnico el historial de cada equipo vive en reportes de papel que se pierden y no se pueden consultar en campo. Este sistema lo centraliza: cada equipo tiene un código QR y, al escanearlo, el técnico ve su historial y registra el trabajo que hizo.

El proyecto es pequeño a propósito. Lo importante no es la cantidad de funciones, sino que cada decisión de seguridad esté justificada y se pueda demostrar.

## Qué hace

- **Dos roles.** El administrador gestiona técnicos, equipos y asignaciones; el técnico atiende los equipos que tiene asignados ese día.
- **Varias empresas aisladas.** Nadie puede ver ni tocar los datos de otra empresa.
- **Escaneo de QR.** Cada etiqueta lleva un token aleatorio que el administrador puede regenerar si se pierde.
- **Historial que no se borra.** Corregir o anular un servicio crea un registro nuevo; el original siempre se conserva.
- **Bitácora de auditoría** de accesos, cambios y escaneos.
- **Reporte en PDF** del historial de cada equipo.

## Seguridad

| Mecanismo | Qué protege |
| --- | --- |
| Contraseñas con Argon2id y límite de intentos | Ataques de fuerza bruta |
| Sesiones en la base de datos, revocables al instante | Sesiones robadas o técnicos dados de baja |
| Una sola capa de datos que filtra por empresa | Acceso a datos de otra empresa |
| Triggers que bloquean cambios en servicios y bitácora | Alteración del historial |
| Validación con Zod, política CSP y PDF en texto plano | Inyección y XSS |
| Errores genéricos y cabeceras de seguridad | Fuga de información interna |

## Capturas

| Equipos | Etiqueta QR |
| --- | --- |
| ![Equipos](docs/capturas/equipos.png) | ![Etiqueta QR](docs/capturas/etiqueta-qr.png) |
| **Técnicos** | **Bitácora** |
| ![Técnicos](docs/capturas/tecnicos.png) | ![Bitácora](docs/capturas/bitacora.png) |

| Inicio de sesión | Vista del técnico en el celular |
| --- | --- |
| ![Inicio de sesión](docs/capturas/inicio-de-sesion.png) | <img src="docs/capturas/tecnico-celular.png" alt="Vista del técnico" width="280"> |

## Cómo correrlo

Necesitas Node.js 20 o superior.

```bash
npm install
cp .env.example .env        # define SEED_PASSWORD y APP_URL
npx prisma migrate dev      # crea la base de datos
npx prisma db seed          # carga dos empresas de prueba
npm run dev                 # http://localhost:3000
```

El seed crea dos empresas ficticias, cada una con un administrador y dos técnicos. Todas las cuentas usan la contraseña que pongas en `SEED_PASSWORD`.

### Cuentas de prueba

| Empresa | Rol | Correo |
| --- | --- | --- |
| Clima Norte | Administrador | `laura@climanorte.test` |
| Clima Norte | Técnico | `miguel@climanorte.test` |
| Clima Norte | Técnico | `sofia@climanorte.test` |
| Frío Regio | Administrador | `carlos@frioregio.test` |
| Frío Regio | Técnico | `ana@frioregio.test` |
| Frío Regio | Técnico | `jorge@frioregio.test` |

Para probar rápido, entra como Laura para ver el panel del administrador y como Miguel para ver la vista del técnico. Los equipos del técnico dependen de las asignaciones del día, así que si no ve ninguno, asígnaselos primero desde el panel de Laura.

Para las pruebas y la revisión de código:

```bash
npm test
npm run lint
```

## Equipo

| Integrante | Rol |
| --- | --- |
| Cesar Oziel Guajardo Rodríguez | Coordinación y documentación |
| Johan Joel Rodríguez Medina | Backend y autenticación |
| Brandon Jahir Reyna Marroquín | Frontend, QR y PDF |
| Diego Ángel Torres Azua | Verificación y seguridad |
