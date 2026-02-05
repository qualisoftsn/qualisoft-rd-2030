# --- ÉTAPE 1 : BUILD ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY prisma ./prisma/
COPY . .

RUN npx prisma generate

# Configuration de l'environnement de build
ENV NEXT_TELEMETRY_DISABLED 1

# 🔴 LA CORRECTION EST ICI :
# On définit l'ARG sans valeur par défaut erronée pour forcer l'injection
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# --- ÉTAPE 2 : RUNTIME ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

USER nextjs
EXPOSE 3001

CMD ["npm", "run", "start", "--", "-p", "3001"]