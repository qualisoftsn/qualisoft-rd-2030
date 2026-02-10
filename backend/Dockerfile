# CHEMIN ABSOLU : /backend/Dockerfile
# PROJET : Qualisoft Elite RD 2030 (Backend)
# RÔLE : Build Multi-Stage et Runtime Production

# --- ÉTAPE 1 : COMPILATION (BUILDER) ---
FROM node:20-alpine AS builder

# Installation des dépendances système pour les modules natifs (bcrypt, prisma)
RUN apk update && apk upgrade && \
    apk add --no-cache python3 make g++ libc6-compat openssl

WORKDIR /app

# ✅ SOLUTION : Ignorer le téléchargement de Chromium pour Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=true
# Optionnel : Si vous utilisez Prisma avec des moteurs spécifiques
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Injection des manifestes de dépendances
COPY package*.json ./

# Installation propre des dépendances avec gestion des peers
RUN npm install --legacy-peer-deps

# Copie du code source et génération du client Prisma Elite
COPY . .
RUN npx prisma generate

# Build du moteur NestJS
RUN npm run build

# --- ÉTAPE 2 : ENVIRONNEMENT D'EXÉCUTION (RUNTIME) ---
FROM node:20-alpine
WORKDIR /app

# Dépendances critiques pour Prisma et la communication PostgreSQL
RUN apk update && apk upgrade && \
    apk add --no-cache postgresql-client openssl libc6-compat

# Configuration de l'environnement
ENV NODE_ENV=production

# Récupération sélective des artefacts de build pour minimiser le poids de l'image
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Création des répertoires persistants pour les fichiers Qualisoft
RUN mkdir -p uploads backups

# Port de communication du Backend
EXPOSE 9000

# Démarrage avec synchronisation automatique du schéma
# L'option --accept-data-loss est maintenue selon ta configuration initiale
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main.js"]