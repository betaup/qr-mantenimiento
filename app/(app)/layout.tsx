import { Button } from "@/components/ui/button";
import { requerirSesion } from "@/lib/auth/guardas";
import { salir } from "./acciones";

// El layout no se vuelve a ejecutar al navegar entre páginas, así que cada
// página repite su propia verificación de sesión y rol.
export default async function LayoutApp({ children }: LayoutProps<"/">) {
  const { usuario } = await requerirSesion();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b print:hidden">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <span className="font-semibold tracking-tight">Mantenimiento QR</span>

          <div className="flex items-center gap-3">
            <div className="text-right text-sm leading-tight">
              <p className="font-medium">{usuario.nombre}</p>
              <p className="text-muted-foreground">{usuario.empresa}</p>
            </div>
            <form action={salir}>
              <Button type="submit" variant="outline" className="h-9">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
