# Buscar 1 imóvel DWV e mostrar estrutura de código
$token = "4b3e322a7773c8b3498606ed5d086a613171c65d542acbacd41b41af51d1d59a"
$url = "https://agencies.dwvapp.com.br/integration/properties?limit=1"

try {
    $headers = @{
        "Accept" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    $first = $response.data[0]
    
    Write-Host "=== Estrutura DWV ===" -ForegroundColor Cyan
    Write-Host "ID: $($first.id)" -ForegroundColor Yellow
    Write-Host "Code: $($first.code)" -ForegroundColor Yellow
    Write-Host "Title: $($first.title)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Unit:" -ForegroundColor Green
    if ($first.unit) {
        Write-Host "  ID: $($first.unit.id)" -ForegroundColor White
        Write-Host "  Title: $($first.unit.title)" -ForegroundColor White
        Write-Host "  Type: $($first.unit.type)" -ForegroundColor White
    } else {
        Write-Host "  (null)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Building:" -ForegroundColor Green
    if ($first.building) {
        Write-Host "  ID: $($first.building.id)" -ForegroundColor White
        Write-Host "  Title: $($first.building.title)" -ForegroundColor White
    } else {
        Write-Host "  (null)" -ForegroundColor Gray
    }
    
} catch {
    Write-Error $_.Exception.Message
}

