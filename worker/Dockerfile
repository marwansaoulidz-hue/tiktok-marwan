FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl netcat-openbsd

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npx prisma generate
RUN npm run build

CMD ["node", "dist/main.js"]
