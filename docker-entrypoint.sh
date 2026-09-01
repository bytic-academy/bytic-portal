#!/bin/sh
set -e

echo "================================================="
echo "  Bytic Attendance System - Container Startup"
echo "================================================="

# Synchronize Prisma schema with the SQLite database
if [ -n "$DATABASE_URL" ]; then
  echo "[1/2] Syncing database schema with Prisma db push..."
  npx prisma db push --skip-generate || echo "Warning: Prisma db push encountered non-fatal notices."
fi

# Optional automatic seeding for fresh databases
if [ "$AUTO_SEED" = "true" ]; then
  echo "[2/2] Running database seed..."
  npx tsx prisma/seed.ts || echo "Seed skipped or already populated."
else
  echo "[2/2] Auto-seeding disabled (set AUTO_SEED=true to enable)."
fi

echo "Database ready. Launching application server..."
exec "$@"