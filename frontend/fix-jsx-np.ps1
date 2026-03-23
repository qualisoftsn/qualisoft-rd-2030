# fix-jsx-minimal.ps1
# Correction JSX Namespace pour Windows PowerShell

Write-Host "🔧 Correction JSX Namespace (md:size → className responsive)..." -ForegroundColor Cyan

$files = @(
    "src/app/(dashboard)/dashboard/equipment/page.tsx",
    "src/app/(dashboard)/dashboard/formations/page.tsx",
    "src/app/(dashboard)/dashboard/ged/page.tsx",
    "src/app/(dashboard)/layout.tsx",
    "src/components/layout/ActionHub.tsx",
    "src/components/layout/ImpersonationBanner.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Correction md:size
        $content = $content -replace 'size=\{(\d+)\}\s+md:size=\{(\d+)\}', 'size={$1} className="w-$1 h-$1 md:w-$2 md:h-$2 flex-shrink-0"'
        
        # Correction lg:size
        $content = $content -replace 'size=\{(\d+)\}\s+lg:size=\{(\d+)\}', 'size={$1} className="w-$1 h-$1 lg:w-$2 lg:h-$2 flex-shrink-0"'
        
        # Correction xl:size
        $content = $content -replace 'size=\{(\d+)\}\s+xl:size=\{(\d+)\}', 'size={$1} className="w-$1 h-$1 xl:w-$2 xl:h-$2 flex-shrink-0"'
        
        Set-Content $file $content -Encoding UTF8
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Fichier non trouvé: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Corrections terminées!" -ForegroundColor Green