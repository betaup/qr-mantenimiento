import Link from "next/link";
import { Campo } from "@/components/campo";
import { Formulario } from "@/components/formulario";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listarTecnicos } from "@/lib/datos/tecnicos";
import { LONGITUD_MINIMA } from "@/lib/auth/reglas";
import { agregarTecnico } from "./acciones";

export default async function PaginaTecnicos() {
  const tecnicos = await listarTecnicos();

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <section className="flex min-w-0 flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Técnicos</h1>

        {tecnicos.length === 0 ? (
          <p className="panel text-muted-foreground">
            Todavía no hay técnicos. Agrega al primero con el formulario.
          </p>
        ) : (
          <div className="panel overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tecnicos.map((tecnico) => (
                <TableRow key={tecnico.id}>
                  <TableCell>
                    <Link
                      href={`/admin/tecnicos/${tecnico.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {tecnico.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tecnico.correo}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        tecnico.activo
                          ? "bg-brand/25 border-transparent"
                          : "text-muted-foreground"
                      }
                    >
                      {tecnico.activo ? "Activo" : "Desactivado"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </section>

      <section className="panel flex flex-col gap-4 self-start">
        <h2 className="font-semibold">Agregar técnico</h2>
        <Formulario accion={agregarTecnico} boton="Agregar técnico">
          <Campo name="nombre" etiqueta="Nombre" required maxLength={80} />
          <Campo
            name="correo"
            etiqueta="Correo"
            type="email"
            required
            maxLength={254}
            autoComplete="off"
          />
          <Campo
            name="password"
            etiqueta="Contraseña inicial"
            type="password"
            required
            autoComplete="new-password"
            ayuda={`Al menos ${LONGITUD_MINIMA} caracteres. Entrégasela en persona.`}
          />
        </Formulario>
      </section>
    </div>
  );
}
