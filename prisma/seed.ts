// Datos de prueba: dos empresas ficticias, aisladas entre si.
// Uso: npx prisma db seed   (para empezar de cero: npx prisma migrate reset)
import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaClient } from "../lib/generated/prisma/client";
import { fechaDeHoy } from "../lib/dominio";
import { nuevoQrToken } from "../lib/qr";

const db = new PrismaClient();

const EMPRESAS = [
  {
    nombre: "Clima Norte",
    dominio: "climanorte.test",
    admin: "Laura Garza",
    tecnicos: ["Miguel Treviño", "Sofía Cantú"],
    equipos: [
      { nombre: "Minisplit recepción", modelo: "Mirage Life 12", serie: "CN-MS-0001", ubicacion: "Planta baja, recepción", seccion: "Oficinas" },
      { nombre: "Paquete azotea", modelo: "Carrier 50TC 5TR", serie: "CN-PQ-0002", ubicacion: "Azotea, lado norte", seccion: "Azotea" },
      { nombre: "Chiller principal", modelo: "Trane CGAM 20", serie: "CN-CH-0003", ubicacion: "Cuarto de máquinas", seccion: "Planta" },
    ],
  },
  {
    nombre: "Frío Regio",
    dominio: "frioregio.test",
    admin: "Carlos Elizondo",
    tecnicos: ["Ana Villarreal", "Jorge Salinas"],
    equipos: [
      { nombre: "Cámara de congelación", modelo: "Bohn BHT 3HP", serie: "FR-CC-0001", ubicacion: "Bodega 1", seccion: "Almacén" },
      { nombre: "Minisplit gerencia", modelo: "York Aura 18", serie: "FR-MS-0002", ubicacion: "Segundo piso, gerencia", seccion: "Oficinas" },
      { nombre: "Vitrina refrigerada", modelo: "Torrey VRD 42", serie: "FR-VR-0003", ubicacion: "Piso de venta", seccion: "Tienda" },
    ],
  },
];

const correoDe = (nombre: string, dominio: string) =>
  `${nombre.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}@${dominio}`;

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error("Define SEED_PASSWORD en .env con al menos 12 caracteres.");
  }
  if ((await db.empresa.count()) > 0) {
    console.log("La base ya tiene datos; no se cambió nada.");
    return;
  }

  // Argon2id es el algoritmo por defecto de @node-rs/argon2 (RS-01).
  // Un hash por cuenta, cada uno con su propia sal.
  const nuevoHash = () => hash(password);
  const hoy = fechaDeHoy();

  for (const e of EMPRESAS) {
    const empresa = await db.empresa.create({ data: { nombre: e.nombre } });

    const admin = await db.usuario.create({
      data: { empresaId: empresa.id, nombre: e.admin, correo: correoDe(e.admin, e.dominio), passwordHash: await nuevoHash(), rol: "ADMIN" },
    });

    const tecnicos = [];
    for (const nombre of e.tecnicos) {
      tecnicos.push(
        await db.usuario.create({
          data: { empresaId: empresa.id, nombre, correo: correoDe(nombre, e.dominio), passwordHash: await nuevoHash(), rol: "TECNICO" },
        }),
      );
    }

    const equipos = [];
    for (const eq of e.equipos) {
      equipos.push(await db.equipo.create({ data: { ...eq, empresaId: empresa.id, qrToken: nuevoQrToken() } }));
    }

    // El primer tecnico tiene hoy los dos primeros equipos; el tercero queda sin asignar.
    for (const equipo of equipos.slice(0, 2)) {
      await db.asignacion.create({
        data: { empresaId: empresa.id, equipoId: equipo.id, tecnicoId: tecnicos[0].id, fecha: hoy },
      });
    }

    await db.servicio.create({
      data: {
        empresaId: empresa.id,
        equipoId: equipos[0].id,
        autorId: tecnicos[0].id,
        clase: "ORIGINAL",
        tipo: "INSTALACION",
        descripcion: "Instalación inicial del equipo y prueba de arranque.",
      },
    });

    console.log(`${empresa.nombre}: ${[admin, ...tecnicos].map((u) => u.correo).join(", ")}`);
  }

  console.log("Listo. La contraseña de todas las cuentas es SEED_PASSWORD del archivo .env.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
