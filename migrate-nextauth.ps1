# migrate-nextauth.ps1
# Version compatible Windows PowerShell (Toutes versions)
$ErrorActionPreference = "Continue"

Write-Host "--- DEMARRAGE MIGRATION MATRIX SDE ---" -ForegroundColor Cyan

# 1. SAUVEGARDE
$TS = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "restauration-auth-$TS"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item "app", "core", "components" -Destination "$backupDir\" -Recurse -ErrorAction SilentlyContinue
Write-Host "Sauvegarde creee : $backupDir" -ForegroundColor Green

# 2. IDENTIFICATION (Version compatible PS 5.1)
Write-Host "Analyse des fichiers en cours..." -ForegroundColor Yellow
$files = Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse -File | ForEach-Object {
    $fileContent = Get-Content $_.FullName -Raw
    if ($fileContent -match "next-auth") {
        if ($_.FullName -notmatch "node_modules|\.next|backup-|$backupDir") {
            $_ # On renvoie le fichier s'il correspond
        }
    }
}

$fileCount = if ($files) { ($files | Measure-Object).Count } else { 0 }
Write-Host "Fichiers detectes : $fileCount" -ForegroundColor Yellow

# 3. MIGRATION
$modified = 0
if ($fileCount -gt 0) {
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        $original = $content
        
        # Remplacement des Imports
        $content = $content -replace "import\s+{[^}]+}\s+from\s+['""]next-auth/react['""];?", "import { useAuth } from '@/core/providers/auth-provider';"
        
        # Remplacement des Hooks et Etats
        $content = $content -replace "useSession\(\)", "useAuth()"
        $content = $content -replace "status\s*===\s*['""]loading['""]", "isLoading"
        $content = $content -replace "!session", "!isAuthenticated"
        $content = $content -replace "session\s*===\s*null", "!isAuthenticated"
        
        # Mapping Elite-SDE (U_FirstName, U_LastName)
        $nameMap = '`${user?.U_FirstName} ${user?.U_LastName}`'
        $content = $content -replace "session\?\.user\?\.name", $nameMap
        $content = $content -replace "session\?\.user\?\.email", "user?.U_Email"
        $content = $content -replace "session\?\.user", "user"
        
        # Nettoyage
        $content = $content -replace "<SessionProvider[^>]*>", ""
        $content = $content -replace "</SessionProvider>", ""
        $content = $content -replace "onClick\s*=\s*{\(\)\s*=>\s*signOut\(\)}", "onClick={signOut}"

        if ($content -ne $original) {
            # Ecriture compatible Windows
            [System.IO.File]::WriteAllText($file.FullName, $content)
            $modified++
            Write-Host "MIGRE : $($file.Name)" -ForegroundColor Green
        }
    }
}

Write-Host "--- FIN DE MIGRATION ---" -ForegroundColor Cyan
Write-Host "Fichiers modifies : $modified"