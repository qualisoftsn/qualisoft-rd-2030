# --- STAGE 1 : BUILD ---
FROM node:20-bullseye AS builder

WORKDIR /app

# Installation des dépendances système nécessaires pour Prisma
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Node
COPY package*.json ./
RUN npm install

# Copie de tout le code (incluant le dossier prisma)
COPY . .

# Génération du client Prisma (Crucial pour le build NestJS)
RUN npx prisma generate

# Build de l'application
RUN npm run build

# --- STAGE 2 : PRODUCTION ---
FROM node:20-bullseye

WORKDIR /app

# Installation d'OpenSSL et du client PostgreSQL pour les backups
RUN apt-get update && apt-get install -y openssl libssl-dev postgresql-client && rm -rf /var/lib/apt/lists/*

# Récupération des fichiers construits
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# Création des dossiers persistants
RUN mkdir -p uploads backups && chmod -R 777 uploads backups

# Configuration des variables d'environnement
ENV NODE_ENV=production

EXPOSE 9000

# Commande de démarrage : Migration automatique PUIS lancement
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]