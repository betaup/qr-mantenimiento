import Link from "next/link";
import { Campo } from "@/components/campo";
import { Formulario } from "@/components/formulario";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listarEquipos } from "@/lib/datos/equipos";
import { agregarEquipo } from "./acciones";

export default async function PaginaEquipos() {
  const equipos = await listarEquipos();

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <section className="flex min-w-0 flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Equipos</h1>

        {equipos.length === 0 ? (
          <p className="text-muted-foreground">
            Todavía no hay equipos. Agrega el primero con el formulario.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Serie</TableHead>
                <TableHead>Ubicación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipos.map((equipo) => (
                <TableRow key={equipo.id}>
                  <TableCell>
                    <Link
                      href={`/admin/equipos/${equipo.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {equipo.nombre}
                    </Link>
                  </TableCell>
                  <TableCell>{equipo.modelo}</TableCell>
                  <TableCell className="font-mono text-[0.8rem]">
                    {equipo.serie}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {equipo.ubicacion}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="flex flex-col gap-4 self-start rounded-lg border p-5">
        <h2 className="font-semibold">Agregar equipo</h2>
        <Formulario accion={agregarEquipo} boton="Agregar equipo">
          <Campo name="nombre" etiqueta="Nombre" required maxLength={80} />
          <Campo name="modelo" etiqueta="Modelo" required maxLength={80} />
          <Campo
            name="serie"
            etiqueta="Número de serie"
            required
            maxLength={60}
            ayuda="Como aparece en la placa del equipo."
          />
          <Campo
            name="ubicacion"
            etiqueta="Ubicación"
            required
            maxLength={120}
          />
          <Campo name="seccion" etiqueta="Sección (opcional)" maxLength={60} />
        </Formulario>
      </section>
    </div>
  );
}
