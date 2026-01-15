#!/bin/bash
echo "🛡️ Déploiement Qualisoft RD 2030 - Serveur Dakar"

# 1. Vérifier les dossiers de stockage
mkdir -p uploads backups

# 2. Relancer l'infrastructure
docker-compose down
docker-compose up -d --build

# 3. Nettoyer les images inutilisées pour libérer l'espace OVH
docker image prune -f

echo "✅ Noyau Qualisoft opérationnel sur le port 9000"