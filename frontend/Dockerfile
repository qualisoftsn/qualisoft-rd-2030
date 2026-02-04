# --- ÉTAPE 1 : BUILD ---
FROM node:20-alpine AS builder

# 🟢 CRUCIAL : Installation de la librairie manquante pour Next.js (SWC)
# C'est cette ligne qui corrige l'erreur "ld-linux-x86-64.so.2"
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
# 'npm ci' est plus strict et plus rapide que 'npm install' pour Docker
RUN npm ci --legacy-peer-deps

# Copie du dossier prisma et du reste du code
COPY prisma ./prisma/
COPY . .

# Génération du client Prisma (Indispensable avant le build)
RUN npx prisma generate

# Configuration de l'environnement de build
ENV NEXT_TELEMETRY_DISABLED 1
ARG NEXT_PUBLIC_API_URL=http://127.0.0.0:9000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Compilation de l'application Next.js
RUN npm run build

# --- ÉTAPE 2 : RUNTIME ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Création d'un utilisateur système sécurisé (Bonnes pratiques Docker)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# On ne copie que les fichiers nécessaires pour alléger l'image
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# On passe sur l'utilisateur sécurisé
USER nextjs

# On expose le port 3001 comme tu le souhaites
EXPOSE 3001

# Lancement de Next.js sur le port 3001
CMD ["npm", "run", "start", "--", "-p", "3001"]