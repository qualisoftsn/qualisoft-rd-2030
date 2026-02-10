# D:\QS_RD_2030\qualisoft-root\check-prisma.ps1
# ROLE : Verifier la generation des types Prisma dans le conteneur qualisoft-backend

Write-Host "--- AUDIT DU MOTEUR PRISMA ---" -ForegroundColor Cyan

# 1. Verification de la generation des types
Write-Host "[1/2] Verification du client Prisma genere..." -ForegroundColor White
docker exec -it qualisoft-backend npx prisma -v

# 2. Audit de la structure des tables (Radicales T_, S_, U_)
Write-Host "[2/2] Inspection de la table Tenant..." -ForegroundColor White
docker exec -it qualisoft-backend npx prisma db pull --print

Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "Si tu vois T_Id, S_Id et U_Id dans la sortie ci-dessus,"
Write-Host "alors ton architecture est techniquement scellee."
Write-Host "--------------------------------------------------------"