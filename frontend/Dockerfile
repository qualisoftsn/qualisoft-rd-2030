# PROJET : Qualisoft Elite RD 2030 (Frontend)
# RÔLE : Build Multi-Stage Standalone (Optimisé Mémoire & Cache)

# --- ÉTAPE 1 : DÉPENDANCES ---
FROM node:20-alpine AS deps
# libc6-compat est nécessaire pour certaines dépendances natives (node-canvas, etc.)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# On ne copie que les fichiers de dépendances pour maximiser le cache Docker
COPY package*.json ./
COPY prisma ./prisma/

# 🛡️ Flag Puppeteer pour éviter l'erreur DNS/Storage vue précédemment
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm install --legacy-peer-deps

# --- ÉTAPE 2 : BUILDER (Compilation) ---
FROM node:20-alpine AS builder
WORKDIR /app

# Récupération des dépendances de l'étape 1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 🛡️ VARIABLES DE CONTRÔLE SOUVERAIN (Correction erreur Memory Allocation)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Force Node à limiter son tas à 2Go pour éviter le SIGKILL sur Windows
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Génération du client Prisma (Requis pour le build Next.js)
RUN npx prisma generate

# Build Next.js 16 (Turbopack est gourmand, NODE_OPTIONS va le canaliser)
RUN npm run build

# --- ÉTAPE 3 : RUNNER (Exécution Souveraine) ---
FROM node:20-alpine AS runner
WORKDIR /app

# Configuration de l'environnement de production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Sécurité : Groupe et Utilisateur scellés (Non-Privilégiés)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Récupération chirurgicale des fichiers nécessaires au mode standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Transfert du moteur Prisma généré (Crucial pour les requêtes DB)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3001

# Lancement du serveur via le mode standalone (Plus rapide, plus léger)
CMD ["node", "server.js"]