// Pruebas dinamicas de seguridad contra una instancia local del sistema.
//
// Uso:
//   ./scripts/preparar-pruebas.sh
//   npm run build && DATABASE_URL=file:./pruebas.db npx next start -p 3100
//   node --env-file=.env scripts/pruebas-seguridad.mjs
//
// Cada prueba ataca una amenaza del modelo (T1 a T11) o un hallazgo del analisis
// estatico (H-01, H-02) y compara lo que paso con lo que deberia pasar. Al final
// guarda los resultados en docs/entregable-2/evidencias/05-pruebas-dinamicas.

import puppeteer from "puppeteer-core";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const BASE = process.env.BASE ?? "http://localhost:3100";
const PASSWORD = process.env.SEED_PASSWORD;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const db = new DatabaseSync("prisma/pruebas.db");

if (!PASSWORD) throw new Error("Falta SEED_PASSWORD: ejecuta con node --env-file=.env");

// Registro de resultados
const resultados = [];
function registrar(id, amenaza, prueba, esperado, obtenido, pasa) {
  resultados.push({ id, amenaza, prueba, esperado, obtenido, resultado: pasa ? "PASA" : "FALLA" });
  console.log(`${pasa ? "✓ PASA " : "✖ FALLA"}  ${id}  ${prueba}`);
  console.log(`         esperado: ${esperado}`);
  console.log(`         obtenido: ${obtenido}`);
}
const seccion = (titulo) => console.log(`\n── ${titulo} ${"─".repeat(Math.max(0, 70 - titulo.length))}`);

// Utilidades de base de datos
const uno = (sql, ...p) => db.prepare(sql).get(...p);
const idDe = (tabla, campo, valor) => uno(`select id from ${tabla} where ${campo} = ?`, valor).id;
const cuenta = (sql, ...p) => Object.values(uno(sql, ...p))[0];

// Peticiones HTTP con una sesion
async function pedir(ruta, { sesion, metodo = "GET", cabeceras = {}, cuerpo } = {}) {
  const r = await fetch(BASE + ruta, {
    method: metodo,
    redirect: "manual",
    headers: { ...(sesion ? { cookie: `sesion=${sesion}` } : {}), ...cabeceras },
    body: cuerpo,
  });
  const texto = await r.text();
  return { estado: r.status, destino: r.headers.get("location"), cabeceras: r.headers, texto };
}

// Navegador: inicio de sesion real y captura de acciones del servidor
const navegador = await puppeteer.launch({ executablePath: CHROME, headless: true });

async function iniciarSesion(correo) {
  const contexto = await navegador.createBrowserContext();
  const pagina = await contexto.newPage();
  let setCookie = "";
  pagina.on("response", (r) => {
    const h = r.headers()["set-cookie"];
    if (h && h.includes("sesion=")) setCookie = h;
  });
  await pagina.goto(BASE + "/login", { waitUntil: "networkidle0" });
  await pagina.type("#correo", correo);
  await pagina.type("#password", PASSWORD);
  await Promise.all([pagina.waitForNavigation({ waitUntil: "networkidle0" }), pagina.click("button[type=submit]")]);
  const cookie = (await contexto.cookies()).find((c) => c.name === "sesion");
  return { contexto, pagina, token: cookie?.value, setCookie };
}

// Hace que la pagina dispare una accion del servidor y captura la peticion sin
// dejar que llegue: asi se puede repetir despues con datos cambiados, como haria
// un atacante con las herramientas de desarrollo del navegador.
async function capturarAccion(pagina, disparar) {
  await pagina.setRequestInterception(true);
  const capturada = new Promise((resolver) => {
    const manejar = (r) => {
      if (r.method() === "POST" && r.headers()["next-action"]) {
        pagina.off("request", manejar);
        resolver({ url: r.url(), cabeceras: r.headers(), cuerpo: r.postData() });
        r.abort();
      } else r.continue();
    };
    pagina.on("request", manejar);
  });
  await disparar();
  const accion = await capturada;
  await pagina.setRequestInterception(false);
  return accion;
}

