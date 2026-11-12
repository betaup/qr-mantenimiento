import Link from "next/link";
import { z } from "zod";
import { Estado } from "@/components/visual";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { consultarBitacora } from "@/lib/datos/bitacora";
import { ZONA_HORARIA } from "@/lib/dominio";

const fechaYHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: ZONA_HORARIA,
});

const NOMBRE_DE_ACCION: Record<string, string> = {
  LOGIN: "Inicio de sesión",
  LOGOUT: "Cierre de sesión",
  REAUTENTICACION: "Confirmación de contraseña",
  TECNICO_ALTA: "Alta de técnico",
  TECNICO_BAJA: "Cuenta desactivada",
  TECNICO_REACTIVADO: "Cuenta reactivada",
  PASSWORD_RESTABLECIDA: "Contraseña restablecida",
  EQUIPO_ALTA: "Alta de equipo",
  EQUIPO_CONSULTA: "Consulta de equipo",
  QR_REGENERADO: "QR regenerado",
  QR_ESCANEO: "Escaneo de QR",
  ASIGNACION_ALTA: "Asignación",
  ASIGNACION_BAJA: "Asignación quitada",
  SERVICIO_ALTA: "Servicio registrado",
  SERVICIO_CORRECCION: "Servicio corregido",
  SERVICIO_ANULACION: "Servicio anulado",
  PDF_GENERADO: "Reporte PDF",
  BITACORA_CONSULTA: "Consulta de bitácora",
};

const RESULTADO = {
  EXITO: { nombre: "Éxito", tono: "verde" },
  DENEGADO: { nombre: "Denegado", tono: "rojo" },
  FALLO: { nombre: "Fallo", tono: "naranja" },
} as const;

const numeroDePagina = z.coerce.number().int().min(1).max(10_000).catch(1);

// Sin título propio: se mostraría también a quien no tiene este rol y
// revelaría que la ruta existe (RS-08).
export default async function PaginaBitacora({
  searchParams,
}: PageProps<"/admin/bitacora">) {
  const pagina = numeroDePagina.parse((await searchParams).pagina);
  const { eventos, paginas } = await consultarBitacora(pagina);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Bitácora</h1>
        <p className="text-muted-foreground">
          No se puede modificar ni borrar. Cada consulta queda anotada.
        </p>
      </div>

      {eventos.length === 0 ? (
        <p className="panel text-muted-foreground">No hay eventos en esta página.</p>
      ) : (
        <div className="panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Quién</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventos.map((evento) => {
              const resultado =
                RESULTADO[evento.resultado as keyof typeof RESULTADO];
              return (
                <TableRow key={evento.id}>
                  <TableCell className="whitespace-nowrap">
                    {fechaYHora.format(evento.creadoEn)}
                  </TableCell>
                  <TableCell>{evento.usuario?.nombre ?? "Sin sesión"}</TableCell>
                  <TableCell>
                    {NOMBRE_DE_ACCION[evento.accion] ?? evento.accion}
                  </TableCell>
                  <TableCell>
                    <Estado tono={resultado?.tono ?? "gris"}>
                      {resultado?.nombre ?? evento.resultado}
                    </Estado>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs text-xs whitespace-normal">
                    {evento.recurso && <p>{evento.recurso}</p>}
                    {evento.detalle && <p>{evento.detalle}</p>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {evento.ip}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      )}

      <nav
        aria-label="Páginas"
        className="flex items-center justify-between gap-4"
      >
        <p className="text-muted-foreground text-sm">
          Página {pagina} de {paginas}
        </p>
        <div className="flex gap-2">
          {pagina > 1 && (
            <Link
              href={`/admin/bitacora?pagina=${pagina - 1}`}
              className={buttonVariants({ variant: "outline", className: "bg-card h-9" })}
            >
              Más recientes
            </Link>
          )}
          {pagina < paginas && (
            <Link
              href={`/admin/bitacora?pagina=${pagina + 1}`}
              className={buttonVariants({ variant: "outline", className: "bg-card h-9" })}
            >
              Más antiguos
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
