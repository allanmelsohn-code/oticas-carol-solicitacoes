# 📘 Sistema Óticas Carol - Guia de Configuração

## 🎯 Começar Aqui

Bem-vindo ao sistema de controle operacional das Óticas Carol! Este guia vai te ajudar a configurar tudo do zero.

---

## 🚀 Início Rápido (3 passos)

### 1️⃣ Instalar CLI do Supabase
```bash
npm install -g supabase
```

### 2️⃣ Executar Script de Deploy

**Windows:**
```powershell
.\deploy-supabase.ps1
```

**Mac/Linux:**
```bash
chmod +x deploy-supabase.sh
./deploy-supabase.sh
```

### 3️⃣ Executar Setup Inicial
1. Acesse o app com `?setup=true` na URL
2. Clique em "Testar Conexão com Backend"
3. Se online ✅, clique em "Executar Setup Completo"

**Pronto!** Agora você pode fazer login com:
- Email: `admin@oticascarol.com.br`
- Senha: `admin123`

---

## 📚 Documentação Completa

### Para Iniciantes
- **[⚡ INICIO-CONFIGURACAO.md](INICIO-CONFIGURACAO.md)** - Guia rápido e objetivo

### Configuração Detalhada
- **[🔧 CONFIGURACAO-SUPABASE.md](CONFIGURACAO-SUPABASE.md)** - Passo a passo completo
- **[🔧 TROUBLESHOOTING-DEPLOY.md](TROUBLESHOOTING-DEPLOY.md)** - Solução de problemas de deploy

### Diagnóstico de Erros
- **[🩺 DIAGNOSTICO-BACKEND.md](DIAGNOSTICO-BACKEND.md)** - Diagnóstico de erros de backend
- **[🧪 test-backend.html](test-backend.html)** - Ferramenta de teste no navegador

### Scripts de Deploy
- **[📜 deploy-supabase.sh](deploy-supabase.sh)** - Script para Mac/Linux
- **[📜 deploy-supabase.ps1](deploy-supabase.ps1)** - Script para Windows

---

## 🗺️ Fluxo de Configuração

```
┌─────────────────────┐
│ 1. Instalar CLI     │
│    npm install -g   │
│    supabase         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Login            │
│    supabase login   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Executar Script  │
│    de Deploy        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. Verificar        │
│    Health Check     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. Executar Setup   │
│    (?setup=true)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 6. Fazer Login      │
│    e usar o sistema │
└─────────────────────┘
```

---

## ⚠️ Problemas Comuns

| Erro | Solução Rápida | Doc. Detalhada |
|------|----------------|----------------|
| "Failed to fetch" | Execute o script de deploy | [DIAGNOSTICO-BACKEND.md](DIAGNOSTICO-BACKEND.md) |
| "Command not found" | Instale o Supabase CLI | [INICIO-CONFIGURACAO.md](INICIO-CONFIGURACAO.md) |
| "E-mail ou senha incorretos" | Execute o setup (`?setup=true`) | [CONFIGURACAO-SUPABASE.md](CONFIGURACAO-SUPABASE.md) |
| "CORS error" | Limpe cache ou tente aba anônima | [TROUBLESHOOTING-DEPLOY.md](TROUBLESHOOTING-DEPLOY.md) |
| "Deploy failed" | Veja os logs: `supabase functions logs server` | [TROUBLESHOOTING-DEPLOY.md](TROUBLESHOOTING-DEPLOY.md) |

---

## 🏗️ Estrutura do Projeto

```
óticas-carol/
├── src/                          # Frontend (React)
│   ├── app/
│   │   ├── components/          # Componentes React
│   │   └── App.tsx              # App principal
│   ├── lib/
│   │   └── api.ts               # Cliente API
│   └── types.ts                 # TypeScript types
│
├── supabase/                     # Backend (Supabase)
│   ├── functions/
│   │   └── server/
│   │       ├── index.tsx        # Edge Function principal
│   │       ├── kv_store.tsx     # Banco de dados KV
│   │       ├── email.tsx        # Envio de emails
│   │       └── fcm.ts           # Push notifications
│   └── config.toml              # Configuração Supabase
│
├── deploy-supabase.sh           # Script de deploy (Mac/Linux)
├── deploy-supabase.ps1          # Script de deploy (Windows)
├── test-backend.html            # Teste de conectividade
│
└── Documentação/
    ├── INICIO-CONFIGURACAO.md
    ├── CONFIGURACAO-SUPABASE.md
    ├── DIAGNOSTICO-BACKEND.md
    └── TROUBLESHOOTING-DEPLOY.md
```

