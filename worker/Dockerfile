FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl netcat-openbsd

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

CMD ["node", "dist/main.js"]
