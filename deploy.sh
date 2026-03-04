#!/bin/bash

# ==========================================================================
# 🛰️ SCRIPT DE DÉPLOIEMENT HAUTE DISPONIBILITÉ - MATRIX ELITE RD-2026 (elite-sde)
# --------------------------------------------------------------------------
# RÔLE : Mise à jour atomique, Nettoyage Disque & Synchronisation Prisma
# FIX : Ajout du Seeding Idempotent pour garantir l'existence des Tenants.
# RÉVISION : 04 Mars 2026 | 05:55 GMT
# ==========================================================================

# Arrête le script immédiatement si une commande échoue
set -e

# Couleurs pour la lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 [MATRIX] Initialisation du déploiement Elite Souverain...${NC}"

# 0. VÉRIFICATION DE L'ESPACE DISQUE (Prévention ENOSPC)
echo -e "${BLUE}🧹 Nettoyage préventif des résidus Docker...${NC}"
docker system prune -f --volumes
docker builder prune -af

# 1. SYNCHRONISATION DU CODE
echo -e "${BLUE}📥 Récupération des dernières modifications (Git)...${NC}"
git pull origin main

# 2. ALIGNEMENT DES IMAGES (Minuscules & Dossier Images)
# On s'assure que le dossier public/images existe et est propre
if [ -d "frontend/public/images" ]; then
    echo -e "${BLUE}🖼️  Optimisation du registre des images statiques...${NC}"
    cd frontend/public/images
    for f in *; do mv "$f" "${f,,}" 2>/dev/null || true; done
    cd ../../../
fi

# 3. RECONSTRUCTION DU NOYAU ET DU COCKPIT
echo -e "${BLUE}🏗️  Reconstruction des conteneurs (Build sans cache)...${NC}"
# --pull force Docker à récupérer les dernières images de base (Node, etc.)
docker compose build --pull --no-cache
docker compose up -d

# 4. SYNCHRONISATION BASE DE DONNÉES & SEEDING SÉCURISÉ
echo -e "${BLUE}🗄️  Synchronisation sécurisée du schéma PostgreSQL...${NC}"
# npx prisma db push synchronise le schéma SANS effacer les données
docker compose exec -T qualisoft-backend npx prisma db push
docker compose exec -T qualisoft-backend npx prisma generate

echo -e "${BLUE}🌱 Injection des données souveraines (Seed Idempotent)...${NC}"
# Exécution du seed (crée les locataires manquants sans toucher aux données existantes)
docker compose exec -T qualisoft-backend npx prisma db seed

# 5. NETTOYAGE POST-DÉPLOIEMENT
echo -e "${BLUE}🧹 Suppression des images orphelines (Build Stage)...${NC}"
docker image prune -f

echo -e "${GREEN}✅ [MATRIX] Déploiement terminé avec succès.${NC}"
echo -e "${GREEN}🌐 Cockpit Elite : https://qualisoft.sn${NC}"
echo -e "${GREEN}🛡️  Console Matrix : https://elite.qualisoft.sn${NC}"

# Vérification rapide des conteneurs
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"