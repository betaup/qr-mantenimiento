# 8. Verificación de requisitos y mitigación de amenazas

Aquí revisamos uno por uno los 23 requisitos de seguridad del primer entregable y las 11 amenazas, y anotamos con qué evidencia lo comprobamos. Las pruebas P-01 a P-38 están en la carpeta 05.

## Requisitos

| ID | Requisito | Cómo lo verificamos | Estado |
| --- | --- | --- | --- |
| RS-01 | Contraseñas solo como hash Argon2id | Consulta a la base, carpeta 10 | Cumple |
| RS-02 | Límite de intentos por cuenta y por IP | P-37 y P-38 | Cumple |
| RS-03 | Mismo mensaje si falla el correo o la contraseña | P-36 | Cumple |
| RS-04 | Sesión en el servidor, cookie protegida y expiración | P-01, P-02 y pruebas unitarias | Cumple |
| RS-05 | Sesión invalidada al salir, al desactivar y al cambiar contraseña | P-34, P-35 y revisión del código | Cumple |
| RS-06 | Empresa y usuario tomados de la sesión | P-08 a P-11, P-15 y P-16 | Cumple |
| RS-07 | El técnico solo accede a sus equipos del día | P-12 a P-14 | Cumple |
| RS-08 | Negar por defecto y misma respuesta para inexistente y prohibido | P-03 a P-13 y P-32 | Cumple |
| RS-09 | CSRF y reautenticación en acciones sensibles | Revisión del código | Cumple |
| RS-10 | Validación con esquema y consultas parametrizadas | P-25 a P-29 y análisis estático | Cumple |
| RS-11 | Salida escapada, CSP y contenido nunca como HTML | P-18, P-19 y cabeceras de la carpeta 03 | Cumple |
| RS-12 | PDF con plantilla fija y texto plano | P-30 y revisión del código | Cumple |
| RS-13 | Servicios sin edición ni borrado | P-21, P-22 y revisión del código | Cumple |
| RS-14 | Disparadores contra cambios en servicios y bitácora | P-21 a P-24 | Cumple |
| RS-15 | Confirmación del equipo registrada en la bitácora | P-20 | Cumple |
| RS-16 | Token de QR aleatorio, largo y regenerable | P-32, P-33 y carpeta 10 | Cumple |
| RS-17 | Registro de eventos de seguridad | Consulta a la bitácora, carpeta 07 | Cumple |
| RS-18 | Bitácora de solo registros nuevos | P-23 y P-24 | Cumple |
| RS-19 | Errores genéricos sin trazas | P-25 a P-29 | Cumple |
| RS-20 | Sin datos sensibles en registros, bitácora y PDF | Revisión del código y de la bitácora | Cumple |
| RS-21 | Secretos fuera del repositorio y uso de HTTPS | gitleaks en el CI y cabecera HSTS | Parcial |
| RS-22 | Límite de peticiones, tamaño de formulario y tope de reportes | P-30, P-31 y P-33 | Cumple |
| RS-23 | Revisión de dependencias | npm audit en el CI y Dependabot | Cumple |

RS-21 queda parcial porque HTTPS depende de dónde se publique el sistema. La aplicación ya lo exige con la cabecera HSTS y la cookie segura, pero nosotros solo la corrimos de forma local.

## Amenazas

| Amenaza | Pruebas | Resultado | Estado |
| --- | --- | --- | --- |
| T1 Enumeración de QR | P-32, P-33 | Las respuestas no delatan si un token existe | Mitigada |
| T2 Acceso entre empresas | P-03 a P-17 | Encontramos V-02 y ya está corregida | Mitigada |
| T3 Fuerza bruta | P-36 a P-38 | Encontramos V-01 y ya está corregida. V-09 aceptada | Mitigada |
| T4 Sesión robada o baja | P-01, P-02, P-34, P-35 | Sesiones revocadas al momento | Mitigada |
| T5 Inyección y XSS | P-18, P-19, P-25 a P-28 | El código malicioso se mostró como texto | Mitigada |
| T6 QR cambiado | P-20 | Depende de que el técnico revise la placa | Parcial |
| T7 Alteración o repudio | P-21 a P-24 | La base rechaza cualquier cambio | Mitigada |
| T8 Fuga por errores y PDF | P-25 a P-29 | Ningún error mostró detalles internos | Mitigada |
| T9 Saturación | P-30, P-31 | Los límites funcionan. V-08 aceptada | Mitigada |
| T10 Dependencia vulnerable | npm audit | De 17 vulnerabilidades a 0 | Mitigada |
| T11 Filtración de secretos | gitleaks | Sin secretos en el historial | Mitigada |

T6 queda parcial desde el diseño: el sistema obliga a confirmar el equipo, pero si alguien pega un QR de otro equipo y el técnico confirma sin revisar, el sistema no lo puede detectar.
