# fix-jsx-namespace.ps1
# Correction JSX Namespace pour Windows PowerShell

Write-Host "🔧 Correction JSX Namespace (md:size → className)..." -ForegroundColor Cyan

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
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Pattern 1: size={N} md:size={M} → className responsive
        $content = $content -replace 'size=\{(\d+)\}\s+md:size=\{(\d+)\}', 'size={$1} className="w-$1 h-$1 md:w-$2 md:h-$2 flex-shrink-0"'
        
        # Pattern 2: size={N} lg:size={M}
        $content = $content -replace 'size=\{(\d+)\}\s+lg:size=\{(\d+)\}', 'size={$1} className="w-$1 h-$1 lg:w-$2 lg:h-$2 flex-shrink-0"'
        
        # Pattern 3: size={N} xl:size={M}
        $content = $content -replace 'size=\{(\d+)\}\s+xl:size=\{(\d+)\}', 'size={$1} className="w-$1 h-$1 xl:w-$2 xl:h-$2 flex-shrink-0"'
        
        # Pattern 4: className + size + md:size (cas complexes)
        $content = $content -replace 'className="([^"]*)"\s+size=\{(\d+)\}\s+md:size=\{(\d+)\}', 'className="$1 w-$2 h-$2 md:w-$3 md:h-$3 flex-shrink-0" size={$2}'
        
        Set-Content $file $content -Encoding UTF8 -NoNewline
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Fichier non trouvé: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Corrections JSX terminées!" -ForegroundColor Green
