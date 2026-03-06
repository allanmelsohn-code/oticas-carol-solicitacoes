# 🚀 Script de Setup Automático - Óticas Carol
# Execute este script no PowerShell após copiar os arquivos do Figma Make

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ÓTICAS CAROL - Setup Automático" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "1️⃣  Verificando Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js NÃO instalado!" -ForegroundColor Red
    Write-Host "   Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verificar package.json
Write-Host "2️⃣  Verificando package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ package.json NÃO encontrado!" -ForegroundColor Red
    Write-Host "   Copie os arquivos do Figma Make primeiro!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verificar src/
Write-Host "3️⃣  Verificando pasta src/..." -ForegroundColor Yellow
if (Test-Path "src") {
    Write-Host "✅ Pasta src/ encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ Pasta src/ NÃO encontrada!" -ForegroundColor Red
    Write-Host "   Copie os arquivos do Figma Make primeiro!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Criar index.html se não existir
Write-Host "4️⃣  Verificando index.html..." -ForegroundColor Yellow
if (Test-Path "index.html") {
    Write-Host "✅ index.html já existe" -ForegroundColor Green
} else {
    Write-Host "⚙️  Criando index.html..." -ForegroundColor Yellow
    $indexHtml = @"
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="Sistema de Gestão Óticas Carol" />
    <meta name="theme-color" content="#1e40af" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <title>Óticas Carol - Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"@
    Set-Content -Path "index.html" -Value $indexHtml
    Write-Host "✅ index.html criado" -ForegroundColor Green
}

Write-Host ""

# Criar src/main.tsx se não existir
Write-Host "5️⃣  Verificando src/main.tsx..." -ForegroundColor Yellow
if (Test-Path "src/main.tsx") {
    Write-Host "✅ src/main.tsx já existe" -ForegroundColor Green
} else {
    Write-Host "⚙️  Criando src/main.tsx..." -ForegroundColor Yellow
    $mainTsx = @"
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  console.log('Running on native platform:', Capacitor.getPlatform());
} else {
  console.log('Running on web');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@
    Set-Content -Path "src/main.tsx" -Value $mainTsx
    Write-Host "✅ src/main.tsx criado" -ForegroundColor Green
}

Write-Host ""

# Instalar dependências
Write-Host "6️⃣  Instalando dependências..." -ForegroundColor Yellow
Write-Host "   Isso pode levar 5-10 minutos..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependências instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Instalar React (peer dependency)
Write-Host "7️⃣  Instalando React..." -ForegroundColor Yellow
npm install react@18.3.1 react-dom@18.3.1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ React instalado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Aviso ao instalar React (pode ser normal)" -ForegroundColor Yellow
}

Write-Host ""

# Build
Write-Host "8️⃣  Fazendo build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no build" -ForegroundColor Red
    Write-Host "   Verifique se todos os arquivos foram copiados corretamente" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ SETUP CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📱 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure o Capacitor:" -ForegroundColor White
Write-Host "   npm run cap:init" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Adicione a plataforma Android:" -ForegroundColor White
Write-Host "   npm run cap:add:android" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Sincronize:" -ForegroundColor White
Write-Host "   npm run cap:sync" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configure o Firebase:" -ForegroundColor White
Write-Host "   - Baixe google-services.json" -ForegroundColor Gray
Write-Host "   - Copie para: android\app\google-services.json" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Abra o Android Studio:" -ForegroundColor White
Write-Host "   npm run cap:open:android" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentação completa: SETUP-LOCAL.md" -ForegroundColor Cyan
Write-Host ""
