# Spec: Melhoria Completa — Óticas Carol App

**Data:** 2026-04-10  
**Status:** Aprovado  
**Abordagem:** Redesign Incremental (Abordagem A)

---

## Visão Geral

Renovação completa da aplicação de gestão de franquias Óticas Carol em 4 fases, priorizando fundação técnica antes de visual, com entregas incrementais. O sistema continua usando o KV store existente (sem migração de dados) e adiciona email via Resend como novo canal de notificação.

---

## Decisões de Design

| Decisão | Escolha |
|---|---|
| Identidade visual | Neutro Profissional (cinza escuro + branco puro, shadows sutis) |
| Navegação web | Sidebar fixa (210px) |
| Navegação mobile | Bottom nav persistente (5 itens) |
| Ícones | Lucide React (já instalado) |
| Email | Resend (suporte nativo a Deno) |
| Banco de dados | KV store mantido sem migração |
| Estratégia | Redesign incremental — lógica preservada, visual renovado |

---

## Fase 1 — Fundação Visual + Engenharia

**Objetivo:** corrigir o que está quebrado e estabelecer a base para as demais fases.

### CSS / Tailwind v4
- Migrar `src/styles/index.css` de `@tailwind base/components/utilities` para `@import "tailwindcss"`
- Definir tokens CSS customizados em `theme.css`: cores, espaçamento, border-radius, shadows
- Validar build e dev server com estilos funcionando

### Layout e Navegação
- Criar componente `Sidebar` (210px, fundo `#111827`) com itens: Dashboard, Solicitações, Aprovações, Relatórios, Administração
- Sidebar exibe badge numérico vermelho em Solicitações quando há pendentes
- Rodapé da sidebar: avatar do usuário logado, nome, cargo e botão de logout
- Criar componente `BottomNav` com 5 itens usando ícones Lucide: LayoutDashboard, ClipboardList, CheckSquare, BarChart2, Settings
- `BottomNav` exibe badge de pendentes no item Pedidos
- Breakpoint de colapso: `< 768px` oculta sidebar e exibe BottomNav
- Remover Navigation.tsx atual e substituir pela nova estrutura

### Ícones
- Substituir todos os emojis e ícones ad-hoc por ícones Lucide React
- Padrão: `size={16}` na sidebar, `size={18}` na bottom nav, `size={14}` em tabelas e formulários

### Tipo Sedex
- Adicionar `'sedex'` ao tipo `Request.type` em `src/types.ts` e `supabase/functions/server/types.ts`
- Atualizar dropdown de criação de solicitação em `NewRequest.tsx`
- Atualizar labels e filtros em `RequestsList.tsx`, `ApprovalPanel.tsx`, `MonthlyReport.tsx`

### Solicitações Reprovadas — Visibilidade
- Solicitações com `status: 'rejected'` agora sempre visíveis na lista do solicitante e do admin
- Linha reprovada: fundo `#fff9f9`, borda lateral vermelha
- Dropdown expandido mostra seção "Motivo da Reprovação" em destaque vermelho

### Email via Resend
- Instalar `resend` como dependência do servidor Deno
- Criar `supabase/functions/server/email.ts` com funções:
  - `sendNewRequestEmail(request, approverEmail)` → email para aprovador
  - `sendApprovedEmail(request, requesterEmail)` → email para solicitante
  - `sendRejectedEmail(request, requesterEmail, reason)` → email para solicitante com motivo
- Templates HTML simples: logo + tabela de detalhes + CTA + footer
- Disparar após cada ação nas rotas `POST /requests` e `POST /approvals`
- Email do usuário disponível no KV store via `user:{id}`

