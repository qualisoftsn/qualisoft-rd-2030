# --- STAGE 1 : BUILD ---
FROM node:20-alpine AS builder

WORKDIR /app

# Installation des dépendances nécessaires pour Prisma et le build
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

# Copie de tout le code source (incluant le dossier prisma)
COPY . .

# Génération du client Prisma (Crucial pour éviter l'erreur "schema not found")
RUN npx prisma generate

# Build de l'application NestJS
RUN npm run build

# --- STAGE 2 : PRODUCTION ---
FROM node:20-alpine

WORKDIR /app

# Installation des outils système nécessaires (OpenSSL pour Prisma, Client PG pour backups)
RUN apk add --no-cache openssl postgresql-client

# Copie des fichiers essentiels depuis le builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# Création des dossiers persistants pour les fichiers et backups
RUN mkdir -p uploads backups && chmod -R 777 uploads backups

# Variables d'environnement par défaut
ENV NODE_ENV=production

EXPOSE 9000

# Commande de démarrage : on s'assure que les migrations sont appliquées avant de lancer le serveur
CMD npx prisma migrate deploy && node dist/main