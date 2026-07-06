#!/bin/sh
set -e
npx prisma migrate deploy
node dist/prisma/seed.js 2>/dev/null || npx ts-node prisma/seed.ts 2>/dev/null || true
exec node dist/main.js
