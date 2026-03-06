# ⚡ Início Rápido - Configuração Supabase

## 🎯 Objetivo
Configurar o backend do sistema Óticas Carol no Supabase para que o login funcione.

## 📋 Checklist Rápido

### ✅ Etapa 1: Instalar Ferramentas
```bash
npm install -g supabase
```

### ✅ Etapa 2: Login no Supabase
```bash
supabase login
```

### ✅ Etapa 3: Deploy Automático

**Windows (PowerShell):**
```powershell
.\deploy-supabase.ps1
```

**macOS/Linux (Bash):**
```bash
chmod +x deploy-supabase.sh
./deploy-supabase.sh
```

### ✅ Etapa 4: Verificar
Abra no navegador:
```
https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/health
```

Deve retornar: `{"status":"ok"}`

### ✅ Etapa 5: Setup Inicial
1. Acesse o app com `?setup=true` na URL
2. Clique em "Testar Conexão com Backend" 
3. Se online, clique em "Executar Setup Completo"

### ✅ Etapa 6: Login
Use as credenciais:
- **Email:** admin@oticascarol.com.br
- **Senha:** admin123

---

## 🚨 Problemas Comuns

### "supabase: command not found"
**Solução:** Instale o CLI do Supabase
```bash
npm install -g supabase
```

### "Project not linked"
**Solução:** O script de deploy vai perguntar se você quer vincular. Responda "s" (sim).

### "Failed to fetch"
**Solução:** 
1. Execute o script de deploy
2. Verifique se o health check retorna OK
3. Consulte `/DIAGNOSTICO-BACKEND.md`

### "E-mail ou senha incorretos"
**Solução:** Execute o setup primeiro (`?setup=true`)

---

## 📚 Documentação Completa

Se você precisar de mais detalhes ou tiver problemas:

- **Configuração detalhada:** `/CONFIGURACAO-SUPABASE.md`
- **Diagnóstico de erros:** `/DIAGNOSTICO-BACKEND.md`
- **Teste de backend:** `/test-backend.html`

---

## 🎯 Resumo em 3 Comandos

```bash
# 1. Instalar CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Deploy (Windows)
.\deploy-supabase.ps1

# 3. Deploy (Mac/Linux)
./deploy-supabase.sh
```

Depois acesse o app com `?setup=true` e siga as instruções!

---

## ℹ️ Informações Úteis

- **Project ID:** myuxgszvueycsutgojnp
- **Backend URL:** https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server
- **Dashboard:** https://supabase.com/dashboard/project/myuxgszvueycsutgojnp

---

**💡 Dica:** Se você é novo no Supabase, comece executando o script de deploy. Ele vai te guiar por todo o processo!