$BackendUrl = "http://localhost:9000/api"

# 1. AUTHENTIFICATION
Write-Host "🔐 Auth Master en cours..." -ForegroundColor Cyan
$loginBody = @{ email = "ab.thiongane@qualisoft.sn"; password = "mohamed1965ab1711@@@" } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "$BackendUrl/auth/login" -Method Post -Body $loginBody -Headers @{"Content-Type" = "application/json" }
$token = $auth.access_token
Write-Host "✅ Jeton Master : OK" -ForegroundColor Green

# 2. PROVISIONING SAGAM
Write-Host "🚀 Provisioning SAGAM en cours..." -ForegroundColor Cyan
$provBody = @{ companyName = "SAGAM International"; domain = "sagam"; admin1Email = "admin.sagam@sagam.sn"; admin2Email = "it.manager@sagam.sn" } | ConvertTo-Json
$headers = @{ "Content-Type" = "application/json"; "Authorization" = "Bearer $token" }

$result = Invoke-RestMethod -Uri "$BackendUrl/super-admin/provisioning/deploy" -Method Post -Body $provBody -Headers $headers

# 3. RÉSULTAT
Write-Host "`n===============================================" -ForegroundColor Yellow
Write-Host " ✅ NOEUD SAGAM DÉPLOYÉ AVEC SUCCÈS" -ForegroundColor Green
Write-Host " 📍 ID : $($result.tenantId)"
Write-Host " 🌐 URL : $($result.domain).qualisoft.sn"
Write-Host "===============================================" -ForegroundColor Yellow