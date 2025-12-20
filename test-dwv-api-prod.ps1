# Script para testar DWV API PRODUÇÃO e salvar resposta
# Execução: .\test-dwv-api-prod.ps1

$token = "4b3e322a7773c8b3498606ed5d086a613171c65d542acbacd41b41af51d1d59a"
$url = "https://agencies.dwvapp.com.br/integration/properties?limit=5"

Write-Host "=== Testando DWV API (PRODUÇÃO) ===" -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host "Token: $token" -ForegroundColor Gray
Write-Host ""

try {
    $headers = @{
        "Accept" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "Fazendo requisição..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers -ContentType "application/json"
    
    Write-Host "✓ Sucesso! Resposta recebida." -ForegroundColor Green
    Write-Host ""
    
    # Salvar resposta em arquivo JSON
    $response | ConvertTo-Json -Depth 10 | Out-File -FilePath "dwv-response-prod.json" -Encoding UTF8
    
    Write-Host "✓ Resposta salva em: dwv-response-prod.json" -ForegroundColor Green
    Write-Host ""
    
    # Mostrar resumo
    if ($response -is [array]) {
        Write-Host "Total de imóveis retornados: $($response.Count)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Primeiros imóveis:" -ForegroundColor Cyan
        $response | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - ID: $($_.id) | Código: $($_.code) | Título: $($_.title)" -ForegroundColor White
        }
    } else {
        Write-Host "Estrutura de resposta:" -ForegroundColor Cyan
        $response | Format-List | Out-String | Write-Host
    }
    
    Write-Host ""
    Write-Host "=== Teste concluído com sucesso ===" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Erro na requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code:" -ForegroundColor Yellow
    Write-Host $_.Exception.Response.StatusCode.value__ -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $_.Exception.Response | Format-List | Out-String | Write-Host
}

