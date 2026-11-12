import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// La misma página para lo que no existe y para lo que no tienes permiso de ver (RS-08).
export default function NoEncontrado() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        No encontramos esa página
      </h1>
      <p className="text-muted-foreground">
        Puede que el enlace esté mal escrito o que no tengas acceso.
      </p>
      <Link href="/" className={buttonVariants({ className: "h-11 text-base" })}>
        Ir al inicio
      </Link>
    </main>
  );
}