---

## 🔑 Credenciais Padrão

Após executar o setup, você terá acesso a:

### Aprovadores (Admin)
- **Email:** admin@oticascarol.com.br
- **Senha:** admin123
- **Email:** chris@oticascarol.com.br
- **Senha:** chris123

### Lojas (todas com senha: senha123)
- loja1640@oticascarol.com.br - Frei Caneca
- loja1687@oticascarol.com.br - Center 3
- loja1688@oticascarol.com.br - Villalobos
- loja2189@oticascarol.com.br - Vila Olímpia
- loja2667@oticascarol.com.br - Patio Paulista
- loja2605@oticascarol.com.br - Canário
- loja2606@oticascarol.com.br - Ibirapuera
- loja2682@oticascarol.com.br - Morumbi Town
- loja2783@oticascarol.com.br - Maracatins

---

## 🧪 Como Testar

### 1. Teste o Backend
```bash
# Via navegador
https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/health

# Via cURL
curl https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/health
```

Resposta esperada: `{"status":"ok"}`

### 2. Teste o Login
1. Abra o app
2. Tente fazer login com `admin@oticascarol.com.br` / `admin123`
3. Veja os logs no console do navegador (F12)

### 3. Teste a Funcionalidade
1. **Como Loja:** Crie uma solicitação
2. **Como Aprovador:** Aprove/rejeite a solicitação
3. **Relatório:** Gere um extrato mensal

---

## 📊 Informações do Projeto

- **Nome:** Sistema Óticas Carol
- **Project ID:** myuxgszvueycsutgojnp
- **Backend URL:** https://myuxgszvueycsutgojnp.supabase.co
- **Edge Function:** server
- **Dashboard:** https://supabase.com/dashboard/project/myuxgszvueycsutgojnp

---

## 🆘 Precisa de Ajuda?

### Antes de qualquer coisa:
1. Consulte o [Troubleshooting](TROUBLESHOOTING-DEPLOY.md)
2. Veja os logs: `supabase functions logs server`
3. Use o [test-backend.html](test-backend.html)

### Documentação por Situação:

**Nunca configurei nada ainda:**
→ [INICIO-CONFIGURACAO.md](INICIO-CONFIGURACAO.md)

**Já configurei mas deu erro:**
→ [TROUBLESHOOTING-DEPLOY.md](TROUBLESHOOTING-DEPLOY.md)

**Login não funciona:**
→ [DIAGNOSTICO-BACKEND.md](DIAGNOSTICO-BACKEND.md)

**Quero entender tudo em detalhes:**
→ [CONFIGURACAO-SUPABASE.md](CONFIGURACAO-SUPABASE.md)

---

## ✅ Checklist Completo

### Pré-Deploy
- [ ] Node.js instalado
- [ ] Supabase CLI instalado (`npm install -g supabase`)
- [ ] Conta no Supabase criada
- [ ] Acesso ao projeto `myuxgszvueycsutgojnp`

### Deploy
- [ ] Login no CLI (`supabase login`)
- [ ] Projeto vinculado (`supabase link`)
- [ ] Edge Function deployada (`supabase functions deploy server --no-verify-jwt`)
- [ ] Health check funcionando

### Configuração Inicial
- [ ] Setup executado (`?setup=true`)
- [ ] Login funciona (admin@oticascarol.com.br / admin123)
- [ ] Dashboard carrega
- [ ] Criar solicitação funciona
- [ ] Aprovar solicitação funciona

### Testes Funcionais
- [ ] Criar solicitação como loja
- [ ] Aprovar solicitação como aprovador
- [ ] Gerar relatório mensal
- [ ] Exportar PDF
- [ ] Exportar Excel
- [ ] Gerenciar usuários (admin)

---

## 🎉 Tudo Funcionando!

Parabéns! Se você chegou até aqui e tudo está funcionando, você pode:

1. **Criar usuários adicionais** via painel admin
2. **Personalizar lojas** conforme necessário
3. **Usar o sistema normalmente**

### Próximas Funcionalidades (Planejadas)
- Notificações por email (via Resend)
- Dashboard com gráficos e estatísticas
- Filtros avançados de relatórios
- Exportação customizável

---

**Desenvolvido para Óticas Carol** 🕶️