// Cambia el valor de un campo dentro del cuerpo multipart de una accion.
function cambiarCampo(cuerpo, campo, valor) {
  // eslint-disable-next-line security/detect-non-literal-regexp -- el nombre del campo lo escribe este mismo script
  const patron = new RegExp(`(name="(?:_?\\d+_)?${campo}"\\r\\n\\r\\n)[^\\r]*`);
  if (!patron.test(cuerpo)) throw new Error(`El campo ${campo} no está en la petición`);
  return cuerpo.replace(patron, `$1${valor}`);
}

async function repetirAccion(accion, { sesion, cuerpo = accion.cuerpo, cabecerasExtra = {} } = {}) {
  const cabeceras = { ...accion.cabeceras, ...cabecerasExtra };
  delete cabeceras["content-length"];
  delete cabeceras.cookie;
  const t0 = performance.now();
  const r = await pedir(new URL(accion.url).pathname + new URL(accion.url).search, {
    sesion, metodo: "POST", cabeceras, cuerpo,
  });
  return { ...r, ms: performance.now() - t0 };
}

// Datos de prueba
const eqA = idDe("Equipo", "serie", "CN-MS-0001"); // asignado a Miguel hoy
const eqANoAsignado = idDe("Equipo", "serie", "CN-CH-0003");
const eqB = idDe("Equipo", "serie", "FR-MS-0002"); // de la otra empresa
const tokenA = uno("select qrToken from Equipo where id = ?", eqA).qrToken;
const tecA = idDe("Usuario", "correo", "sofia@climanorte.test");
const tecB = idDe("Usuario", "correo", "ana@frioregio.test");

seccion("Sesiones y cookies (T4)");
const laura = await iniciarSesion("laura@climanorte.test");
const miguel = await iniciarSesion("miguel@climanorte.test");
const sofia = await iniciarSesion("sofia@climanorte.test");
const carlos = await iniciarSesion("carlos@frioregio.test");
const ana = await iniciarSesion("ana@frioregio.test");
{
  const c = laura.setCookie.toLowerCase();
  const ok = c.includes("httponly") && c.includes("secure") && c.includes("samesite=lax") && laura.token.length >= 43;
  registrar("P-01", "T4", "La cookie de sesión lleva HttpOnly, Secure y SameSite",
    "HttpOnly, Secure, SameSite=Lax y token de 256 bits",
    `${["httponly", "secure", "samesite=lax"].filter((x) => c.includes(x)).join(", ")}; token de ${laura.token.length} caracteres`, ok);
  const enBase = cuenta("select count(*) from Sesion where tokenHash = ?", laura.token);
  registrar("P-02", "T4", "En la base solo se guarda el hash del token",
    "El token no aparece tal cual en la tabla Sesion", enBase === 0 ? "No aparece" : "Aparece en texto plano", enBase === 0);
}

seccion("Matriz de autorización (T2)");
const casos = [
  ["Sin sesión entra a /admin", undefined, "/admin", 307],
  ["Técnico entra al panel /admin", miguel.token, "/admin", 404],
  ["Técnico entra a /admin/equipos", miguel.token, "/admin/equipos", 404],
  ["Técnico entra a /admin/bitacora", miguel.token, "/admin/bitacora", 404],
  ["Admin entra a la vista del técnico", laura.token, "/tecnico", 404],
  ["Admin A abre un equipo de la empresa B", laura.token, `/admin/equipos/${eqB}`, 404],
  ["Admin A abre un técnico de la empresa B", laura.token, `/admin/tecnicos/${tecB}`, 404],
  ["Admin A abre el historial de un equipo de B", laura.token, `/equipos/${eqB}`, 404],
  ["Admin A descarga el PDF de un equipo de B", laura.token, `/equipos/${eqB}/reporte`, 404],
  ["Técnico abre un equipo que no tiene asignado", miguel.token, `/equipos/${eqANoAsignado}`, 404],
  ["Técnico B abre un equipo de la empresa A", ana.token, `/equipos/${eqA}`, 404],
  ["Técnico abre su equipo asignado (control)", miguel.token, `/equipos/${eqA}`, 200],
];
let n = 3;
for (const [nombre, sesion, ruta, esperado] of casos) {
  const r = await pedir(ruta, { sesion });
  registrar(`P-${String(n++).padStart(2, "0")}`, "T2", nombre, `HTTP ${esperado}`, `HTTP ${r.estado}`, r.estado === esperado);
}

