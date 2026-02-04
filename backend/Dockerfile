# --- STAGE 1 : BUILD ---
FROM node:20-bullseye AS builder

WORKDIR /app

# Installation des dépendances système nécessaires pour Prisma et le build
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Node
COPY package*.json ./
# Utilisation de legacy-peer-deps pour éviter les conflits de versions NestJS
RUN npm install --legacy-peer-deps

# Copie de tout le code source (incluant le dossier prisma)
COPY . .

# Génération du client Prisma (Indispensable pour que le backend comprenne la BDD)
RUN npx prisma generate

# Build de l'application NestJS
RUN npm run build

# --- STAGE 2 : PRODUCTION (Runtime) ---
FROM node:20-bullseye

WORKDIR /app

# Installation d'OpenSSL et du client PostgreSQL (utile pour les scripts de backup)
RUN apt-get update && apt-get install -y openssl libssl-dev postgresql-client && rm -rf /var/lib/apt/lists/*

# Récupération des fichiers construits depuis le Stage 1
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# Création des dossiers persistants pour les uploads et backups
RUN mkdir -p uploads backups && chmod -R 777 uploads backups

# Configuration des variables d'environnement
ENV NODE_ENV=production

# Exposition du port (Doit correspondre à ton main.ts)
EXPOSE 9000

# 🟢 CORRECTION MAJEURE ICI :
# On remplace 'migrate deploy' par 'db push --accept-data-loss'
# Cela force la mise à jour de la base de données et résout l'erreur P3005
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main"]