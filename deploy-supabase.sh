#!/bin/bash

# Script de Deploy - Óticas Carol Supabase Backend
# Este script automatiza o deploy da Edge Function no Supabase

echo "🚀 Óticas Carol - Deploy Supabase Backend"
echo "=========================================="
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI não está instalado!"
    echo ""
    echo "Para instalar:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Verificar se está logado
echo "🔐 Verificando login..."
if ! supabase projects list &> /dev/null
then
    echo "❌ Você não está logado no Supabase"
    echo ""
    echo "Execute primeiro:"
    echo "  supabase login"
    echo ""
    exit 1
fi

echo "✅ Login verificado"
echo ""

# Verificar se o projeto está vinculado
PROJECT_ID="myuxgszvueycsutgojnp"

echo "🔗 Verificando vínculo com o projeto..."
if ! supabase status &> /dev/null
then
    echo "⚠️  Projeto não está vinculado"
    echo ""
    read -p "Deseja vincular agora? (s/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]
    then
        echo "Vinculando ao projeto $PROJECT_ID..."
        supabase link --project-ref $PROJECT_ID
        
        if [ $? -ne 0 ]; then
            echo "❌ Falha ao vincular projeto"
            exit 1
        fi
        echo "✅ Projeto vinculado"
    else
        echo "❌ Deploy cancelado - projeto precisa estar vinculado"
        exit 1
    fi
else
    echo "✅ Projeto já está vinculado"
fi

echo ""
echo "📦 Preparando deploy da Edge Function..."
echo ""

# Verificar se o diretório existe
if [ ! -d "supabase/functions/server" ]; then
    echo "❌ Diretório supabase/functions/server não encontrado!"
    exit 1
fi

echo "📁 Arquivos encontrados:"
ls -la supabase/functions/server/
echo ""

# Fazer deploy
echo "🚀 Fazendo deploy da Edge Function 'server'..."
echo ""

supabase functions deploy server --no-verify-jwt

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Falha no deploy!"
    echo ""
    echo "Possíveis causas:"
    echo "  - Erro de sintaxe no código"
    echo "  - Problemas de permissão"
    echo "  - Conexão com a internet"
    echo ""
    echo "Verifique os logs acima para mais detalhes"
    exit 1
fi

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""

# Testar o endpoint
echo "🧪 Testando endpoint..."
echo ""

HEALTH_URL="https://$PROJECT_ID.supabase.co/functions/v1/server/health"
echo "URL: $HEALTH_URL"
echo ""

# Usar curl se disponível, caso contrário mostrar instrução
if command -v curl &> /dev/null
then
    RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL" \
        -H "Authorization: Bearer sb_publishable_Cyb7dkRd4A08p9D9I_smRg_BoN7C862")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "Status: $HTTP_CODE"
    echo "Response: $BODY"
    echo ""
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Backend está online e funcionando!"
    else
        echo "⚠️  Backend retornou status $HTTP_CODE"
        echo "Verifique os logs para mais detalhes:"
        echo "  supabase functions logs server"
    fi
else
    echo "ℹ️  Teste manual: Abra esta URL no navegador:"
    echo "  $HEALTH_URL"
    echo ""
    echo "Resposta esperada: {\"status\":\"ok\"}"
fi

echo ""
echo "=========================================="
echo "📋 Próximos passos:"
echo ""
echo "1. Acesse o app e vá para ?setup=true"
echo "2. Teste a conexão com o backend"
echo "3. Execute o setup inicial"
echo "4. Faça login com admin@oticascarol.com.br / admin123"
echo ""
echo "📚 Para mais informações, consulte:"
echo "  - CONFIGURACAO-SUPABASE.md"
echo "  - DIAGNOSTICO-BACKEND.md"
echo ""
echo "🎉 Deploy finalizado!"