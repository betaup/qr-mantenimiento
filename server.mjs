// Servidor de produccion. Envuelve a Next.js solo para fijar la IP real del
// cliente: X-Forwarded-For lo puede escribir cualquiera, asi que se reemplaza
// por la direccion de la conexion (V-01). Si la app corre detras de un proxy
// propio, CONFIAR_EN_PROXY=1 conserva la cabecera que ese proxy agrega.
import { createServer } from "node:http";
import next from "next";

const puerto = Number(process.env.PORT ?? 3000);
const app = next({ dev: false });
const atender = app.getRequestHandler();

await app.prepare();

createServer((req, res) => {
  if (process.env.CONFIAR_EN_PROXY !== "1") {
    req.headers["x-forwarded-for"] = req.socket.remoteAddress ?? "desconocida";
  }
  atender(req, res);
}).listen(puerto, () => {
  console.log(`Servidor listo en http://localhost:${puerto}`);
});
