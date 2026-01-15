# --- ÉTAPE 1 : BUILD (Compilation) ---
FROM node:20-alpine AS builder
WORKDIR /app

# On définit l'environnement de build
ENV NODE_ENV=development

# Installation des outils nécessaires pour certaines dépendances natives
RUN apk add --no-cache python3 make g++

# Copie des fichiers de configuration
COPY backend/package*.json ./

# Installation propre avec gestion des conflits Nest 10 / Swagger 11
RUN npm install --legacy-peer-deps

# Copie du code source du backend
COPY backend/ .

# Génération du client Prisma (Crucial pour le lien avec PostgreSQL)
RUN npx prisma generate

# Compilation NestJS vers le dossier /dist
RUN npm run build

# --- ÉTAPE 2 : RUNTIME (Exécution) ---
FROM node:20-alpine
WORKDIR /app

# Installation du client PostgreSQL pour les backups automatisés
RUN apk add --no-cache postgresql-client

# On définit l'environnement de production
ENV NODE_ENV=production

# On récupère uniquement le nécessaire du builder pour alléger l'image
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Création des dossiers persistants (GED et Backups)
RUN mkdir -p uploads backups

# Exposition du port du Noyau Qualisoft
EXPOSE 9000

# ✅ Lancement sécurisé : On spécifie l'extension .js
CMD ["node", "dist/main.js"]