# Verificar total de imóveis disponíveis na API DWV
$token = "4b3e322a7773c8b3498606ed5d086a613171c65d542acbacd41b41af51d1d59a"

try {
    $headers = @{
        "Accept" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "=== Consultando API DWV ===" -ForegroundColor Cyan
    Write-Host ""
    
    # Primeira consulta para pegar total
    $url1 = "https://agencies.dwvapp.com.br/integration/properties?limit=1&page=1"
    $response1 = Invoke-RestMethod -Uri $url1 -Method Get -Headers $headers
    
    Write-Host "Total de imóveis disponíveis:" -ForegroundColor Yellow -NoNewline
    Write-Host " $($response1.total)" -ForegroundColor Green
    Write-Host "Última página:" -ForegroundColor Yellow -NoNewline
    Write-Host " $($response1.lastPage)" -ForegroundColor Green
    Write-Host "Por página:" -ForegroundColor Yellow -NoNewline
    Write-Host " $($response1.perPage)" -ForegroundColor Green
    Write-Host ""
    
    # Consulta com limite maior
    $url2 = "https://agencies.dwvapp.com.br/integration/properties?limit=100&page=1"
    $response2 = Invoke-RestMethod -Uri $url2 -Method Get -Headers $headers
    
    Write-Host "Imóveis retornados (limit=100):" -ForegroundColor Yellow -NoNewline
    Write-Host " $($response2.data.Count)" -ForegroundColor Green
    Write-Host ""
    
    # Lista alguns IDs
    Write-Host "Primeiros 10 IDs:" -ForegroundColor Cyan
    $response2.data | Select-Object -First 10 | ForEach-Object {
        Write-Host "  P$($_.id) - $($_.title)" -ForegroundColor White
    }
    
} catch {
    Write-Error $_.Exception.Message
}

