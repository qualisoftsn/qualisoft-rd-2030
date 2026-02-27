# cleanup-nextauth.ps1
# Script de nettoyage NextAuth pour Qualisoft Root
$ErrorActionPreference = "Continue"

Write-Host "--- DEMARRAGE NETTOYAGE NEXTAUTH ---" -ForegroundColor Cyan

# 1. SAUVEGARDE
$backupDir = "backup-auth-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Sauvegarde en cours..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

if (Test-Path "package.json") { Copy-Item "package.json" "$backupDir\" }
if (Test-Path ".env") { Copy-Item ".env" "$backupDir\" }
if (Test-Path "app/api/auth") { 
    Copy-Item "app/api/auth" "$backupDir\auth-api-backup" -Recurse -Force 
}
Write-Host "Sauvegarde terminee dans $backupDir" -ForegroundColor Green

# 2. DESINSTALLATION PACKAGES
Write-Host "Desinstallation des packages..." -ForegroundColor Cyan
npm uninstall next-auth @next-auth/prisma-adapter

# 3. SUPPRESSION DES ROUTES API
$apiPath = "app/api/auth"
if (Test-Path $apiPath) {
    Remove-Item $apiPath -Recurse -Force
    Write-Host "Repertoire API Auth supprime" -ForegroundColor Green
}

# 4. NEUTRALISATION .ENV
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $newEnv = $envContent | ForEach-Object {
        if ($_ -match "^NEXTAUTH_") {
            "# DEPRECATED: " + $_
        } else {
            $_
        }
    }
    $newEnv | Set-Content ".env"
    Write-Host "Variables .env neutralisees" -ForegroundColor Green
}

# 5. RECHERCHE DE REFERENCES
Write-Host "Recherche de references residuelles..." -ForegroundColor Cyan
$dirs = @("app", "core", "components", "types")
$found = $false

foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        $files = Get-ChildItem -Path $dir -Include *.ts,*.tsx,*.js,*.jsx -Recurse -File
        foreach ($file in $files) {
            if ($file.FullName -notmatch "node_modules") {
                $content = Get-Content $file.FullName
                if ($content -match "next-auth") {
                    Write-Host "Reference trouvee dans: $($file.FullName)" -ForegroundColor White
                    $found = $true
                }
            }
        }
    }
}

if (-not $found) {
    Write-Host "Aucune reference next-auth trouvee." -ForegroundColor Green
}

# 6. INSTRUCTIONS FINALES
Write-Host "--- NETTOYAGE TERMINE ---" -ForegroundColor Green
Write-Host "Actions manuelles a faire :" -ForegroundColor Yellow
Write-Host "1. Dans layout.tsx, supprimer SessionProvider"
Write-Host "2. Remplacer useSession par useAuth"
Write-Host "3. Verifier que package.json ne contient plus next-auth"