# --- STAGE 1 : BUILD ---
FROM node:20-bullseye AS builder

WORKDIR /app

# Installation des outils de build nécessaires
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

# Copie de tout le code source (incluant le dossier prisma)
COPY . .

# Génération du client Prisma
RUN npx prisma generate

# Build de l'application NestJS
RUN npm run build

# --- STAGE 2 : PRODUCTION ---
FROM node:20-bullseye-slim

WORKDIR /app

# Réinstallation d'OpenSSL et du client PostgreSQL pour les backups
RUN apt-get update && apt-get install -y openssl postgresql-client && rm -rf /var/lib/apt/lists/*

# Copie des fichiers essentiels depuis le builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# Création des dossiers persistants avec les bons droits
RUN mkdir -p uploads backups && chmod -R 777 uploads backups

ENV NODE_ENV=production

EXPOSE 9000

# Commande de démarrage avec migration automatique
CMD sh -c "npx prisma migrate deploy && node dist/main"