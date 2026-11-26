# 6. Identificación y clasificación de vulnerabilidades

Aquí reunimos todo lo que encontramos en el análisis del código, en la revisión de librerías y en las pruebas dinámicas, y lo clasificamos con el mismo criterio para decidir qué corregir primero.

## Cómo los clasificamos

A cada hallazgo le anotamos su causa, su impacto y la evidencia que lo respalda. Después lo clasificamos con tres referencias:

- **CWE**, el catálogo de tipos de errores de software, para decir qué clase de error es.
- **OWASP Top 10 de 2021**, la lista de los riesgos más comunes en aplicaciones web.
- **STRIDE**, la misma clasificación de amenazas que usamos en el primer entregable.

El nivel de riesgo sale de combinar qué tan probable es que alguien lo aproveche con el daño que haría en nuestro sistema, igual que en el primer entregable.

| Probabilidad | Impacto bajo | Impacto medio | Impacto alto |
| --- | --- | --- | --- |
| Alta | Medio | Alto | Alto |
| Media | Bajo | Medio | Alto |
| Baja | Bajo | Bajo | Medio |

Algo que aprendimos al clasificar es que la severidad que publica cada aviso no siempre es el riesgo real para nosotros. Por ejemplo, la vulnerabilidad crítica de tinypool solo se ejecuta durante las pruebas y nunca llega al sistema que usan las empresas, así que en nuestro caso el riesgo es medio.

## Registro

| ID | Vulnerabilidad | Clasificación | Riesgo | Estado |
| --- | --- | --- | --- | --- |
| V-01 | La IP del cliente se toma de una cabecera que el cliente puede inventar | CWE-348, A07 | Alto | Abierto |
| V-02 | El servidor permite quitar asignaciones de días pasados | CWE-602, A01 | Bajo | Abierto |
| V-03 | tinypool vulnerable a contaminación de prototipos | CWE-1321, A06 | Medio | Abierto |
| V-04 | Denegación de servicio en las dependencias de Prisma | CWE-674 y CWE-1333, A06 | Bajo | Abierto |
| V-05 | vitest permite leer archivos e inyectar código en su servidor de pruebas | CWE-22 y CWE-94, A06 | Bajo | Abierto |
| V-06 | minimatch vulnerable a denegación de servicio | CWE-405, A06 | Bajo | Abierto |
| V-07 | Una herramienta de desarrollo quedó como librería de producción | CWE-1104, A05 | Bajo | Abierto |
| V-08 | Un formulario demasiado grande responde con error 500 en lugar de 413 | CWE-755, A05 | Informativo | Aceptado |
| V-09 | Cualquiera que conozca un correo puede bloquear esa cuenta 15 minutos | CWE-645, A07 | Bajo | Aceptado |

La ficha completa de cada una, con su causa, impacto y evidencia, está en el archivo registro.json de esta carpeta.

## Lo más importante

**V-01** es el único hallazgo de riesgo alto. Además de permitir que un atacante esquive el límite de intentos de inicio de sesión, le deja decidir qué dirección IP queda guardada en la bitácora, y eso le quita valor como evidencia.

Las vulnerabilidades de librerías, de V-03 a V-07, son las más numerosas, pero casi todas están en herramientas que solo usamos al desarrollar.

## Qué vamos a hacer

Corregiremos primero V-01, después las librerías actualizando sus versiones y por último V-02.

Aceptamos dos hallazgos. En V-08 el formulario grande ya se rechaza y la respuesta no revela nada, así que cambiar el código de error no mejora la seguridad. En V-09 el bloqueo de la cuenta es justamente lo que nos protege de que alguien adivine contraseñas, y quitarlo sería peor que el problema.

## Archivos de esta carpeta

- **registro.json**: la ficha completa de cada vulnerabilidad.
