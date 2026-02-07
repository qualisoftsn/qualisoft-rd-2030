Write-Host "🚀 [Qualisoft Elite] Initialisation de l'environnement Windows (Port 3001)..." -ForegroundColor Cyan

# 1. Nettoyage
Write-Host "🧹 Nettoyage des anciens conteneurs..." -ForegroundColor Yellow
docker compose down --remove-orphans

# 2. Lancement des services de base
Write-Host "🐘 Lancement de PostgreSQL et Redis..." -ForegroundColor Yellow
docker compose up -d db redis

# 3. Attente de la base de données (Healthcheck)
Write-Host "⏳ Attente que la base de données soit prête..." -ForegroundColor Yellow
do {
    $check = docker exec qualisoft_db pg_isready -U postgres
    if ($check -notmatch "accepting connections") {
        Start-Sleep -Seconds 2
    }
} while ($check -notmatch "accepting connections")

# 4. Synchronisation Prisma
Write-Host "💎 Synchronisation du schéma Prisma..." -ForegroundColor Cyan
Set-Location ./backend
npx prisma generate
npx prisma db push
Set-Location ..

# 5. Lancement final
Write-Host "🛠️ Lancement du Backend et du Frontend..." -ForegroundColor Yellow
docker compose up -d backend frontend

Write-Host "✅ Environnement opérationnel sur Windows !" -ForegroundColor Green
Write-Host "👉 Frontend : http://localhost:3001"
Write-Host "👉 Backend  : http://localhost:9000/api"