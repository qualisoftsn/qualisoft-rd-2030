#!/bin/bash
# Rapport de Santé Qualisoft RD 2030
REPORT_FILE="/app/qualisoft/qualisoft-rd-2030/health_report.txt"

echo "--- RAPPORT QUALISOFT DU $(date +'%d/%m/%Y à %H:%M') ---" > $REPORT_FILE
echo "" >> $REPORT_FILE

# 1. Vérification Docker
echo "[1/3] ÉTAT DES CONTENEURS :" >> $REPORT_FILE
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 2. Vérification PostgreSQL
echo "[2/3] ÉTAT BASE DE DONNÉES :" >> $REPORT_FILE
docker exec qualisoft_db pg_isready -U postgres > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL : Opérationnel" >> $REPORT_FILE
    echo "Taille de la DB :" >> $REPORT_FILE
    docker exec qualisoft_db du -sh /var/lib/postgresql/data >> $REPORT_FILE
else
    echo "❌ PostgreSQL : ERREUR DE CONNEXION" >> $REPORT_FILE
fi
echo "" >> $REPORT_FILE

# 3. Vérification Nginx / SSL
echo "[3/3] ÉTAT RÉSEAU NGINX :" >> $REPORT_FILE
curl -Is https://elite.qualisoft.sn | head -n 1 >> $REPORT_FILE

# Affichage dans la console (pour test)
cat $REPORT_FILE
# Envoi du mail via une commande simple (nécessite mailutils)
cat $REPORT_FILE | mail -s "Rapport de Santé Qualisoft RD 2030 - $(date +'%d/%m/%Y')" abdoulayethiongane@gmail.com
