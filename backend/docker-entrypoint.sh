#!/bin/sh
set -e
if [ "$RESET_DB" = "true" ]; then
  npx prisma db push --accept-data-loss --force-reset
else
  npx prisma db push --accept-data-loss
fi
npx prisma generate
node dist/prisma/seed.js 2>/dev/null || npx ts-node prisma/seed.ts 2>/dev/null || true
exec node dist/main.js