seccion("Acciones del servidor manipuladas (T2 y H-02)");
await laura.pagina.goto(BASE + "/admin", { waitUntil: "networkidle0" });
const accionAsignar = await capturarAccion(laura.pagina, () =>
  laura.pagina.evaluate((tecnico) => {
    const fila = [...document.querySelectorAll("li")].find((li) => li.textContent.includes("Chiller principal"));
    const sel = fila.querySelector("select");
    sel.value = tecnico;
    fila.querySelector("form").requestSubmit();
  }, tecA));
{
  const antes = cuenta("select count(*) from Asignacion");
  const r = await repetirAccion(accionAsignar, { sesion: laura.token, cuerpo: cambiarCampo(accionAsignar.cuerpo, "tecnicoId", tecB) });
  const despues = cuenta("select count(*) from Asignacion");
  registrar(`P-${n++}`, "T2", "Admin A asigna un técnico de la empresa B alterando la petición",
    "Se rechaza y no se crea la asignación",
    `${r.texto.includes("no existe") ? "Rechazada" : "Aceptada"}; asignaciones ${antes} → ${despues}`,
    r.texto.includes("no existe") && antes === despues);
}
await laura.pagina.goto(BASE + "/admin", { waitUntil: "networkidle0" });
const accionQuitar = await capturarAccion(laura.pagina, () =>
  laura.pagina.evaluate(() => document.querySelector('button[aria-label^="Quitar"]').click()));
{
  const asigB = uno("select id from Asignacion where empresaId = (select empresaId from Equipo where id = ?)", eqB).id;
  await repetirAccion(accionQuitar, { sesion: laura.token, cuerpo: cambiarCampo(accionQuitar.cuerpo, "id", asigB) });
  const sigue = cuenta("select count(*) from Asignacion where id = ?", asigB);
  registrar(`P-${n++}`, "T2", "Admin A quita una asignación de la empresa B alterando la petición",
    "Se rechaza y la asignación sigue", `${sigue ? "La asignación sigue" : "Se borró"}`, sigue === 1);
}
{
  // H-02: una asignacion de un dia pasado, que la pantalla ya no deja quitar.
  const ayer = new Date(Date.now() - 30 * 3600_000).toISOString().slice(0, 10);
  const idPasada = "prueba-pasada-" + randomBytes(4).toString("hex");
  db.prepare("insert into Asignacion (id, empresaId, equipoId, tecnicoId, fecha, creadoEn) values (?, (select empresaId from Equipo where id = ?), ?, ?, ?, ?)")
    .run(idPasada, eqA, eqA, tecA, ayer, Date.now());
  await repetirAccion(accionQuitar, { sesion: laura.token, cuerpo: cambiarCampo(accionQuitar.cuerpo, "id", idPasada) });
  const sigue = cuenta("select count(*) from Asignacion where id = ?", idPasada);
  registrar(`P-${n++}`, "H-02", "Admin quita una asignación de un día pasado alterando la petición",
    "Se rechaza: el historial de asignaciones no cambia", sigue ? "La asignación sigue" : "La asignación se borró", sigue === 1);
}

