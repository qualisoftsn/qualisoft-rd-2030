# --- ÉTAPE 1 : BUILD (Compilation) ---
FROM node:20-alpine AS builder
WORKDIR /app

# On définit l'environnement de build
ENV NODE_ENV=development

# Installation des outils nécessaires
RUN apk add --no-cache python3 make g++

# ✅ Correction du chemin : on copie depuis le contexte local
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copie du code source et du dossier prisma
COPY . .

# Génération du client Prisma
RUN npx prisma generate

# Compilation NestJS
RUN npm run build

# --- ÉTAPE 2 : RUNTIME (Exécution) ---
FROM node:20-alpine
WORKDIR /app

# Installation des outils système (PostgreSQL client + OpenSSL pour Prisma)
RUN apk add --no-cache postgresql-client openssl

# On définit l'environnement
ENV NODE_ENV=production

# ✅ RÉCUPÉRATION DES FICHIERS (On ajoute le dossier prisma ici !)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Création des dossiers persistants
RUN mkdir -p uploads backups

EXPOSE 9000

# ✅ Lancement avec synchronisation automatique de la base de données
# Cela règle ton erreur P3005 en forçant la mise à jour du schéma au démarrage
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main.js"]