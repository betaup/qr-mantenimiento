"use client";

// Último recurso: reemplaza al layout raíz si este falla, por eso define su
// propio <html> y no usa los estilos de la aplicación. Sin detalles (RS-19).
export default function ErrorGlobal({ retry }: { retry: () => void }) {
  return (
    <html lang="es">
      <body>
        <main>
          <title>Error · Mantenimiento QR</title>
          <h1>No pudimos cargar la aplicación</h1>
          <p>Ocurrió un error de nuestro lado. Inténtalo de nuevo.</p>
          <button onClick={() => retry()}>Intentar de nuevo</button>
        </main>
      </body>
    </html>
  );
}
