import { requerirRol } from "@/lib/auth/guardas";

// Sin título propio: se mostraría también a quien no tiene este rol y
// revelaría que la ruta existe (RS-08).
export default async function PaginaAdmin() {
  const { usuario } = await requerirRol("ADMIN");

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Panel de {usuario.empresa}
      </h1>
      <p className="text-muted-foreground max-w-prose">
        Aquí vas a gestionar técnicos, equipos, asignaciones y códigos QR.
        Todavía no hay nada que administrar.
      </p>
    </div>
  );
}
