-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoUsoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEn" DATETIME NOT NULL,
    CONSTRAINT "Sesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "seccion" TEXT,
    "qrToken" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Equipo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asignacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "tecnicoId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Asignacion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asignacion_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Asignacion_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "clase" TEXT NOT NULL,
    "tipo" TEXT,
    "descripcion" TEXT NOT NULL,
    "motivo" TEXT,
    "referenciaId" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Servicio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Servicio_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Servicio_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Servicio_referenciaId_fkey" FOREIGN KEY ("referenciaId") REFERENCES "Servicio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bitacora" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "recurso" TEXT,
    "resultado" TEXT NOT NULL,
    "detalle" TEXT,
    "ip" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bitacora_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bitacora_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "Usuario_empresaId_idx" ON "Usuario"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_tokenHash_key" ON "Sesion"("tokenHash");

-- CreateIndex
CREATE INDEX "Sesion_usuarioId_idx" ON "Sesion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_qrToken_key" ON "Equipo"("qrToken");

-- CreateIndex
CREATE INDEX "Equipo_empresaId_idx" ON "Equipo"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_empresaId_serie_key" ON "Equipo"("empresaId", "serie");

-- CreateIndex
CREATE INDEX "Asignacion_tecnicoId_fecha_idx" ON "Asignacion"("tecnicoId", "fecha");

-- CreateIndex
CREATE INDEX "Asignacion_empresaId_fecha_idx" ON "Asignacion"("empresaId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Asignacion_equipoId_tecnicoId_fecha_key" ON "Asignacion"("equipoId", "tecnicoId", "fecha");

-- CreateIndex
CREATE INDEX "Servicio_equipoId_creadoEn_idx" ON "Servicio"("equipoId", "creadoEn");

-- CreateIndex
CREATE INDEX "Servicio_empresaId_idx" ON "Servicio"("empresaId");

-- CreateIndex
CREATE INDEX "Bitacora_empresaId_creadoEn_idx" ON "Bitacora"("empresaId", "creadoEn");

-- Inmutabilidad (RS-13, RS-14, RS-18): la base rechaza cualquier UPDATE o
-- DELETE sobre servicios y bitácora, venga de la aplicación o de fuera.
-- Si una migración futura recrea estas tablas, hay que volver a crear los triggers.
CREATE TRIGGER "Servicio_sin_update" BEFORE UPDATE ON "Servicio"
BEGIN
    SELECT RAISE(ABORT, 'Los servicios no se pueden modificar');
END;

CREATE TRIGGER "Servicio_sin_delete" BEFORE DELETE ON "Servicio"
BEGIN
    SELECT RAISE(ABORT, 'Los servicios no se pueden borrar');
END;

CREATE TRIGGER "Bitacora_sin_update" BEFORE UPDATE ON "Bitacora"
BEGIN
    SELECT RAISE(ABORT, 'La bitacora no se puede modificar');
END;

CREATE TRIGGER "Bitacora_sin_delete" BEFORE DELETE ON "Bitacora"
BEGIN
    SELECT RAISE(ABORT, 'La bitacora no se puede borrar');
END;
