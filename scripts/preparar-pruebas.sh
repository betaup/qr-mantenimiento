#!/usr/bin/env bash
# Crea una base de datos solo para las pruebas de seguridad, para no tocar la de
# desarrollo: las pruebas dejan registros en la bitacora que ya no se pueden borrar.
set -euo pipefail
cd "$(dirname "$0")/.."
export DATABASE_URL="file:./pruebas.db"
rm -f prisma/pruebas.db prisma/pruebas.db-journal
npx prisma migrate deploy
npx prisma db seed
echo "Base de pruebas lista en prisma/pruebas.db"
