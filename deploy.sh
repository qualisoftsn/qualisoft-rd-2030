#!/bin/bash

# Arrête le script immédiatement si une commande échoue
set -e

echo "🚀 [MATRIX] Déclenchement du déploiement Elite Souverain..."

# 1. Synchronisation du code
echo "📥 Récupération des dernières modifications..."
git pull origin main

# 2. Reconstruction et relance des conteneurs
# (On ne fait pas de 'down' complet pour réduire le temps d'indisponibilité)
echo "🏗️ Reconstruction du Noyau et du Cockpit..."
docker compose build --no-cache
docker compose up -d

# 3. Synchronisation Base de Données (MODE SÉCURISÉ)
echo "🗄️ Synchronisation du schéma Prisma (Sécurité Anti-Perte activée)..."
# Attention : AUCUN flag --accept-data-loss ici. 
# Si tu renommes une colonne, Prisma bloquera pour protéger tes données.
docker compose exec qualisoft-backend npx prisma db push

# 4. Régénération du Client Prisma (Indispensable après un db push)
echo "⚙️ Génération du client Prisma (Matrix Engine)..."
docker compose exec qualisoft-backend npx prisma generate

echo "✅ [MATRIX] Déploiement terminé avec succès."
echo "🌐 URL Principale : https://elite.qualisoft.sn"