seccion("Inyección y XSS (T5)");
const carga = `<img src=x onerror="window.__xss=1"><script>window.__xss=1</script>' OR 1=1 --`;
{
  await miguel.pagina.goto(`${BASE}/equipos/${eqA}`, { waitUntil: "networkidle0" });
  await miguel.pagina.evaluate((texto) => {
    const form = document.querySelector("[name=confirmado]").form;
    form.querySelector("[name=tipo][value=MANTENIMIENTO]").checked = true;
    const area = form.querySelector("[name=descripcion]");
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(area, texto);
    area.dispatchEvent(new Event("input", { bubbles: true }));
    form.querySelector("[name=confirmado]").checked = true;
    form.requestSubmit();
  }, carga);
  await miguel.pagina.waitForSelector("[role=status]", { timeout: 10_000 });
  const guardado = cuenta("select count(*) from Servicio where descripcion = ?", carga);

  const pagina = await laura.contexto.newPage();
  const respuesta = await pagina.goto(`${BASE}/equipos/${eqA}`, { waitUntil: "networkidle0" });
  const ejecutado = await pagina.evaluate(() => window.__xss === 1);
  const visible = await pagina.evaluate((t) => document.body.innerText.includes(t), carga);
  registrar(`P-${n++}`, "T5", "Código malicioso en la descripción de un servicio",
    "Se guarda como texto, se muestra como texto y no se ejecuta",
    `guardado: ${guardado === 1 ? "sí" : "no"}; visible como texto: ${visible ? "sí" : "no"}; ejecutado: ${ejecutado ? "sí" : "no"}`,
    guardado === 1 && visible && !ejecutado);

  const csp = respuesta.headers()["content-security-policy"] ?? "";
  const ok = csp.includes("nonce-") && csp.includes("'strict-dynamic'") && !/script-src[^;]*unsafe-inline/.test(csp);
  registrar(`P-${n++}`, "T5", "La página envía una política CSP con nonce",
    "script-src con nonce y sin unsafe-inline", ok ? "CSP con nonce, sin unsafe-inline" : `CSP: ${csp || "ausente"}`, ok);
  await pagina.close();
}

seccion("Confirmación del equipo (T6)");
{
  const antes = cuenta("select count(*) from Servicio");
  await miguel.pagina.goto(`${BASE}/equipos/${eqA}`, { waitUntil: "networkidle0" });
  const mensaje = await miguel.pagina.evaluate(async () => {
    const form = document.querySelector("[name=confirmado]").form;
    form.noValidate = true; // salta la validacion del navegador para llegar al servidor
    form.querySelector("[name=tipo][value=REPARACION]").checked = true;
    const area = form.querySelector("[name=descripcion]");
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(area, "Cambio de capacitor del compresor.");
    area.dispatchEvent(new Event("input", { bubbles: true }));
    form.requestSubmit();
    await new Promise((r) => setTimeout(r, 2500));
    return form.querySelector("[role=alert]")?.textContent ?? "sin mensaje";
  });
  const despues = cuenta("select count(*) from Servicio");
  registrar(`P-${n++}`, "T6", "Registrar un servicio sin confirmar la placa del equipo",
    "El servidor lo rechaza y no se guarda", `"${mensaje}"; servicios ${antes} → ${despues}`, antes === despues && mensaje.includes("Confirma"));
}

seccion("Inmutabilidad del historial (T7)");
for (const [nombre, sql] of [
  ["Modificar un servicio directo en la base", "update Servicio set descripcion = 'alterado'"],
  ["Borrar un servicio directo en la base", "delete from Servicio"],
  ["Modificar la bitácora directo en la base", "update Bitacora set accion = 'alterado'"],
  ["Borrar la bitácora directo en la base", "delete from Bitacora"],
]) {
  let error = "";
  try { db.exec(sql); } catch (e) { error = e.message; }
  registrar(`P-${n++}`, "T7", nombre, "La base de datos lo rechaza", error ? `Rechazado: ${error}` : "Se aplicó el cambio", Boolean(error));
}

seccion("Errores y fuga de información (T8)");
const filtra = (t) => /prisma|sqlite|at \/|node_modules|stack|Error:/i.test(t);
for (const ruta of [`/equipos/'%20OR%201=1--`, `/admin/equipos/..%2F..%2Fetc%2Fpasswd`, `/e/%3Cscript%3Ealert(1)%3C%2Fscript%3E`, `/equipos/${"A".repeat(5000)}`]) {
  const r = await pedir(ruta, { sesion: laura.token });
  registrar(`P-${n++}`, "T8", `Ruta malformada ${decodeURIComponent(ruta).slice(0, 40)}`,
    "Respuesta 404 genérica, sin detalles internos", `HTTP ${r.estado}; ${filtra(r.texto) ? "con detalles internos" : "sin detalles internos"}`,
    r.estado === 404 && !filtra(r.texto));
}
{
  const r = await repetirAccion(accionAsignar, { sesion: laura.token, cuerpo: "{esto no es un formulario" });
  registrar(`P-${n++}`, "T8", "Acción del servidor con un cuerpo malformado",
    "Error genérico, sin traza ni detalles internos", `HTTP ${r.estado}; ${filtra(r.texto) ? "con detalles internos" : "sin detalles internos"}`,
    r.estado >= 400 && !filtra(r.texto));
}

