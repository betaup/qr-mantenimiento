// Muestra como quedan guardados en la base los valores protegidos con
// criptografia: hashes de contraseñas, hashes de sesion y tokens de QR.
// Uso: node scripts/revisar-cripto.mjs [ruta de la base]
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(process.argv[2] ?? "prisma/pruebas.db", { readOnly: true });
const corto = (valor, n) => `${valor.slice(0, n)}...`;

console.log("Contraseñas (Usuario.passwordHash)");
for (const u of db.prepare("SELECT correo, passwordHash FROM Usuario LIMIT 3").all()) {
  console.log(`  ${u.correo.padEnd(24)} ${corto(u.passwordHash, 50)}`);
}

console.log("\nSesiones (Sesion.tokenHash, SHA-256 en hexadecimal)");
for (const s of db.prepare("SELECT tokenHash FROM Sesion LIMIT 3").all()) {
  console.log(`  ${s.tokenHash.length} caracteres  ${corto(s.tokenHash, 20)}`);
}

console.log("\nCódigos QR (Equipo.qrToken, 32 bytes en base64url)");
for (const e of db.prepare("SELECT qrToken FROM Equipo LIMIT 3").all()) {
  console.log(`  ${e.qrToken.length} caracteres  ${corto(e.qrToken, 12)}`);
}
