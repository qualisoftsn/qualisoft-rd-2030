# --- ÉTAPE 1 : BUILD ---
FROM node:20-alpine AS builder
WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copie du code et build
COPY . .
# On définit l'URL de l'API pour le build Next.js
ARG NEXT_PUBLIC_API_URL=http://127.0.0.0:9000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# --- ÉTAPE 2 : RUNTIME ---
FROM node:20-alpine
WORKDIR /app

# On ne garde que le nécessaire
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
# Lancement de Next.js
CMD ["npm", "run", "start", "--", "-p", "3001"]