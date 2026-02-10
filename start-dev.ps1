# D:\QS_RD_2030\qualisoft-root\start-dev.ps1
# RÔLE : Pilotage de l'orchestration PROD sur Windows
# NOTE : Version ASCII pure pour eviter les erreurs de terminator

$ErrorActionPreference = "SilentlyContinue"

Write-Host "--- PROTOCOLE ELITE MS : DEPLOIEMENT ---" -ForegroundColor Cyan

# 1. ARRÊT
Write-Host "[1/6] Arret des conteneurs..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down --remove-orphans

# 2. NETTOYAGE
Write-Host "[2/6] Nettoyage des volumes..." -ForegroundColor Cyan
docker volume rm qualisoft-root_qualisoft_db_data 2>$null
docker volume rm qualisoft-root_qualisoft_redis_data 2>$null

# 3. BUILD
Write-Host "[3/6] Build des images..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml build --no-cache

# 4. LANCEMENT
Write-Host "[4/6] Lancement de la Matrix..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml up -d

# 5. ATTENTE
Write-Host "[5/6] Attente de PostgreSQL (15s)..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# 6. INJECTION
Write-Host "[6/6] Injection du Noyau Master (Seeding)..." -ForegroundColor White
docker exec -it qualisoft-backend npm run db:init

Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "INFRASTRUCTURE QUALISOFT OPERATIONNELLE"
Write-Host "POINT D'ENTREE : http://localhost"
Write-Host "--------------------------------------------------------"