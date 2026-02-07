# Script para gerar APK do Óticas Carol App
# Execute este script no diretório raiz do projeto (C:\Users\allan\oticas-carol-app)

Write-Host "🚀 INICIANDO BUILD DO APK - ÓTICAS CAROL APP" -ForegroundColor Green
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "capacitor.config.ts")) {
    Write-Host "❌ ERRO: Execute este script no diretório raiz do projeto!" -ForegroundColor Red
    Write-Host "   cd C:\Users\allan\oticas-carol-app" -ForegroundColor Yellow
    exit 1
}

# Verificar se a pasta android existe
if (-not (Test-Path "android")) {
    Write-Host "❌ ERRO: Pasta android não encontrada!" -ForegroundColor Red
    Write-Host "   Execute: npx cap add android" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Projeto encontrado!" -ForegroundColor Green
Write-Host ""

# Verificar se o arquivo google-services.json existe
Write-Host "📋 Verificando configuração do Firebase..." -ForegroundColor Cyan
if (-not (Test-Path "android/app/google-services.json")) {
    Write-Host "❌ ATENÇÃO: Arquivo google-services.json NÃO encontrado!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Você precisa baixar este arquivo do Firebase Console:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://console.firebase.google.com/" -ForegroundColor White
    Write-Host "   2. Selecione o projeto 'Óticas Carol'" -ForegroundColor White
    Write-Host "   3. Vá em Project Settings > Suas apps > Android" -ForegroundColor White
    Write-Host "   4. Baixe o arquivo google-services.json" -ForegroundColor White
    Write-Host "   5. Mova para: android/app/google-services.json" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($response -ne "s") {
        exit 1
    }
} else {
    Write-Host "✅ google-services.json encontrado!" -ForegroundColor Green
}
Write-Host ""

# Fazer build do projeto web
Write-Host "🔨 Building projeto web (npm run build)..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer build do projeto!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build web concluído!" -ForegroundColor Green
Write-Host ""

# Sincronizar com Capacitor
Write-Host "🔄 Sincronizando com Capacitor (npx cap sync android)..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao sincronizar com Capacitor!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Sincronização concluída!" -ForegroundColor Green
Write-Host ""

# Gerar APK Debug
Write-Host "📦 Gerando APK Debug..." -ForegroundColor Cyan
Write-Host "   (Isso pode demorar alguns minutos na primeira vez)" -ForegroundColor Yellow
Write-Host ""

Push-Location android
if (Test-Path "gradlew.bat") {
    ./gradlew.bat assembleDebug
} else {
    Write-Host "❌ gradlew.bat não encontrado!" -ForegroundColor Red
    Pop-Location
    exit 1
}
$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -ne 0) {
    Write-Host ""
    Write-Host "❌ Erro ao gerar APK!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "1. Verifique se o Java JDK está instalado (Java 17+)" -ForegroundColor White
    Write-Host "2. Verifique se o arquivo google-services.json está correto" -ForegroundColor White
    Write-Host "3. Execute: cd android && ./gradlew clean && cd .." -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "🎉 APK GERADO COM SUCESSO!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 O APK está em:" -ForegroundColor Cyan
Write-Host "   android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
Write-Host ""
Write-Host "📤 COMO INSTALAR NO CELULAR:" -ForegroundColor Cyan
Write-Host "   1. Conecte o celular via USB e ative 'Depuração USB'" -ForegroundColor White
Write-Host "   2. Copie o APK para o celular" -ForegroundColor White
Write-Host "   3. Abra o arquivo no celular e instale" -ForegroundColor White
Write-Host ""
Write-Host "   OU envie o APK por WhatsApp/Email para instalar" -ForegroundColor Yellow
Write-Host ""

# Perguntar se deseja abrir a pasta do APK
$response = Read-Host "Deseja abrir a pasta do APK? (s/n)"
if ($response -eq "s") {
    explorer "android\app\build\outputs\apk\debug\"
}

Write-Host ""
Write-Host "✅ PRONTO! Bom teste! 🚀" -ForegroundColor Green
