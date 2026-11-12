export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-3 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Mantenimiento QR
      </h1>
      <p className="text-muted-foreground text-lg leading-relaxed">
        Escanea el código de un equipo para ver su historial y registrar un
        servicio.
      </p>
    </main>
  );
}
