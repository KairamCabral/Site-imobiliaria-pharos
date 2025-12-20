# Listar códigos de todos os imóveis DWV
$token = "4b3e322a7773c8b3498606ed5d086a613171c65d542acbacd41b41af51d1d59a"
$url = "https://agencies.dwvapp.com.br/integration/properties?limit=28"

try {
    $headers = @{
        "Accept" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    
    Write-Host "=== Códigos DWV (Total: $($response.total)) ===" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($prop in $response.data) {
        $displayCode = if ($prop.code) { $prop.code } else { "(vazio)" }
        $unitTitle = if ($prop.unit) { $prop.unit.title } else { "(sem unit)" }
        
        Write-Host "ID: $($prop.id)" -ForegroundColor Yellow -NoNewline
        Write-Host " | Code: $displayCode" -ForegroundColor Green -NoNewline
        Write-Host " | Title: $($prop.title)" -ForegroundColor White -NoNewline
        Write-Host " | Unit: $unitTitle" -ForegroundColor Cyan
    }
    
} catch {
    Write-Error $_.Exception.Message
}