### Engenharia
- Adicionar `ErrorBoundary` global em `App.tsx` com tela amigável
- Corrigir assinatura de `notifyRequestApproved` em `ApprovalPanel.tsx` (mismatch detectado)
- Quebrar `UserAdmin.tsx` (579 LOC) em: `UserAdminPage.tsx`, `UserTable.tsx`, `UserForm.tsx`, `StoreTable.tsx`, `StoreForm.tsx`
- Quebrar `MonthlyReport.tsx` (499 LOC) em: `MonthlyReportPage.tsx`, `ReportFilters.tsx`, `ReportTotals.tsx`, `ReportTable.tsx`

---

## Fase 2 — Dashboard + Fluxo de Solicitações

### Dashboard
- Cards de estatísticas: Pendentes (destaque âmbar), Aprovados, Reprovados, Total aprovado no mês
- Cada card com ícone Lucide relevante no canto superior direito
- Tabela "Últimas solicitações" com colunas: Loja, Tipo, Valor, Data, OS, Status
- Botão "Nova Solicitação" no header da página

### Lista de Solicitações
- Filtros rápidos por status: Todas / Pendentes / Aprovadas / Reprovadas (chips horizontais)
- Contador de registros no header da tabela
- **Dropdown por linha:** clique em qualquer parte da linha expande/recolhe
  - Chevron (`ChevronRight`) rotaciona 90° com transição CSS
  - Apenas um dropdown aberto por vez
  - Conteúdo do dropdown: seção Detalhes (chips), Justificativa, Observação do Aprovador
  - Aprovadas: fundo azulado `#f8faff`, observação em verde
  - Reprovadas: fundo avermelhado `#fff5f5`, motivo em vermelho
  - Pendentes: sem seção de observação

### Formulário de Nova Solicitação
**Campos (todos exportados no relatório):**
1. Tipo de Serviço — select: Montagem / Motoboy / Sedex
2. Nº OS — input texto
3. Valor do Serviço — input numérico (formatado em BRL)
4. Data do Serviço — date picker
5. Justificativa — textarea
6. Cobrado do Cliente — toggle sim/não

- Usuário do tipo `store` tem loja pré-selecionada automaticamente
- Validação em todos os campos obrigatórios antes de enviar
- Ao enviar: POST `/requests` + disparo de email ao aprovador + push FCM

### Painel de Aprovação
- Card por solicitação com: cabeçalho (loja, tipo, solicitante, tempo), chips de detalhes, justificativa
- Campo de observação (obrigatório para reprovar, opcional para aprovar)
- Botões: Aprovar (verde suave) e Reprovar (vermelho suave)
- Ao agir: PUT `/requests/:id` + POST `/approvals` + email + push FCM ao solicitante

---

## Fase 3 — Relatórios + Admin

### Relatórios Mensais
**Filtros:**
- Mês (select com meses disponíveis)
- Loja (todas ou específica)
- Tipo (todos / Montagem / Motoboy / Sedex)
- Status (todos / Aprovadas / Reprovadas)

**Cards de totais por tipo** (com borda colorida lateral):
- Montagem — índigo `#6366f1`
- Motoboy — âmbar `#f59e0b`
- Sedex — verde `#10b981`
- Total Aprovado — preto `#111827`

**Tabela com colunas exportadas:**
Loja · Tipo · OS · Data · Valor · Cobrado do Cliente · Solicitante · Observação · Status

**Exportação:**
- PDF via jsPDF (já instalado): cabeçalho com logo + filtros aplicados + tabela + totais
- Excel via biblioteca existente

### Admin — separado em abas

**Aba Usuários:**
- Busca por nome/email
- Colunas: Avatar, Nome/Email, Role (badge colorido), Loja vinculada, Ações (editar/excluir)
- Badges de role: Aprovador (roxo), Loja (azul), Visualizador (cinza)
- Formulário de criar/editar exibido em dialog modal (usando Radix Dialog já disponível)

**Aba Lojas:**
- Lista de lojas com código e nome
- Ações de criar, editar, excluir

