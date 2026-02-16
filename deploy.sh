#!/bin/bash
echo "🚀 [MATRIX] Déclenchement du déploiement Elite..."
git pull
docker compose build --no-cache
docker compose up -d
docker compose exec backend npx prisma db push --accept-data-loss
docker compose exec backend npx prisma db seed
echo "✅ [MATRIX] Système à jour et sécurisé sur https://elite.qualisoft.sn"