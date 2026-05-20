Write-Host "=== BATTLE BARBER - DEPLOY AUTOMATICO ===" -ForegroundColor Cyan

# 1. Build
Write-Host "[1/4] Rodando npm run build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Build falhou. Deploy cancelado." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Build concluido com sucesso!" -ForegroundColor Green

# 2. Git Add
Write-Host "[2/4] Adicionando arquivos ao git..." -ForegroundColor Yellow
git add .
Write-Host "[OK] Arquivos adicionados." -ForegroundColor Green

# 3. Git Commit
Write-Host "[3/4] Criando commit..." -ForegroundColor Yellow
git commit -m "Colocar a versao"
Write-Host "[OK] Commit criado." -ForegroundColor Green

# 4. Git Push
Write-Host "[4/4] Enviando para GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Push falhou. Verifique o git status." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Push realizado com sucesso!" -ForegroundColor Green

# 5. Webhook Deploy
Write-Host "[5/5] Acionando deploy no servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://72.62.138.244:3000/api/deploy/37c4f6aa10c6c124cdad9dc7937d41d62000606d27dea080" -Method GET -TimeoutSec 120 -ErrorAction Stop
    Write-Host "[OK] Deploy acionado! Resposta: $response" -ForegroundColor Green
} catch {
    Write-Host "[AVISO] Webhook respondeu: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== DEPLOY FINALIZADO ===" -ForegroundColor Cyan