seccion("Saturación (T9)");
{
  const estados = [];
  for (let i = 0; i < 11; i++) estados.push((await pedir(`/equipos/${eqA}/reporte`, { sesion: laura.token })).estado);
  registrar(`P-${n++}`, "T9", "Pedir 11 reportes PDF seguidos", "Los primeros 10 se generan y el 11 responde 429",
    estados.join(" "), estados.slice(0, 10).every((e) => e === 200) && estados[10] === 429);
}
{
  const antes = cuenta("select count(*) from Asignacion");
  const relleno = "x".repeat(200 * 1024);
  const r = await repetirAccion(accionAsignar, { sesion: laura.token, cuerpo: cambiarCampo(accionAsignar.cuerpo, "fecha", relleno) });
  const despues = cuenta("select count(*) from Asignacion");
  registrar(`P-${n++}`, "T9", "Enviar un formulario de 200 kB", "Se rechaza por tamaño y no se procesa",
    `HTTP ${r.estado}; asignaciones ${antes} → ${despues}`, r.estado === 413 || (r.estado >= 400 && antes === despues));
}

seccion("Enumeración de códigos QR (T1)");
{
  const valido = await pedir(`/e/${tokenA}`);
  const falso = await pedir(`/e/${randomBytes(32).toString("base64url")}`);
  const igual = valido.estado === falso.estado && valido.destino?.split("siguiente=")[0] === falso.destino?.split("siguiente=")[0];
  registrar(`P-${n++}`, "T1", "Sin sesión: un QR real y uno inventado responden igual",
    "Ambos redirigen al inicio de sesión sin revelar nada", `real: HTTP ${valido.estado}; inventado: HTTP ${falso.estado}`, igual && valido.estado === 307);

  const estados = [];
  for (let i = 0; i < 20; i++) estados.push((await pedir(`/e/${randomBytes(32).toString("base64url")}`, { sesion: miguel.token })).estado);
  const despues = await pedir(`/e/${tokenA}`, { sesion: miguel.token });
  registrar(`P-${n++}`, "T1", "Con sesión: 20 códigos inventados y después uno real",
    "Los 20 responden 404 y luego el escaneo queda bloqueado", `20 × ${[...new Set(estados)].join("/")}; código real: HTTP ${despues.estado}`,
    estados.every((e) => e === 404) && despues.estado === 404);
}

seccion("Revocación de sesiones (T4)");
{
  const p = await laura.contexto.newPage();
  await p.goto(`${BASE}/admin/tecnicos/${tecA}`, { waitUntil: "networkidle0" });
  await p.type("#passwordAdmin-estado", PASSWORD);
  await p.evaluate(() => document.getElementById("passwordAdmin-estado").form.requestSubmit());
  await p.waitForSelector("[role=status]", { timeout: 10_000 });
  const r = await pedir("/tecnico", { sesion: sofia.token });
  registrar(`P-${n++}`, "T4", "El admin desactiva a un técnico que tiene la sesión abierta",
    "La siguiente petición del técnico lo manda al inicio de sesión", `HTTP ${r.estado} → ${r.destino ?? "sin redirección"}`,
    r.estado === 307 && r.destino?.includes("/login"));
  await p.close();
}
{
  const anterior = carlos.token;
  await carlos.pagina.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  await Promise.all([carlos.pagina.waitForNavigation({ waitUntil: "networkidle0" }),
    carlos.pagina.evaluate(() => [...document.querySelectorAll("button")].find((b) => /Cerrar sesión|Salir/.test(b.textContent)).click())]);
  const r = await pedir("/admin", { sesion: anterior });
  registrar(`P-${n++}`, "T4", "Reusar la cookie después de cerrar sesión",
    "La cookie ya no sirve", `HTTP ${r.estado} → ${r.destino ?? "sin redirección"}`, r.estado === 307 && r.destino?.includes("/login"));
}

