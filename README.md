# 👓 Óticas Carol - Sistema de Controle Operacional

Sistema web completo (dashboard administrativo) para controle operacional e financeiro das franquias Óticas Carol.

## 🎯 Funcionalidades

### 📋 Módulos Principais

- **Solicitação de Serviços**: Pedidos de montagem e motoboy
- **Aprovação Centralizada**: Fluxo de aprovação/reprovação por aprovadores
- **Extrato Mensal**: Relatórios detalhados por loja com exportação PDF/Excel
- **Gestão de Usuários**: Administração de usuários e permissões

### 👥 Perfis de Usuário

1. **Loja** - Criar solicitações e visualizar histórico da própria loja
2. **Aprovadores** - Aprovar/reprovar solicitações e gerenciar usuários
3. **Visualização Financeira** - Acesso aos relatórios financeiros

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Estilo**: Tailwind CSS v4
- **Backend**: Supabase Edge Functions (Hono)
- **Database**: Supabase KV Store
- **PDF**: jsPDF + jspdf-autotable

## 💻 Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- npm ou pnpm

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### Build para Produção

```bash
npm run build
```

## 🔐 Usuários Padrão

### Aprovadores
- `admin@oticascarol.com.br` / `admin123`
- `chris@oticascarol.com.br` / `chris123`

### Lojas (exemplos)
- `loja1640@oticascarol.com.br` / `senha123` (Frei Caneca)
- `loja1687@oticascarol.com.br` / `senha123` (Center 3)
- `loja1688@oticascarol.com.br` / `senha123` (Villalobos)

## 📚 Estrutura do Projeto

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx              # Componente principal
│   │   └── components/          # Componentes React
│   ├── lib/
│   │   ├── api.ts               # Cliente API
│   │   ├── notifications.ts     # Sistema de notificações
│   │   └── pushNotifications.ts # Push notifications (web)
│   ├── styles/                  # Estilos CSS
│   └── types.ts                 # Tipos TypeScript
├── supabase/
│   └── functions/
│       └── server/              # Backend (Hono)
│           ├── index.tsx        # Rotas principais
│           ├── fcm.ts           # Push notifications (disabled)
│           └── kv_store.tsx     # Database helpers
└── package.json
```

## 🌐 Deployment

O sistema está configurado para deploy no Figma Make com backend Supabase.

### Variáveis de Ambiente Necessárias

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `DB_PASSWORD`

## 📝 Configuração Inicial

Para popular o banco de dados com usuários e lojas padrão:

```bash
# POST request para o endpoint setup
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/make-server-b2c42f95/setup \
  -H "Content-Type: application/json" \
  -d '{"masterPassword": "setup123"}'
```

Ou acesse: `https://[URL]/setup.html`

## 🎨 Design System

- **Cores**: Neutras e corporativas
- **Componentes**: Radix UI + shadcn/ui
- **Responsivo**: Mobile-first design
- **Ícones**: Lucide React

## 📊 Features Destacadas

### 💰 Controle Financeiro
- Rastreamento detalhado de custos
- Separação entre cobrado/não cobrado do cliente
- Relatórios mensais por loja e tipo de serviço

### ✅ Fluxo de Aprovação
- Aprovação/reprovação centralizada
- Observações em cada aprovação
- Histórico completo de ações

### 📈 Dashboard Intuitivo
- Cards com estatísticas em tempo real
- Gráficos de custos mensais
- Visualização rápida de pendências

### 📄 Exportação
- **PDF**: Relatórios formatados profissionalmente
- **Excel**: Dados brutos para análise

## 🆘 Suporte

Para dúvidas ou problemas, acesse a seção "Ajuda" dentro do sistema.

---

**Desenvolvido para Óticas Carol** 👓
