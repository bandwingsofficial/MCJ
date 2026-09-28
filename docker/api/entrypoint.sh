#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL is required at runtime." >&2
  exit 1
fi

echo "Applying Prisma migrations (migrate deploy)..."
./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma

echo "Starting NestJS API..."
exec node dist/main.js
