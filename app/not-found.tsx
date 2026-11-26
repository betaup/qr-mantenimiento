import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// La misma pagina para lo que no existe y para lo que no tienes permiso de ver (RS-08).
export default function NoEncontrado() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="panel flex w-full max-w-sm flex-col gap-4 p-7">
      <h1 className="text-2xl font-semibold tracking-tight">
        No encontramos esa página
      </h1>
      <p className="text-muted-foreground">
        Puede que el enlace esté mal escrito o que no tengas acceso.
      </p>
      <Link href="/" className={buttonVariants({ className: "h-11 text-base" })}>
        Ir al inicio
      </Link>
      </div>
    </main>
  );
}
