# fix-jsx-v2.ps1
# Version compatible toutes versions PowerShell

Write-Host "Correction JSX Namespace..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | 
         Where-Object { $_.FullName -match "(dashboard|components)" }

foreach ($file in $files) {
    try {
        # Lecture du fichier (compatible ancien PowerShell)
        $content = Get-Content $file.FullName -Encoding UTF8
        $content = $content -join "`n"
        
        # Pattern 1: size={N} md:size={M}
        $content = $content -replace 'size=\{(\d+)\}\s+md:size=\{(\d+)\}', 'size={$1} className="w-$1 h-$1 md:w-$2 md:h-$2 flex-shrink-0"'
        
        # Pattern 2: size={N} lg:size={M}
        $content = $content -replace 'size=\{(\d+)\}\s+lg:size=\{(\d+)\}', 'size={$1} className="w-$1 h-$1 lg:w-$2 lg:h-$2 flex-shrink-0"'
        
        # Pattern 3: size={N} xl:size={M}
        $content = $content -replace 'size=\{(\d+)\}\s+xl:size=\{(\d+)\}', 'size={$1} className="w-$1 h-$1 xl:w-$2 xl:h-$2 flex-shrink-0"'
        
        # Écriture du fichier
        $content | Set-Content $file.FullName -Encoding UTF8
        Write-Host "✅ $($file.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ $($file.Name) - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Corrections terminées !" -ForegroundColor Cyan