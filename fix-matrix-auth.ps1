# SCRIPT DE NETTOYAGE MATRIX - QUALISOFT RD 2030
$projectRoot = Get-Location
Write-Host "--- Lancement du scan sur : $projectRoot ---" -ForegroundColor Cyan

# On cible les fichiers TS et TSX dans le dossier src
$files = Get-ChildItem -Path "$projectRoot\src" -Filter "*.ts*" -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)

    if ($content -match "next-auth") {
        Write-Host "Nettoyage de : $($file.FullName)" -ForegroundColor Yellow

        # 1. Suppression des imports Next-Auth (Regex robuste)
        $content = $content -replace 'import\s+[\{\s\w,]*\}\s+from\s+["'']next-auth.*["''];?\r?\n?', ''
        $content = $content -replace 'import\s+authOptions\s+from\s+["''].*auth["''];?\r?\n?', ''

        # 2. Remplacement de la logique getServerSession
        if ($content -match "getServerSession") {
            
            # Insertion des nouveaux imports en haut
            $newImports = "import * as jwt from 'jsonwebtoken';`nimport { cookies } from 'next/headers';`n"
            $content = $newImports + $content

            # Definition du bloc de remplacement
            $logic = '
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  let session = null;
  try {
    if (token) session = jwt.verify(token, process.env.JWT_SECRET || "qualipass2026") as any;
  } catch (e) { session = null; }'

            # Remplacement de la ligne getServerSession
            $content = $content -replace 'const\s+session\s+=\s+await\s+getServerSession\(.*\);?', $logic
        }

        # 3. Nettoyage des references a session.user
        $content = $content -replace '!session\?.user', '!session'
        $content = $content -replace 'session\.user', 'session'

        # Sauvegarde propre en UTF8 sans BOM
        [System.IO.File]::WriteAllText($file.FullName, $content)
    }
}

Write-Host "--- Operation terminee. Next-Auth a ete retire. ---" -ForegroundColor Green