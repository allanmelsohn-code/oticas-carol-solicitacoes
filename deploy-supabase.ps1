# Script de Deploy - Óticas Carol Supabase Backend (PowerShell)
# Este script automatiza o deploy da Edge Function no Supabase

Write-Host "🚀 Óticas Carol - Deploy Supabase Backend" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Supabase CLI está instalado
$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCmd) {
    Write-Host "❌ Supabase CLI não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase"
    Write-Host ""
    exit 1
}

Write-Host "✅ Supabase CLI encontrado" -ForegroundColor Green
Write-Host ""

# Verificar se está logado
Write-Host "🔐 Verificando login..." -ForegroundColor Cyan
try {
    $projectsList = supabase projects list 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
}
catch {
    Write-Host "❌ Você não está logado no Supabase" -ForegroundColor Red
    Write-Host ""
    Write-Host "Execute primeiro:" -ForegroundColor Yellow
    Write-Host "  supabase login"
    Write-Host ""
    exit 1
}

Write-Host "✅ Login verificado" -ForegroundColor Green
Write-Host ""

# Verificar se o projeto está vinculado
$PROJECT_ID = "myuxgszvueycsutgojnp"

Write-Host "🔗 Verificando vínculo com o projeto..." -ForegroundColor Cyan
try {
    $status = supabase status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not linked"
    }
    Write-Host "✅ Projeto já está vinculado" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Projeto não está vinculado" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Deseja vincular agora? (s/n)"
    
    if ($response -eq "s" -or $response -eq "S") {
        Write-Host "Vinculando ao projeto $PROJECT_ID..." -ForegroundColor Cyan
        supabase link --project-ref $PROJECT_ID
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Falha ao vincular projeto" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Projeto vinculado" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Deploy cancelado - projeto precisa estar vinculado" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Preparando deploy da Edge Function..." -ForegroundColor Cyan
Write-Host ""

# Verificar se o diretório existe
if (-not (Test-Path "supabase/functions/server")) {
    Write-Host "❌ Diretório supabase/functions/server não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Arquivos encontrados:" -ForegroundColor Cyan
Get-ChildItem "supabase/functions/server" | Format-Table Name, Length, LastWriteTime
Write-Host ""

# Fazer deploy
Write-Host "🚀 Fazendo deploy da Edge Function 'server'..." -ForegroundColor Cyan
Write-Host ""

supabase functions deploy server --no-verify-jwt

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Falha no deploy!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "  - Erro de sintaxe no código"
    Write-Host "  - Problemas de permissão"
    Write-Host "  - Conexão com a internet"
    Write-Host ""
    Write-Host "Verifique os logs acima para mais detalhes"
    exit 1
}

Write-Host ""
Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host ""

# Testar o endpoint
Write-Host "🧪 Testando endpoint..." -ForegroundColor Cyan
Write-Host ""

$HEALTH_URL = "https://$PROJECT_ID.supabase.co/functions/v1/server/health"
Write-Host "URL: $HEALTH_URL" -ForegroundColor Gray
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer sb_publishable_Cyb7dkRd4A08p9D9I_smRg_BoN7C862"
    }
    
    $response = Invoke-WebRequest -Uri $HEALTH_URL -Headers $headers -UseBasicParsing
    
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host ""
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend está online e funcionando!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Backend retornou status $($response.StatusCode)" -ForegroundColor Yellow
        Write-Host "Verifique os logs para mais detalhes:" -ForegroundColor Yellow
        Write-Host "  supabase functions logs server"
    }
}
catch {
    Write-Host "⚠️  Erro ao testar endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ℹ️  Teste manual: Abra esta URL no navegador:" -ForegroundColor Cyan
    Write-Host "  $HEALTH_URL"
    Write-Host ""
    Write-Host 'Resposta esperada: {"status":"ok"}' -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Acesse o app e vá para ?setup=true"
Write-Host "2. Teste a conexão com o backend"
Write-Host "3. Execute o setup inicial"
Write-Host "4. Faça login com admin@oticascarol.com.br / admin123"
Write-Host ""
Write-Host "📚 Para mais informações, consulte:" -ForegroundColor Cyan
Write-Host "  - CONFIGURACAO-SUPABASE.md"
Write-Host "  - DIAGNOSTICO-BACKEND.md"
Write-Host ""
Write-Host "🎉 Deploy finalizado!" -ForegroundColor Green