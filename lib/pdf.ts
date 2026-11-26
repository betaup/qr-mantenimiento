import "server-only";
import PDFDocument from "pdfkit";
import type { EntradaDeHistorial } from "@/lib/datos/servicios";
import { NOMBRE_DE_TIPO, ZONA_HORARIA } from "@/lib/dominio";

// Reporte PDF desde una plantilla fija (RS-12). Todo lo que escribio un
// usuario se dibuja como texto plano: aqui no se interpreta HTML ni formato.

const fechaYHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: ZONA_HORARIA,
});

/**
 * Deja solo caracteres que la tipografia del PDF puede dibujar (Latin-1) y
 * quita los de control, salvo el salto de linea.
 */
function textoPlano(valor: string): string {
  return valor
    .replace(/\r\n?/g, "\n")
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, "?");
}

type Equipo = {
  nombre: string;
  modelo: string;
  serie: string;
  ubicacion: string;
  seccion: string | null;
};

export function reporteDeEquipo(datos: {
  empresa: string;
  equipo: Equipo;
  historial: EntradaDeHistorial[];
  recortado: boolean;
}): Promise<Buffer> {
  const { empresa, equipo, historial, recortado } = datos;

  const pdf = new PDFDocument({
    size: "LETTER",
    margin: 54,
    // Metadatos minimos: sin autor ni datos del servidor (RS-20).
    info: {
      Title: "Historial de mantenimiento",
      Producer: "Mantenimiento QR",
      Creator: "Mantenimiento QR",
    },
  });

  const partes: Buffer[] = [];
  const listo = new Promise<Buffer>((resolver, rechazar) => {
    pdf.on("data", (parte: Buffer) => partes.push(parte));
    pdf.on("end", () => resolver(Buffer.concat(partes)));
    pdf.on("error", rechazar);
  });

  const gris = "#666666";
  const negro = "#111111";

  pdf.font("Helvetica-Bold").fontSize(18).fillColor(negro);
  pdf.text("Historial de mantenimiento");
  pdf.moveDown(0.3);
  pdf.font("Helvetica").fontSize(10).fillColor(gris);
  pdf.text(textoPlano(empresa));
  pdf.text(`Generado: ${fechaYHora.format(new Date())}`);

  pdf.moveDown(1.2);
  pdf.font("Helvetica-Bold").fontSize(13).fillColor(negro);
  pdf.text(textoPlano(equipo.nombre));
  pdf.moveDown(0.3);
  pdf.font("Helvetica").fontSize(10);
  for (const [termino, valor] of [
    ["Modelo", equipo.modelo],
    ["Serie", equipo.serie],
    ["Ubicación", equipo.ubicacion],
    ["Sección", equipo.seccion ?? "Sin sección"],
  ]) {
    pdf.fillColor(gris).text(`${termino}: `, { continued: true });
    pdf.fillColor(negro).text(textoPlano(valor));
  }

  pdf.moveDown(1.2);
  pdf.font("Helvetica-Bold").fontSize(13).fillColor(negro).text("Servicios");
  pdf.moveDown(0.5);

  if (historial.length === 0) {
    pdf.font("Helvetica").fontSize(10).fillColor(gris);
    pdf.text("Este equipo todavía no tiene servicios registrados.");
  }

  for (const entrada of historial) {
    const tipo = entrada.tipo ? NOMBRE_DE_TIPO[entrada.tipo] : "Servicio";
    const estado = entrada.anulacion
      ? " (anulado)"
      : entrada.correcciones.length > 0
        ? " (corregido)"
        : "";

    pdf.font("Helvetica-Bold").fontSize(10).fillColor(negro);
    pdf.text(`${tipo}${estado}`);
    pdf.font("Helvetica").fontSize(9).fillColor(gris);
    pdf.text(textoPlano(`${entrada.autor}, ${fechaYHora.format(entrada.creadoEn)}`));
    pdf.moveDown(0.2);
    pdf.fontSize(10).fillColor(negro);
    pdf.text(textoPlano(entrada.descripcion));

    if (entrada.anulacion) {
      pdf.moveDown(0.2);
      pdf.fontSize(9).fillColor(gris);
      pdf.text(
        textoPlano(
          `Anulado por ${entrada.anulacion.autor}, ${fechaYHora.format(entrada.anulacion.creadoEn)}`,
        ),
      );
      pdf.text(textoPlano(`Motivo: ${entrada.anulacion.motivo ?? ""}`));
    }
    pdf.moveDown(0.9);
  }

  if (recortado) {
    pdf.font("Helvetica").fontSize(9).fillColor(gris);
    pdf.text("El reporte muestra solo los servicios más recientes.");
  }

  pdf.end();
  return listo;
}
