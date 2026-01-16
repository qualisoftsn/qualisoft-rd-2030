FROM node:20-bullseye AS builder

WORKDIR /app

# On force l'installation d'openssl avant tout
RUN apt-get update && apt-get install -y openssl libssl-dev

COPY package*.json ./
RUN npm install

# Copie explicite du dossier prisma
COPY prisma ./prisma/

# On génère Prisma AVANT de copier le reste du code pour être sûr
RUN npx prisma generate

COPY . .
RUN npm run build

# --- PRODUCTION ---
FROM node:20-bullseye-slim

WORKDIR /app
RUN apt-get update && apt-get install -y openssl libssl-dev postgresql-client && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

RUN mkdir -p uploads backups && chmod -R 777 uploads backups

ENV NODE_ENV=production
# Force Prisma à utiliser le moteur binaire correct pour Debian
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-1.1.x

EXPOSE 9000

# On utilise une commande simplifiée pour tester
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]