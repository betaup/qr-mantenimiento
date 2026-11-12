import { requerirRol } from "@/lib/auth/guardas";

// Sin título propio: se mostraría también a quien no tiene este rol y
// revelaría que la ruta existe (RS-08).
export default async function PaginaTecnico() {
  await requerirRol("TECNICO");

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Tus equipos de hoy
      </h1>
      <p className="text-muted-foreground max-w-prose">
        Aquí vas a ver los equipos que tienes asignados hoy. Todavía no se
        muestran.
      </p>
    </div>
  );
}
