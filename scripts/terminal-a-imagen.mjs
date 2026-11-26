// Dibuja la salida de un comando como una ventana de terminal y la guarda en PNG.
import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";

const pares = process.argv.slice(2); // titulo|entrada.txt|salida.png
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const color = (linea) => {
  let l = esc(linea);
  if (l.startsWith("$ ")) return `<span class="cmd">$</span> <b>${l.slice(2)}</b>`;
  return l
    .replace(/\b(critical)\b/gi, '<span class="crit">$1</span>')
    .replace(/\b(high)\b/gi, '<span class="alta">$1</span>')
    .replace(/\b(moderate)\b/gi, '<span class="mod">$1</span>')
    .replace(/\b(warning)\b/g, '<span class="mod">$1</span>')
    .replace(/(✖ FALLA.*)/, '<span class="crit">$1</span>')
    .replace(/(✖(?! FALLA).*)/, '<span class="alta">$1</span>')
    .replace(/(✓.*|passed.*)/, '<span class="cmd">$1</span>');
};

const navegador = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
for (const par of pares) {
  const [titulo, entrada, salida] = par.split("|");
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- herramienta local: la ruta la escribe quien la ejecuta
  const lineas = readFileSync(entrada, "utf8").replace(/\s+$/, "").split("\n");
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:28px;background:#e9e9e7;font-family:-apple-system,Helvetica,sans-serif}
    .ventana{width:1000px;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.18);background:#1d1f21}
    .barra{display:flex;align-items:center;gap:8px;padding:11px 14px;background:#2c2e31;color:#b9bcc0;font-size:13px}
    .p{width:12px;height:12px;border-radius:50%}.titulo{margin-left:10px}
    pre{margin:0;padding:18px 20px;color:#d7dadc;font:13.5px/1.55 "SF Mono",Menlo,monospace;white-space:pre-wrap;word-break:break-word}
    .cmd{color:#8bd450}.crit{color:#ff6b6b;font-weight:600}.alta{color:#ff9f43}.mod{color:#f6d365}b{color:#fff;font-weight:600}
  </style><div class="ventana"><div class="barra"><span class="p" style="background:#ff5f57"></span><span class="p" style="background:#febc2e"></span><span class="p" style="background:#28c840"></span><span class="titulo">${esc(titulo)}</span></div><pre>${lineas.map(color).join("\n")}</pre></div>`;
  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: 1060, height: 400, deviceScaleFactor: 2 });
  await pagina.setContent(html);
  const caja = await pagina.$(".ventana");
  await caja.screenshot({ path: salida });
  console.log(salida.split("/").pop());
  await pagina.close();
}
await navegador.close();
