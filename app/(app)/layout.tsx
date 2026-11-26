import { BarraLateral } from "@/components/barra-lateral";
import { requerirSesion } from "@/lib/auth/guardas";
import { salir } from "./acciones";

// El layout no se vuelve a ejecutar al navegar entre paginas, asi que cada
// pagina repite su propia verificacion de sesion y rol.
export default async function LayoutApp({ children }: LayoutProps<"/">) {
  const { usuario } = await requerirSesion();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[18rem_1fr]">
      <BarraLateral
        rol={usuario.rol}
        nombre={usuario.nombre}
        empresa={usuario.empresa}
        salir={salir}
      />
      <main className="min-w-0 px-4 py-5 lg:py-6 lg:pr-6 lg:pl-3">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
