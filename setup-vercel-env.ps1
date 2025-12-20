# Configurar variaveis de ambiente na Vercel
Write-Host "Configurando variaveis na Vercel..." -ForegroundColor Cyan

if (-Not (Test-Path ".env.local")) {
    Write-Host "Erro: .env.local nao encontrado!" -ForegroundColor Red
    exit 1
}

$envVars = Get-Content .env.local | Where-Object { 
    $_ -match '^[A-Z]' -and $_ -notmatch '^#'
}

$count = 0

foreach ($line in $envVars) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $value = $value -replace '^["'']|["'']$', ''
        
        Write-Host "Adicionando: $key"
        
        $value | vercel env add $key production --force
        $value | vercel env add $key preview --force  
        $value | vercel env add $key development --force
        
        $count++
    }
}

Write-Host ""
Write-Host "Concluido! $count variaveis adicionadas." -ForegroundColor Green
Write-Host "Execute: vercel --prod" -ForegroundColor Cyan
