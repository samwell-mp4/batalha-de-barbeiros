Write-Host "=== BATTLE BARBER - DEPLOY AUTOMATICO ===" -ForegroundColor Cyan

# 1. Verificações pré-build
Write-Host "[1/6] Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "[ERRO] Diretorio nao e um repositorio git." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Dependencias OK." -ForegroundColor Green

# 2. Build
Write-Host "[2/6] Rodando npm run build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Build falhou. Deploy cancelado." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Build concluido com sucesso!" -ForegroundColor Green

# 3. Git Add
Write-Host "[3/6] Adicionando arquivos ao git..." -ForegroundColor Yellow
git add .
Write-Host "[OK] Arquivos adicionados." -ForegroundColor Green

# 4. Git Commit
Write-Host "[4/6] Criando commit..." -ForegroundColor Yellow
git commit -m "Colocar a versao"
Write-Host "[OK] Commit criado." -ForegroundColor Green

# 5. Git Push
Write-Host "[5/6] Enviando para GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Push falhou. Verifique o git status." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Push realizado com sucesso!" -ForegroundColor Green

# 6. Webhook Deploy
Write-Host "[6/6] Acionando deploy no servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://72.62.138.244:3000/api/deploy/37c4f6aa10c6c124cdad9dc7937d41d62000606d27dea080" -Method GET -TimeoutSec 120 -ErrorAction Stop
    Write-Host "[OK] Deploy acionado! Resposta: $response" -ForegroundColor Green
} catch {
    Write-Host "[AVISO] Webhook respondeu: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== DEPLOY FINALIZADO ===" -ForegroundColor Cyan
