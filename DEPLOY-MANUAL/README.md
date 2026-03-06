# 📦 Deploy Manual - Edge Function Supabase

## 📋 Arquivos Necessários

Você precisa fazer upload de **4 arquivos** para a Edge Function "server" no Supabase:

### ✅ Arquivos Inclusos (copie deste diretório)

1. **index.tsx** - Arquivo principal com todas as rotas (1091 linhas)
2. **types.ts** - Definições de tipos TypeScript (arquivo único consolidado)
3. **email.tsx** - Sistema de envio de emails
4. **fcm.ts** - Notificações push (desabilitado)

### ⚠️ Arquivo Protegido (NÃO MODIFICAR)

- **kv_store.tsx** - Este arquivo já existe no Supabase e NÃO deve ser modificado

---

## 🌐 Como Fazer Upload via Dashboard

### Opção 1: Upload Individual de Arquivos

1. **Acesse o Dashboard:**
   ```
   https://supabase.com/dashboard/project/myuxgszvueycsutgojnp/functions
   ```

2. **Selecione a function "server"**

3. **Clique em "Edit" ou "Code Editor"**

4. **Para cada arquivo:**
   - Abra o arquivo correspondente deste diretório
   - Copie todo o conteúdo (Ctrl+A, Ctrl+C)
   - No editor do Supabase, crie ou edite o arquivo
   - Cole o conteúdo (Ctrl+V)
   - Salve

5. **Deploy:**
   - Clique em "Deploy" ou "Save & Deploy"
   - Aguarde a confirmação
   - Aguarde 30-60 segundos para propagação

---

### Opção 2: Upload via ZIP (Se Disponível)

1. **Compacte todos os 4 arquivos em um ZIP:**
   ```
   server.zip
   ├── index.tsx
   ├── types.ts
   ├── email.tsx
   └── fcm.ts
   ```

2. **No dashboard do Supabase:**
   - Procure por uma opção "Upload" ou "Import"
   - Faça upload do ZIP
   - Ou extraia e cole cada arquivo individualmente

---

### Opção 3: Via Editor de Código Direto

Se o Supabase permitir editar múltiplos arquivos:

1. **Acesse o editor de código da function**

2. **Estrutura de diretórios esperada:**
   ```
   /supabase/functions/server/
   ├── index.tsx        ← SUBSTITUIR com novo código
   ├── types.ts         ← SUBSTITUIR com novo código
   ├── email.tsx        ← SUBSTITUIR com novo código
   ├── fcm.ts           ← SUBSTITUIR com novo código
   └── kv_store.tsx     ← NÃO MODIFICAR (protegido)
   ```

3. **Substitua cada arquivo (exceto kv_store.tsx)**

4. **Salve e faça deploy**

---

## ⚙️ O Que Foi Atualizado

### ✅ Mudanças Principais

1. **CORS Configurado:**
   - Agora aceita requisições POST, PUT, DELETE
   - Headers Authorization e Content-Type permitidos
   - Origem `*` (aceita todas)

2. **Rotas Limpas:**
   - Removido prefixo `/make-server-b2c42f95/`
   - Todas as rotas agora são diretas: `/health`, `/signin`, `/setup`, etc.

3. **21 Rotas Disponíveis:**
   - `/health` - Health check
   - `/signin` - Login
   - `/me` - Verificar sessão
   - `/setup` - Setup inicial
   - `/stores` - Lojas
   - `/users` - Usuários
   - `/requests` - Solicitações
   - `/approvals` - Aprovações
   - `/reports/monthly` - Relatórios
   - `/stats` - Estatísticas
   - `/admin/clear-requests` - Limpar dados
   - `/save-fcm-token` - Salvar token FCM
   - `/remove-fcm-token` - Remover token FCM

---

## 🧪 Testar Após Deploy

### 1. Health Check

Abra no navegador:
```
https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/health
```

**Resposta esperada:**
```json
{"status":"ok"}
```

### 2. Executar Setup

Abra o arquivo `test-new-deployment.html` (na raiz do projeto) e:
- Clique em "⚙️ Executar Setup"
- Deve criar 11 usuários e 9 lojas

### 3. Testar Login

No mesmo arquivo de teste:
- Clique em "🔐 Testar Login (Admin)"
- Deve retornar dados do usuário admin

### 4. Diagnóstico Completo

- Clique em "🔍 Executar Diagnóstico Completo"
- Deve mostrar: "✅ TUDO FUNCIONANDO PERFEITAMENTE!"

---

## 📝 Checklist de Deploy

- [ ] Copiei o arquivo **index.tsx**
- [ ] Copiei o arquivo **types.ts**
- [ ] Copiei o arquivo **email.tsx**
- [ ] Copiei o arquivo **fcm.ts**
- [ ] **NÃO modifiquei** o arquivo kv_store.tsx
- [ ] Fiz o deploy no dashboard
- [ ] Aguardei 30-60 segundos
- [ ] Testei o health check
- [ ] Health check retornou `{"status":"ok"}`
- [ ] Executei o setup
- [ ] Testei o login
- [ ] Tudo está funcionando

---

## 🆘 Problemas Comuns

### Erro: "Failed to fetch" no Setup

**Causa:** CORS não foi atualizado corretamente

**Solução:**
1. Verifique se o arquivo `index.tsx` foi atualizado
2. Confirme que a configuração CORS está presente (linhas 13-20)
3. Refaça o deploy
4. Aguarde 1-2 minutos

---

### Erro: "Module not found: kv_store.tsx"

**Causa:** Você tentou modificar ou remover kv_store.tsx

**Solução:**
1. NÃO modifique o arquivo kv_store.tsx
2. Ele já existe no Supabase
3. Apenas atualize os outros 4 arquivos

---

### Health Check retorna 404

**Causa:** O deploy não foi concluído

**Solução:**
1. Aguarde mais 1-2 minutos
2. Limpe o cache do navegador
3. Tente em aba anônima
4. Verifique os logs da function no dashboard

---

### Setup retorna erro 500

**Causa:** Erro no código ou variáveis de ambiente

**Solução:**
1. Veja os logs da function no dashboard
2. Verifique se as variáveis de ambiente estão configuradas
3. Confirme que todos os 4 arquivos foram copiados corretamente

---

## 📊 Ver Logs

No dashboard do Supabase:
1. Vá para: https://supabase.com/dashboard/project/myuxgszvueycsutgojnp/functions/server/logs
2. Ou clique em "Logs" na página da function
3. Veja os erros em tempo real

---

## ✅ Após Deploy Bem-Sucedido

1. O health check deve retornar `{"status":"ok"}`
2. Execute o setup para criar usuários e lojas
3. Faça login com:
   - Email: `admin@oticascarol.com.br`
   - Senha: `admin123`
4. Comece a usar o sistema! 🎉

---

## 📞 Resumo Rápido

```bash
# 4 Arquivos para copiar:
1. index.tsx      → Substitui o existente
2. types.ts       → Substitui o existente
3. email.tsx      → Substitui o existente
4. fcm.ts         → Substitui o existente

# 1 Arquivo para NÃO tocar:
❌ kv_store.tsx   → NÃO MODIFICAR!

# Depois:
✅ Deploy
⏱️  Aguarda 30-60s
🧪 Testa health check
⚙️  Executa setup
🔐 Faz login
🎉 Usa o sistema!
```

---

**Boa sorte com o deploy! 🚀**