seccion("Fuerza bruta en el inicio de sesión (T3 y H-01)");
const paginaLogin = await (await navegador.createBrowserContext()).newPage();
await paginaLogin.goto(BASE + "/login", { waitUntil: "networkidle0" });
const accionLogin = await capturarAccion(paginaLogin, async () => {
  await paginaLogin.type("#correo", "nadie@ejemplo.test");
  await paginaLogin.type("#password", "contrasena-falsa");
  await paginaLogin.evaluate(() => document.querySelector("#correo").form.requestSubmit());
});
const intentar = (correo, password, cabecerasExtra) =>
  repetirAccion(accionLogin, { cuerpo: cambiarCampo(cambiarCampo(accionLogin.cuerpo, "correo", correo), "password", password), cabecerasExtra });
const CREDENCIALES = "Correo o contraseña incorrectos";
const BLOQUEO = "Demasiados intentos";
{
  const existe = [], noExiste = [];
  for (let i = 0; i < 4; i++) {
    existe.push(await intentar("jorge@frioregio.test", "incorrecta-" + i));
    noExiste.push(await intentar(`nadie${i}@frioregio.test`, "incorrecta-" + i));
  }
  const mismos = [...existe, ...noExiste].every((r) => r.texto.includes(CREDENCIALES));
  const prom = (xs) => xs.reduce((a, r) => a + r.ms, 0) / xs.length;
  registrar(`P-${n++}`, "T3", "Correo existente y correo inexistente con contraseña incorrecta",
    "El mismo mensaje y un tiempo de respuesta parecido",
    `mismo mensaje: ${mismos ? "sí" : "no"}; existente ${prom(existe).toFixed(0)} ms, inexistente ${prom(noExiste).toFixed(0)} ms`,
    mismos && Math.abs(prom(existe) - prom(noExiste)) < Math.max(prom(existe), prom(noExiste)) * 0.5);

  await intentar("jorge@frioregio.test", "incorrecta-5");
  const correcta = await intentar("jorge@frioregio.test", PASSWORD);
  registrar(`P-${n++}`, "T3", "Quinto fallo en una cuenta y después la contraseña correcta",
    "La cuenta queda bloqueada aunque la contraseña sea correcta",
    correcta.texto.includes(BLOQUEO) ? "Bloqueada" : correcta.estado === 303 ? "Entró" : "Otro resultado", correcta.texto.includes(BLOQUEO));
}
{
  // H-01: intentos con correos distintos y una IP inventada en cada uno.
  const bloqueados = [];
  for (let i = 0; i < 25; i++) {
    const ip = `203.0.113.${i + 1}`;
    const r = await intentar(`rociado${i}@ejemplo.test`, "Password1234", { "x-forwarded-for": ip });
    bloqueados.push(r.texto.includes(BLOQUEO));
  }
  const ips = db.prepare("select distinct ip from Bitacora where accion = 'LOGIN' and ip like '203.0.113.%'").all().length;
  const total = bloqueados.filter(Boolean).length;
  registrar(`P-${n++}`, "H-01", "25 intentos con una IP falsa distinta en X-Forwarded-For",
    "El límite de 20 fallos por IP se aplica igual y la bitácora guarda la IP real",
    `intentos bloqueados: ${total} de 25; IPs falsas guardadas en la bitácora: ${ips}`, total > 0 && ips === 0);
}

await navegador.close();
const pasan = resultados.filter((r) => r.resultado === "PASA").length;
console.log(`\n${pasan} de ${resultados.length} pruebas pasan, ${resultados.length - pasan} fallan`);

const carpeta = "docs/entregable-2/evidencias/05-pruebas-dinamicas";
mkdirSync(carpeta, { recursive: true });
const fecha = new Date().toISOString().slice(0, 10);
const archivo = `${carpeta}/resultados-${process.env.ETIQUETA ?? fecha}.json`;
// eslint-disable-next-line security/detect-non-literal-fs-filename -- ruta armada aqui, dentro de docs/
writeFileSync(archivo, JSON.stringify({ fecha: new Date().toISOString(), base: BASE, resultados }, null, 2));
console.log(`Resultados guardados en ${archivo}`);
process.exitCode = pasan === resultados.length ? 0 : 1;