**Componentes resultantes da quebra do UserAdmin:**
- `UserAdminPage.tsx` — orquestrador com tabs
- `UserTable.tsx` — tabela + ações
- `UserForm.tsx` — formulário criar/editar
- `StoreTable.tsx` — tabela de lojas
- `StoreForm.tsx` — formulário de loja

---

## Fase 4 — Notificações + Mobile

### Correções no FCM
- **Token refresh:** ao inicializar o app, sempre chamar `getToken()` e comparar com o token salvo; se diferente, atualizar via `POST /save-fcm-token`
- **Deep link no tap:** ao receber notificação, extrair `requestId` do payload e navegar diretamente para a solicitação
- **Web fallback:** configurar Service Worker para receber push quando o app não está em foco no browser
- **Permissão iOS:** tratar estado `denied` com UI explicativa e botão para abrir configurações do sistema

### Fluxo de Notificações — canais por evento

| Evento | Canal | Destinatário |
|---|---|---|
| Nova solicitação criada | Email + Push FCM | Aprovador |
| Solicitação aprovada | Email + Push FCM | Solicitante |
| Solicitação reprovada | Email + Push FCM | Solicitante |

### Push — conteúdo das mensagens
- **Nova:** "Nova solicitação aguarda aprovação — {Loja} · {Tipo} · R$ {valor} · OS #{os}"
- **Aprovada:** "Solicitação aprovada ✓ — {Tipo} · R$ {valor} · OS #{os} aprovada por {aprovador}"
- **Reprovada:** "Solicitação reprovada — {Tipo} · R$ {valor} · OS #{os} — toque para ver o motivo"

### Otimizações UX Mobile (Capacitor)
- Touch targets com altura mínima 44px em todos os botões interativos
- `env(safe-area-inset-*)` aplicado no BottomNav e em conteúdos próximos ao topo/base
- Pull-to-refresh na lista de solicitações via gesture nativo de scroll (implementado com handler CSS/JS no Capacitor WebView)
- Painel de aprovação mobile: campo de observação + botões Aprovar/Reprovar fixados na base da tela (sticky footer)

---

## Arquitetura de Componentes — Resultado Final

```
src/app/components/
├── layout/
│   ├── Sidebar.tsx
│   ├── BottomNav.tsx
│   └── AppShell.tsx
├── dashboard/
│   └── Dashboard.tsx
├── requests/
│   ├── RequestsList.tsx
│   ├── RequestRow.tsx          ← linha + dropdown
│   ├── RequestDropdown.tsx     ← conteúdo expandido
│   └── NewRequest.tsx
├── approvals/
│   └── ApprovalPanel.tsx
├── reports/
│   ├── MonthlyReportPage.tsx
│   ├── ReportFilters.tsx
│   ├── ReportTotals.tsx
│   └── ReportTable.tsx
├── admin/
│   ├── UserAdminPage.tsx
│   ├── UserTable.tsx
│   ├── UserForm.tsx
│   ├── StoreTable.tsx
│   └── StoreForm.tsx
└── ui/                         ← Shadcn/Radix (sem alterações)
```

```
supabase/functions/server/
├── index.tsx       ← rotas (sem reestruturação de dados)
├── email.ts        ← novo: Resend integration
├── fcm.ts          ← atualizado: token refresh, deep link payload
└── kv_store.tsx    ← sem alterações
```

---

## Restrições e Limites

- **KV store não é migrado** — estrutura de dados existente preservada integralmente
- **Sem novos campos no modelo de dados** — exceto `type: 'sedex'` no enum de tipo
- **Relatórios permanecem simples** — sem gráficos, sem períodos customizados, sem drill-down
- **Sem testes automatizados** neste ciclo — fora do escopo definido

---

## Dependências Novas

| Pacote | Uso | Instalar em |
|---|---|---|
| `resend` | Email transacional | `supabase/functions/server/` (Deno import) |

Todas as demais dependências já estão instaladas (`lucide-react`, `jspdf`, `@capacitor/*`, etc.).
