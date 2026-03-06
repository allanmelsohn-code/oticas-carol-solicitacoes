# 🚀 INSTRUÇÕES DE DEPLOY - Supabase Edge Function

## 📍 PASSO A PASSO SIMPLIFICADO

### 1️⃣ Acessar o Dashboard

Abra este link no navegador:
```
https://supabase.com/dashboard/project/myuxgszvueycsutgojnp
```

---

### 2️⃣ Ir para Edge Functions

No menu lateral esquerdo:
- Clique em **"Edge Functions"**
- Você verá a function chamada **"server"**
- Clique nela

---

### 3️⃣ Encontrar o Editor de Código

Procure por um dos seguintes botões/abas:
- **"Code"**
- **"Edit Function"**
- **"Source Code"**
- **"Files"**
- **"Editor"**

---

### 4️⃣ Limpar Arquivos Duplicados (IMPORTANTE!)

⚠️ **ANTES de atualizar os arquivos:**

Se você vir um arquivo chamado `types.tsx` no editor, **DELETE-O**!

Agora teremos apenas `types.ts` (arquivo consolidado).

---

### 5️⃣ Atualizar os 4 Arquivos

Você verá uma lista de arquivos. **ATUALIZE APENAS ESTES 4:**

#### ✅ Arquivo 1: `fcm.ts`
Copie TODO o conteúdo de `/supabase/functions/server/fcm.ts` e cole substituindo o conteúdo do arquivo `fcm.ts` no Supabase.

#### ✅ Arquivo 2: `types.ts` (CONSOLIDADO - ÚNICO ARQUIVO DE TIPOS)
Copie TODO o conteúdo de `/supabase/functions/server/types.ts` e cole substituindo o conteúdo do arquivo `types.ts` no Supabase.

⚠️ Este arquivo agora contém TODOS os tipos
⚠️ Não há mais `types.tsx`

#### ✅ Arquivo 3: `email.tsx`
Copie TODO o conteúdo de `/supabase/functions/server/email.tsx` e cole substituindo o conteúdo do arquivo `email.tsx` no Supabase.

#### ✅ Arquivo 4: `index.tsx` (MAIS IMPORTANTE)
Copie TODO o conteúdo de `/supabase/functions/server/index.tsx` e cole substituindo o conteúdo do arquivo `index.tsx` no Supabase.

#### ❌ NÃO MODIFIQUE: `kv_store.tsx`
**Este arquivo NÃO deve ser alterado!**

---

### 6️⃣ Fazer o Deploy

Após atualizar todos os 4 arquivos:

1. Procure pelo botão **"Deploy"**, **"Save & Deploy"** ou **"Publish"**
2. Clique nele
3. Aguarde a confirmação (pode levar 10-30 segundos)
4. **AGUARDE MAIS 30-60 SEGUNDOS** para a propagação completa

---

### 7️⃣ Testar

1. **Health Check** - Abra no navegador:
   ```
   https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/health
   ```
   
   **Deve retornar:**
   ```json
   {"status":"ok"}
   ```

2. **Setup Inicial** - Abra o arquivo `test-new-deployment.html` e:
   - Clique em **"⚙️ Executar Setup"**
   - Deve criar 11 usuários e 9 lojas

3. **Teste de Login** - No mesmo arquivo:
   - Clique em **"🔐 Testar Login (Admin)"**
   - Deve retornar os dados do admin

4. **Diagnóstico Completo**:
   - Clique em **"🔍 Executar Diagnóstico Completo"**
   - Deve mostrar "✅ TUDO FUNCIONANDO PERFEITAMENTE!"

---

## 🆘 PROBLEMAS COMUNS

### ❌ Health Check retorna 404
**Solução:**
- Aguarde mais 1-2 minutos
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Tente em aba anônima (Ctrl+Shift+N)

### ❌ Setup retorna erro CORS
**Solução:**
- Confirme que atualizou o arquivo `index.tsx` completamente
- Verifique se as linhas 13-20 do `index.tsx` têm a configuração CORS
- Refaça o deploy
- Aguarde 1-2 minutos

### ❌ Erro 500 no Setup
**Solução:**
- Vá para: https://supabase.com/dashboard/project/myuxgszvueycsutgojnp/functions/server/logs
- Veja o erro específico nos logs
- Confirme que todos os 4 arquivos foram atualizados

---

## 📋 CHECKLIST FINAL

Antes de testar, confirme:

- [ ] Atualizei o arquivo `fcm.ts`
- [ ] Atualizei o arquivo `types.ts` (CONSOLIDADO - ÚNICO ARQUIVO DE TIPOS)
- [ ] Atualizei o arquivo `email.tsx`
- [ ] Atualizei o arquivo `index.tsx` (MAIS IMPORTANTE)
- [ ] **NÃO modifiquei** o arquivo `kv_store.tsx`
- [ ] Cliquei em "Deploy"
- [ ] Aguardei a confirmação
- [ ] Aguardei 30-60 segundos adicionais
- [ ] Testei o health check
- [ ] Health check retornou `{"status":"ok"}`
- [ ] Executei o setup com sucesso
- [ ] Consegui fazer login

---

## ✅ APÓS DEPLOY BEM-SUCEDIDO

Credenciais de acesso:

**Administradores:**
- Email: `admin@oticascarol.com.br` / Senha: `admin123`
- Email: `chris@oticascarol.com.br` / Senha: `chris123`

**Loja Exemplo:**
- Email: `loja1640@oticascarol.com.br` / Senha: `senha123`

---

## 🎯 RESUMO ULTRA-RÁPIDO

```
1. Vá para: https://supabase.com/dashboard/project/myuxgszvueycsutgojnp/functions
2. Clique na function "server"
3. Clique em "Edit" ou "Code"
4. Copie e cole os 4 arquivos (fcm.ts, types.ts, email.tsx, index.tsx)
5. Clique em "Deploy"
6. Aguarde 1-2 minutos
7. Teste: https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/health
8. Execute o setup
9. Faça login
10. 🎉 Pronto!
```

---

**BOA SORTE! 🚀**

Se tiver qualquer problema, me avise e ajudo a debugar pelos logs!