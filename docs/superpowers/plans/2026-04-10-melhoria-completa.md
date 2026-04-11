# Melhoria Completa — Óticas Carol App

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renovar completamente a UI/UX e engenharia do app em 4 fases incrementais, corrigindo CSS quebrado, adicionando sidebar/bottom nav, email via Resend, e melhorias de fluxo.

**Architecture:** Redesign incremental — lógica de negócio preservada, visual e estrutura de componentes renovados. KV store mantido sem migração. Cada fase entrega valor independente.

**Tech Stack:** React 18 + TypeScript + Tailwind CSS v4 + Radix UI + Lucide React + Hono/Deno (backend) + Supabase KV + Capacitor (mobile) + Resend (email)

---

## File Map

### Fase 1 — Criados
- `src/styles/tailwind.css` — corrigir diretivas v4
- `src/styles/theme.css` — adicionar tokens neutro-profissional
- `src/types.ts` — adicionar `'sedex'` ao RequestType
- `supabase/functions/server/types.ts` — idem
- `src/app/components/ErrorBoundary.tsx` — novo
- `src/app/components/layout/Sidebar.tsx` — novo
- `src/app/components/layout/BottomNav.tsx` — novo
- `src/app/components/layout/AppShell.tsx` — novo
- `src/app/App.tsx` — modificar (usar AppShell, ErrorBoundary)
- `supabase/functions/server/email.ts` — novo (Resend)
- `supabase/functions/server/index.tsx` — modificar (disparar emails)

### Fase 2 — Criados/Modificados
- `src/app/components/dashboard/Dashboard.tsx` — reescrever
- `src/app/components/requests/RequestRow.tsx` — novo
- `src/app/components/requests/RequestDropdown.tsx` — novo
- `src/app/components/requests/RequestsList.tsx` — reescrever
- `src/app/components/requests/NewRequest.tsx` — modificar (Sedex, novo UI)
- `src/app/components/approvals/ApprovalPanel.tsx` — reescrever

### Fase 3 — Criados
- `src/app/components/reports/ReportFilters.tsx` — novo
- `src/app/components/reports/ReportTotals.tsx` — novo
- `src/app/components/reports/ReportTable.tsx` — novo
- `src/app/components/reports/MonthlyReportPage.tsx` — novo (orquestrador)
- `src/app/components/admin/UserTable.tsx` — novo
- `src/app/components/admin/UserForm.tsx` — novo
- `src/app/components/admin/StoreTable.tsx` — novo
- `src/app/components/admin/StoreForm.tsx` — novo
- `src/app/components/admin/UserAdminPage.tsx` — novo (orquestrador com abas)

### Fase 4 — Modificados
- `src/lib/pushNotifications.ts` — token refresh + deep link
- `supabase/functions/server/fcm.ts` — deep link payload
- `src/app/App.tsx` — deep link navigation handler
- `src/app/components/layout/BottomNav.tsx` — safe-area + touch targets
- `src/app/components/requests/RequestsList.tsx` — pull-to-refresh
- `src/app/components/approvals/ApprovalPanel.tsx` — sticky footer mobile

---

## FASE 1 — Fundação Visual + Engenharia

---

### Task 1: Corrigir Tailwind v4 (CSS quebrado)

**Files:**
- Modify: `src/styles/tailwind.css`

- [ ] **Substituir diretivas antigas pelo import v4**

```css
/* src/styles/tailwind.css */
@import "tailwindcss";
```

- [ ] **Verificar que o dev server sobe sem erro de CSS**

```bash
cd C:/Users/allan/oticas-carol-app
npm run dev
```
Esperado: sem erro `[vite:css] Failed to load PostCSS` e a página abre com estilos aplicados.

- [ ] **Commit**

```bash
git add src/styles/tailwind.css
git commit -m "fix: migrar Tailwind v4 para @import syntax"
```

---

### Task 2: Tokens CSS — Neutro Profissional

**Files:**
- Modify: `src/styles/theme.css`

- [ ] **Adicionar tokens do design system ao final de `theme.css`** (preservar o conteúdo existente, apenas acrescentar):

```css
/* === DESIGN SYSTEM — NEUTRO PROFISSIONAL === */
:root {
  --color-sidebar-bg: #111827;
  --color-sidebar-item-active: #1f2937;
  --color-sidebar-item-hover: #1f2937;
  --color-sidebar-text: #9ca3af;
  --color-sidebar-text-active: #f9fafb;
  --color-sidebar-border: #1f2937;

  --color-surface: #f9fafb;
  --color-surface-card: #ffffff;
  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;

  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  --color-text-muted: #6b7280;
  --color-text-placeholder: #9ca3af;

  --color-accent: #111827;
  --color-accent-hover: #1f2937;

  --color-status-pending-bg: #fef9c3;
  --color-status-pending-text: #854d0e;
  --color-status-approved-bg: #dcfce7;
  --color-status-approved-text: #166534;
  --color-status-rejected-bg: #fee2e2;
  --color-status-rejected-text: #991b1b;
  --color-status-rejected-row: #fff9f9;

  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-dropdown: 0 4px 16px rgba(0,0,0,0.08);

  --sidebar-width: 210px;
  --bottomnav-height: 56px;
}
```

- [ ] **Commit**

```bash
git add src/styles/theme.css
git commit -m "feat: adicionar tokens CSS neutro-profissional"
```

---

### Task 3: ErrorBoundary global

**Files:**
- Create: `src/app/components/ErrorBoundary.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Criar `ErrorBoundary.tsx`**

```tsx
// src/app/components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md w-full shadow-sm text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Algo deu errado</h2>
            <p className="text-sm text-gray-500 mb-6">
              {this.state.error?.message ?? 'Erro inesperado. Tente recarregar a página.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={14} />
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Envolver o app com ErrorBoundary em `src/main.tsx`** (ou onde for o entry point):

Abrir `src/main.tsx` e verificar o conteúdo. Se for:
```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

Modificar para:
```tsx
import { ErrorBoundary } from './app/components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
```

- [ ] **Commit**

```bash
git add src/app/components/ErrorBoundary.tsx src/main.tsx
git commit -m "feat: adicionar ErrorBoundary global"
```

---

### Task 4: Adicionar tipo Sedex

**Files:**
- Modify: `src/types.ts`
- Modify: `supabase/functions/server/types.ts` (verificar se existe este arquivo)

- [ ] **Em `src/types.ts`, alterar a linha de RequestType:**

Encontrar:
```typescript
type RequestType = 'montagem' | 'motoboy';
```
Substituir por:
```typescript
export type RequestType = 'montagem' | 'motoboy' | 'sedex';
```

- [ ] **Verificar `supabase/functions/server/types.ts`** — se tiver definição de RequestType, fazer o mesmo.

- [ ] **Criar mapa de labels para usar em toda a app** — adicionar ao final de `src/types.ts`:

```typescript
export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  montagem: 'Montagem',
  motoboy: 'Motoboy',
  sedex: 'Sedex',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Reprovado',
};
```

- [ ] **Verificar build sem erros de TypeScript**

```bash
npm run build 2>&1 | head -30
```
Esperado: sem erros de tipo relacionados a RequestType.

- [ ] **Commit**

```bash
git add src/types.ts supabase/functions/server/types.ts
git commit -m "feat: adicionar tipo sedex ao RequestType"
```

---

### Task 5: Componente Sidebar

**Files:**
- Create: `src/app/components/layout/Sidebar.tsx`

- [ ] **Criar o componente:**

```tsx
// src/app/components/layout/Sidebar.tsx
import {
  LayoutDashboard, ClipboardList, CheckSquare,
  BarChart2, Settings, LogOut, User as UserIcon,
} from 'lucide-react';
import type { User } from '../../../types';

type View = 'dashboard' | 'requests' | 'approvals' | 'report' | 'user-admin';

interface NavItem {
  id: View;
  label: string;
  icon: React.ElementType;
  roles: Array<'store' | 'approver' | 'viewer'>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',    icon: LayoutDashboard, roles: ['store', 'approver', 'viewer'] },
  { id: 'requests',   label: 'Solicitações', icon: ClipboardList,   roles: ['store', 'approver', 'viewer'] },
  { id: 'approvals',  label: 'Aprovações',   icon: CheckSquare,     roles: ['approver'] },
  { id: 'report',     label: 'Relatórios',   icon: BarChart2,       roles: ['approver', 'viewer'] },
  { id: 'user-admin', label: 'Admin',        icon: Settings,        roles: ['approver'] },
];

const ROLE_LABELS: Record<string, string> = {
  store: 'Loja',
  approver: 'Aprovador',
  viewer: 'Visualizador',
};

interface SidebarProps {
  user: User;
  currentView: string;
  pendingCount: number;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function Sidebar({ user, currentView, pendingCount, onNavigate, onLogout }: SidebarProps) {
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <aside
      className="hidden md:flex flex-col fixed inset-y-0 left-0 z-40"
      style={{ width: 'var(--sidebar-width)', background: 'var(--color-sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'var(--color-sidebar-border)' }}>
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gray-900 text-xs font-bold">ÓC</span>
        </div>
        <div>
          <div className="text-white text-xs font-bold leading-tight">Óticas Carol</div>
          <div className="text-xs leading-tight" style={{ color: 'var(--color-sidebar-text)' }}>Gestão de Franquias</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 flex flex-col gap-0.5">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const showBadge = item.id === 'requests' && pendingCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left"
              style={{
                background: isActive ? 'var(--color-sidebar-item-active)' : 'transparent',
                color: isActive ? 'var(--color-sidebar-text-active)' : 'var(--color-sidebar-text)',
              }}
            >
              <Icon size={14} />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--color-sidebar-border)' }}>
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-sidebar-item-active)' }}>
            <UserIcon size={12} style={{ color: 'var(--color-sidebar-text)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-sidebar-text)' }}>{ROLE_LABELS[user.role]}</div>
          </div>
          <button onClick={onLogout} className="p-1 rounded hover:bg-gray-700 transition-colors" title="Sair">
            <LogOut size={13} style={{ color: 'var(--color-sidebar-text)' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Commit**

```bash
git add src/app/components/layout/Sidebar.tsx
git commit -m "feat: criar componente Sidebar"
```

---

### Task 6: Componente BottomNav

**Files:**
- Create: `src/app/components/layout/BottomNav.tsx`

- [ ] **Criar o componente:**

```tsx
// src/app/components/layout/BottomNav.tsx
import { LayoutDashboard, ClipboardList, CheckSquare, BarChart2, Settings } from 'lucide-react';
import type { User } from '../../../types';

interface BottomNavProps {
  user: User;
  currentView: string;
  pendingCount: number;
  onNavigate: (view: string) => void;
}

const ALL_ITEMS = [
  { id: 'dashboard',  label: 'Início',    icon: LayoutDashboard, roles: ['store','approver','viewer'] },
  { id: 'requests',   label: 'Pedidos',   icon: ClipboardList,   roles: ['store','approver','viewer'] },
  { id: 'approvals',  label: 'Aprovar',   icon: CheckSquare,     roles: ['approver'] },
  { id: 'report',     label: 'Relatório', icon: BarChart2,       roles: ['approver','viewer'] },
  { id: 'user-admin', label: 'Admin',     icon: Settings,        roles: ['approver'] },
] as const;

export function BottomNav({ user, currentView, pendingCount, onNavigate }: BottomNavProps) {
  const items = ALL_ITEMS.filter(i => i.roles.includes(user.role as never));

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t flex"
      style={{
        borderColor: 'var(--color-border)',
        height: 'var(--bottomnav-height)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        const showBadge = item.id === 'requests' && pendingCount > 0;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            style={{ minHeight: 44 }}
          >
            <Icon size={18} style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-placeholder)' }} />
            {showBadge && (
              <span className="absolute top-1.5 right-[calc(50%-14px)] w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
            <span
              className="text-[8px] font-medium"
              style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-placeholder)' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Commit**

```bash
git add src/app/components/layout/BottomNav.tsx
git commit -m "feat: criar componente BottomNav mobile"
```

---

### Task 7: AppShell + atualizar App.tsx

**Files:**
- Create: `src/app/components/layout/AppShell.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Criar `AppShell.tsx`:**

```tsx
// src/app/components/layout/AppShell.tsx
import type { ReactNode } from 'react';
import type { User } from '../../../types';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  user: User;
  currentView: string;
  pendingCount: number;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function AppShell({ user, currentView, pendingCount, onNavigate, onLogout, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        currentView={currentView}
        pendingCount={pendingCount}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <main
        className="transition-all"
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingBottom: 'var(--bottomnav-height)',
        }}
      >
        {/* Remove margin on mobile (sidebar hidden) */}
        <style>{`@media (max-width: 767px) { main { margin-left: 0 !important; } }`}</style>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>
      <BottomNav
        user={user}
        currentView={currentView}
        pendingCount={pendingCount}
        onNavigate={onNavigate}
      />
    </div>
  );
}
```

- [ ] **Atualizar `App.tsx` para usar AppShell e buscar pendingCount:**

Substituir o conteúdo completo de `src/app/App.tsx` por:

```tsx
import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Setup } from './components/Setup';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './components/Dashboard';
import { NewRequest } from './components/requests/NewRequest';
import { ApprovalPanel } from './components/approvals/ApprovalPanel';
import { MonthlyReportPage } from './components/reports/MonthlyReportPage';
import { RequestsList } from './components/requests/RequestsList';
import { UserAdminPage } from './components/admin/UserAdminPage';
import { Help } from './components/Help';
import { auth, getSessionId, clearSessionId, requests as requestsApi } from '../lib/api';
import { initializePushNotifications, setupPushListeners, isNativePlatform } from '../lib/pushNotifications';
import type { User } from '../types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    checkAuth();
    const params = new URLSearchParams(window.location.search);
    if (params.get('setup') === 'true') setShowSetup(true);
  }, []);

  useEffect(() => {
    if (user) fetchPendingCount();
  }, [user]);

  const checkAuth = async () => {
    try {
      const sid = getSessionId();
      if (!sid) { setLoading(false); return; }
      const result = await auth.getMe();
      setUser(result.user);
    } catch {
      clearSessionId();
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const data = await requestsApi.getAll();
      const pending = (data.requests ?? []).filter((r: { status: string }) => r.status === 'pending');
      setPendingCount(pending.length);
    } catch {
      // silently ignore
    }
  };

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setCurrentView('dashboard');
    if (isNativePlatform()) {
      initializePushNotifications().then(result => {
        if (result.success) setupPushListeners();
      });
    }
  };

  const handleLogout = () => {
    auth.signout();
    setUser(null);
    setCurrentView('dashboard');
    setPendingCount(0);
  };

  const handleNavigate = (view: string, filter?: string) => {
    setCurrentView(view);
    if (filter) setStatusFilter(filter);
    // Refresh badge on each navigation
    if (user) fetchPendingCount();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (showSetup) return <Setup />;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <>
      <AppShell
        user={user}
        currentView={currentView}
        pendingCount={pendingCount}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {currentView === 'dashboard'  && <Dashboard onNavigate={handleNavigate} />}
        {currentView === 'new-request'&& <NewRequest onCancel={() => handleNavigate('requests')} />}
        {currentView === 'approvals'  && <ApprovalPanel onActionComplete={fetchPendingCount} />}
        {currentView === 'report'     && <MonthlyReportPage />}
        {currentView === 'requests'   && <RequestsList statusFilter={statusFilter} />}
        {currentView === 'user-admin' && <UserAdminPage currentUser={user} />}
      </AppShell>
      {showHelp && <Help onClose={() => setShowHelp(false)} />}
    </>
  );
}
```

> **Nota:** Os imports de `NewRequest`, `ApprovalPanel`, `MonthlyReportPage`, `RequestsList`, `UserAdminPage` ainda apontam para caminhos que serão criados nas Fases 2 e 3. Por ora, o build pode falhar — isso será resolvido progressivamente. Para não quebrar o build agora, manter os imports dos componentes originais e apenas trocar a estrutura de layout.

- [ ] **Versão segura do App.tsx para Fase 1** (sem imports de componentes futuros):

Manter os imports originais mas trocar Navigation + main por AppShell:

```tsx
// Trocar apenas esta seção do return:
// ANTES:
//   <div className="min-h-screen bg-gray-50">
//     <Navigation ... />
//     <main className="max-w-7xl ...">...</main>
//   </div>

// DEPOIS:
return (
  <>
    <AppShell user={user} currentView={currentView} pendingCount={pendingCount}
      onNavigate={handleNavigate} onLogout={handleLogout}>
      {currentView === 'dashboard'   && <Dashboard onNavigate={handleNavigate} />}
      {currentView === 'new-request' && <NewRequest onCancel={() => handleNavigate('requests')} />}
      {currentView === 'approvals'   && <ApprovalPanel />}
      {currentView === 'report'      && <MonthlyReport />}
      {currentView === 'requests'    && <RequestsList statusFilter={statusFilter} />}
      {currentView === 'user-admin'  && user && <UserAdmin currentUser={user} />}
      {currentView === 'notifications' && <NotificationSettings />}
    </AppShell>
    {showHelp && <Help onClose={() => setShowHelp(false)} />}
  </>
);
```

Adicionar `pendingCount` e `fetchPendingCount` ao estado do App como mostrado acima.

- [ ] **Verificar app no browser — sidebar visível no desktop, bottom nav no mobile**

```bash
npm run dev
```
Abrir `http://localhost:5173` — deve aparecer sidebar escura à esquerda. Redimensionar para < 768px — deve aparecer bottom nav.

- [ ] **Commit**

```bash
git add src/app/components/layout/AppShell.tsx src/app/App.tsx
git commit -m "feat: implementar AppShell com Sidebar e BottomNav"
```

---

### Task 8: Email via Resend

**Files:**
- Create: `supabase/functions/server/email.ts`

- [ ] **Criar `email.ts`:**

```typescript
// supabase/functions/server/email.ts
import { Resend } from 'npm:resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');
const FROM = 'Óticas Carol <notificacoes@oticascarol.com.br>';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RequestEmailData {
  id: string;
  storeName: string;
  type: string;
  value: number;
  osNumber: string;
  date: string;
  justification: string;
  chargedToClient: boolean;
  requestedBy: string;
}

const TYPE_LABELS: Record<string, string> = {
  montagem: 'Montagem',
  motoboy: 'Motoboy',
  sedex: 'Sedex',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function baseTemplate(title: string, headerColor: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:32px auto;background:white;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:${headerColor};padding:16px 20px">
      <div style="color:white;font-size:13px;font-weight:700">Óticas Carol</div>
      <div style="color:rgba(255,255,255,.7);font-size:11px;margin-top:2px">${title}</div>
    </div>
    <div style="padding:20px">${bodyHtml}</div>
    <div style="padding:12px 20px;border-top:1px solid #f3f4f6;font-size:10px;color:#9ca3af">
      Óticas Carol · Sistema de Gestão · não responda este e-mail
    </div>
  </div>
</body></html>`;
}

function requestDetailsTable(req: RequestEmailData): string {
  const rows = [
    ['Loja', req.storeName],
    ['Tipo', TYPE_LABELS[req.type] ?? req.type],
    ['Valor', formatCurrency(req.value)],
    ['OS', `#${req.osNumber}`],
    ['Data', req.date],
    ['Solicitante', req.requestedBy],
    ['Cobrado do cliente', req.chargedToClient ? 'Sim' : 'Não'],
  ];
  const trs = rows.map(([k, v]) => `
    <tr>
      <td style="padding:6px 10px;font-size:11px;color:#6b7280;border-bottom:1px solid #f9fafb">${k}</td>
      <td style="padding:6px 10px;font-size:11px;color:#111827;font-weight:500;border-bottom:1px solid #f9fafb">${v}</td>
    </tr>`).join('');
  return `<table width="100%" style="background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;border-collapse:collapse;margin-bottom:16px">${trs}</table>`;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function sendNewRequestEmail(req: RequestEmailData, approverEmail: string): Promise<void> {
  const body = `
    <p style="font-size:13px;color:#374151;margin-bottom:12px">
      Uma nova solicitação aguarda sua aprovação:
    </p>
    ${requestDetailsTable(req)}
    <p style="font-size:11px;color:#6b7280;font-style:italic;margin-bottom:16px">"${req.justification}"</p>
    <a href="${Deno.env.get('APP_URL') ?? 'https://oticascarol.app'}" 
       style="display:inline-block;background:#111827;color:white;font-size:11px;font-weight:600;padding:9px 16px;border-radius:6px;text-decoration:none">
      Revisar e Aprovar →
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: approverEmail,
    subject: `Nova solicitação — ${req.storeName} · ${TYPE_LABELS[req.type] ?? req.type}`,
    html: baseTemplate('Nova solicitação aguarda aprovação', '#111827', body),
  });
}

export async function sendApprovedEmail(req: RequestEmailData, requesterEmail: string, approverName: string): Promise<void> {
  const body = `
    <p style="font-size:13px;color:#374151;margin-bottom:12px">
      Sua solicitação foi <strong style="color:#166534">aprovada</strong> por ${approverName}:
    </p>
    ${requestDetailsTable(req)}
    <a href="${Deno.env.get('APP_URL') ?? 'https://oticascarol.app'}"
       style="display:inline-block;background:#111827;color:white;font-size:11px;font-weight:600;padding:9px 16px;border-radius:6px;text-decoration:none">
      Ver Solicitação →
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: requesterEmail,
    subject: `Solicitação aprovada ✓ — OS #${req.osNumber}`,
    html: baseTemplate('Solicitação aprovada', '#16a34a', body),
  });
}

export async function sendRejectedEmail(
  req: RequestEmailData,
  requesterEmail: string,
  approverName: string,
  reason: string,
): Promise<void> {
  const body = `
    <p style="font-size:13px;color:#374151;margin-bottom:12px">
      Sua solicitação foi <strong style="color:#991b1b">reprovada</strong> por ${approverName}:
    </p>
    ${requestDetailsTable(req)}
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:10px 12px;margin-bottom:16px">
      <div style="font-size:10px;font-weight:700;color:#dc2626;margin-bottom:4px">Motivo da reprovação:</div>
      <div style="font-size:11px;color:#991b1b">${reason}</div>
    </div>
    <a href="${Deno.env.get('APP_URL') ?? 'https://oticascarol.app'}"
       style="display:inline-block;background:#dc2626;color:white;font-size:11px;font-weight:600;padding:9px 16px;border-radius:6px;text-decoration:none">
      Ver Solicitação →
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: requesterEmail,
    subject: `Solicitação reprovada — OS #${req.osNumber}`,
    html: baseTemplate('Solicitação reprovada', '#dc2626', body),
  });
}
```

- [ ] **Adicionar `RESEND_API_KEY` e `APP_URL` como secrets no Supabase Edge Functions**

```bash
# Via Supabase CLI (rodar no terminal do projeto)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
supabase secrets set APP_URL=https://oticascarol.app
```

> Se não tiver o CLI, configurar em: Supabase Dashboard → Project → Settings → Edge Functions → Secrets.

- [ ] **Commit**

```bash
git add supabase/functions/server/email.ts
git commit -m "feat: criar módulo de email via Resend"
```

---

### Task 9: Disparar emails nas rotas do servidor

**Files:**
- Modify: `supabase/functions/server/index.tsx`

- [ ] **Adicionar import do email.ts no topo de `index.tsx`:**

Após os imports existentes, adicionar:
```typescript
import { sendNewRequestEmail, sendApprovedEmail, sendRejectedEmail } from './email.ts';
```

- [ ] **Na rota `POST /requests`**, após salvar a request no KV, adicionar disparo de email:

Localizar o trecho onde a request é criada e o status retornado com sucesso. Após `await kv.set(...)`, adicionar:

```typescript
// Disparar email para todos os aprovadores
try {
  const allUsers = await getAllUsers(kv); // função auxiliar — ver abaixo
  const approvers = allUsers.filter((u: { role: string }) => u.role === 'approver');
  const emailData = {
    id: requestId,
    storeName: requestData.storeName,
    type: requestData.type,
    value: requestData.value,
    osNumber: requestData.osNumber,
    date: requestData.date,
    justification: requestData.justification,
    chargedToClient: requestData.chargedToClient,
    requestedBy: requestData.requestedBy,
  };
  await Promise.all(
    approvers.map((approver: { email: string }) =>
      sendNewRequestEmail(emailData, approver.email).catch(console.error)
    )
  );
} catch (emailErr) {
  console.error('Erro ao enviar email (não bloqueante):', emailErr);
}
```

- [ ] **Na rota `POST /approvals`**, após salvar a aprovação, adicionar:

```typescript
// Disparar email ao solicitante
try {
  const req = await getRequest(kv, approvalData.requestId); // buscar request do KV
  const requester = await getUser(kv, req.requestedBy);     // buscar usuário solicitante
  const emailData = { /* mesmos campos de cima */ };
  const approverUser = await getUser(kv, approvalData.approvedBy);

  if (approvalData.action === 'approved') {
    await sendApprovedEmail(emailData, requester.email, approverUser.name);
  } else {
    await sendRejectedEmail(emailData, requester.email, approverUser.name, approvalData.observation ?? '');
  }
} catch (emailErr) {
  console.error('Erro ao enviar email (não bloqueante):', emailErr);
}
```

> **Importante:** Os emails são disparados em bloco `try/catch` separado para nunca bloquear a resposta da API. Se o Resend falhar, a operação principal segue.

- [ ] **Criar função auxiliar `getAllUsers` dentro de `index.tsx`** (ou em `kv_store.tsx` se preferir centralizar):

```typescript
async function getAllUsers(kv: KVStore): Promise<User[]> {
  // O KV store guarda users com prefixo "user:" — listar todas as chaves
  const keys = await kv.list('user:');
  const users: User[] = [];
  for (const key of keys) {
    const u = await kv.get(key);
    if (u) users.push(JSON.parse(u));
  }
  return users;
}
```

> Verificar como o KV store existente expõe listagem de chaves por prefixo — adaptar conforme a API real do `kv_store.tsx`.

- [ ] **Deploy da Edge Function**

```bash
supabase functions deploy make-server-b2c42f95
```

- [ ] **Commit**

```bash
git add supabase/functions/server/index.tsx
git commit -m "feat: disparar emails via Resend ao criar/aprovar/reprovar solicitação"
```

---

## FASE 2 — Dashboard + Fluxo de Solicitações

---

### Task 10: Redesign do Dashboard

**Files:**
- Modify: `src/app/components/Dashboard.tsx`

- [ ] **Substituir o conteúdo de `Dashboard.tsx`:**

```tsx
// src/app/components/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, DollarSign, Plus, ChevronRight } from 'lucide-react';
import { stats as statsApi, requests as requestsApi } from '../../lib/api';
import { REQUEST_TYPE_LABELS, REQUEST_STATUS_LABELS } from '../../types';
import type { Stats, Request } from '../../types';

interface DashboardProps {
  onNavigate: (view: string, filter?: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [statsData, setStatsData] = useState<Stats | null>(null);
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsApi.get(), requestsApi.getAll()])
      .then(([s, r]) => {
        setStatsData(s.stats);
        setRecentRequests((r.requests ?? []).slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Pendentes', value: statsData?.pendingRequests ?? 0, icon: Clock, color: '#d97706', borderColor: '#fde68a', bg: '#fffbeb' },
    { label: 'Aprovados', value: statsData?.approvedRequests ?? 0, icon: CheckCircle, color: '#16a34a', borderColor: '#e5e7eb', bg: 'white' },
    { label: 'Reprovados', value: statsData?.rejectedRequests ?? 0, icon: XCircle, color: '#dc2626', borderColor: '#e5e7eb', bg: 'white' },
    { label: 'Total mês', value: statsData ? `R$${(statsData.thisMonthTotal/1000).toFixed(1)}k` : '—', icon: DollarSign, color: '#6b7280', borderColor: '#e5e7eb', bg: 'white' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-sm text-gray-400">Carregando...</div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => onNavigate('new-request')}
          className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={12} />
          Nova Solicitação
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl p-4 border" style={{ background: card.bg, borderColor: card.borderColor, boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{card.label}</span>
                <Icon size={13} style={{ color: card.color }} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recent requests */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Últimas solicitações</span>
          <button onClick={() => onNavigate('requests')} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
            Ver todas <ChevronRight size={12} />
          </button>
        </div>
        {recentRequests.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Nenhuma solicitação ainda.</div>
        ) : (
          recentRequests.map(req => (
            <div key={req.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 text-sm">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">{req.storeName}</div>
                <div className="text-xs text-gray-400">{REQUEST_TYPE_LABELS[req.type]} · OS #{req.osNumber}</div>
              </div>
              <div className="text-xs font-semibold text-gray-900 tabular-nums">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(req.value)}
              </div>
              <StatusBadge status={req.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    pending:  { bg: 'var(--color-status-pending-bg)',  text: 'var(--color-status-pending-text)' },
    approved: { bg: 'var(--color-status-approved-bg)', text: 'var(--color-status-approved-text)' },
    rejected: { bg: 'var(--color-status-rejected-bg)', text: 'var(--color-status-rejected-text)' },
  };
  const s = styles[status] ?? styles.pending;
  return (
    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
      {REQUEST_STATUS_LABELS[status as keyof typeof REQUEST_STATUS_LABELS] ?? status}
    </span>
  );
}
```

> `StatusBadge` será reutilizado nas próximas tarefas — pode ser extraído para `src/app/components/ui/StatusBadge.tsx` se preferir.

- [ ] **Verificar que o Dashboard renderiza com dados reais**

```bash
npm run dev
```

- [ ] **Commit**

```bash
git add src/app/components/Dashboard.tsx
git commit -m "feat: redesign do Dashboard com cards e tabela recente"
```

---

### Task 11: RequestRow e RequestDropdown

**Files:**
- Create: `src/app/components/requests/RequestRow.tsx`
- Create: `src/app/components/requests/RequestDropdown.tsx`

- [ ] **Criar `RequestDropdown.tsx`:**

```tsx
// src/app/components/requests/RequestDropdown.tsx
import { Calendar, DollarSign, Hash, User, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { REQUEST_TYPE_LABELS } from '../../../types';
import type { Request } from '../../../types';

interface RequestDropdownProps {
  request: Request;
  approval?: { approverName: string; observation: string; action: string; timestamp: string } | null;
}

export function RequestDropdown({ request, approval }: RequestDropdownProps) {
  const isRejected = request.status === 'rejected';
  const isApproved = request.status === 'approved';

  return (
    <div
      className="border-b"
      style={{
        background: isRejected ? '#fff5f5' : isApproved ? '#f8faff' : '#f9fafb',
        borderColor: 'var(--color-border)',
        padding: '0 12px 12px 40px',
      }}
    >
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Detalhes */}
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2">Detalhes</div>
          <div className="flex flex-wrap gap-2">
            <Chip icon={Calendar} label={request.date} />
            <Chip icon={DollarSign} label={new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(request.value)} />
            <Chip icon={Hash} label={`OS #${request.osNumber}`} />
            <Chip icon={User} label={request.requestedBy} />
            <span
              className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border"
              style={request.chargedToClient
                ? { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }
                : { background: '#fefce8', borderColor: '#fde68a', color: '#92400e' }}
            >
              {request.chargedToClient ? 'Cobrado do cliente' : 'Não cobrado do cliente'}
            </span>
            <span className="inline-flex items-center text-[10px] px-2 py-1 rounded-md border bg-gray-50 border-gray-200 text-gray-600">
              {REQUEST_TYPE_LABELS[request.type]}
            </span>
          </div>
        </div>

        {/* Justificativa */}
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            <MessageSquare size={9} /> Justificativa
          </div>
          <p className="text-xs text-gray-600 italic leading-relaxed">"{request.justification}"</p>
        </div>

        {/* Observação do aprovador */}
        {approval && (
          <div className="px-3 py-2.5">
            <div
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: isApproved ? '#16a34a' : '#dc2626' }}
            >
              {isApproved ? <CheckCircle size={9} /> : <XCircle size={9} />}
              {isApproved ? 'Observação do aprovador' : 'Motivo da reprovação'}
            </div>
            <div
              className="rounded-md p-2.5 text-xs leading-relaxed"
              style={isApproved
                ? { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }
                : { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}
            >
              <div className="font-semibold text-[10px] mb-1">
                {approval.approverName} · {approval.timestamp}
              </div>
              "{approval.observation}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border bg-gray-50 border-gray-200 text-gray-600">
      <Icon size={9} className="text-gray-400" />
      {label}
    </span>
  );
}
```

- [ ] **Criar `RequestRow.tsx`:**

```tsx
// src/app/components/requests/RequestRow.tsx
import { ChevronRight } from 'lucide-react';
import { REQUEST_TYPE_LABELS } from '../../../types';
import type { Request } from '../../../types';
import { RequestDropdown } from './RequestDropdown';

interface RequestRowProps {
  request: Request;
  isOpen: boolean;
  onToggle: () => void;
  approval?: { approverName: string; observation: string; action: string; timestamp: string } | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: 'var(--color-status-pending-bg)',  text: 'var(--color-status-pending-text)',  label: 'Pendente'  },
  approved: { bg: 'var(--color-status-approved-bg)', text: 'var(--color-status-approved-text)', label: 'Aprovado'  },
  rejected: { bg: 'var(--color-status-rejected-bg)', text: 'var(--color-status-rejected-text)', label: 'Reprovado' },
};

export function RequestRow({ request, isOpen, onToggle, approval }: RequestRowProps) {
  const s = STATUS_STYLES[request.status] ?? STATUS_STYLES.pending;
  const isRejected = request.status === 'rejected';

  return (
    <>
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 select-none"
        style={isRejected && !isOpen ? { background: '#fff9f9' } : undefined}
        onClick={onToggle}
      >
        <ChevronRight
          size={12}
          className="flex-shrink-0 text-gray-400 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
        <span className="w-20 text-xs font-medium text-gray-700 truncate">{request.storeName}</span>
        <span className="w-16 text-xs text-gray-500">{REQUEST_TYPE_LABELS[request.type]}</span>
        <span className="w-14 text-xs font-semibold text-gray-900 tabular-nums">
          {new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(request.value)}
        </span>
        <span className="w-14 text-xs text-gray-400 hidden sm:block">{request.date}</span>
        <span className="flex-1 text-xs text-gray-400 hidden md:block">OS #{request.osNumber}</span>
        <span
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: s.bg, color: s.text }}
        >
          {s.label}
        </span>
      </div>
      {isOpen && <RequestDropdown request={request} approval={approval} />}
    </>
  );
}
```

- [ ] **Commit**

```bash
git add src/app/components/requests/RequestRow.tsx src/app/components/requests/RequestDropdown.tsx
git commit -m "feat: criar RequestRow com dropdown expansível"
```

---

### Task 12: Reescrever RequestsList

**Files:**
- Create: `src/app/components/requests/RequestsList.tsx` (substitui o original)

- [ ] **Criar o novo `RequestsList.tsx`:**

```tsx
// src/app/components/requests/RequestsList.tsx
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { requests as requestsApi, approvals as approvalsApi } from '../../../lib/api';
import type { Request } from '../../../types';
import { RequestRow } from './RequestRow';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',      label: 'Todas'      },
  { id: 'pending',  label: 'Pendentes'  },
  { id: 'approved', label: 'Aprovadas'  },
  { id: 'rejected', label: 'Reprovadas' },
];

interface RequestsListProps {
  statusFilter?: string;
  onNavigate?: (view: string) => void;
}

export function RequestsList({ statusFilter = 'all', onNavigate }: RequestsListProps) {
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [approvalsMap, setApprovalsMap] = useState<Record<string, unknown>>({});
  const [filter, setFilter] = useState<Filter>((statusFilter as Filter) ?? 'all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([requestsApi.getAll(), approvalsApi?.getAll?.() ?? Promise.resolve({ approvals: [] })])
      .then(([reqRes, appRes]) => {
        setAllRequests(reqRes.requests ?? []);
        // Map approvals by requestId
        const map: Record<string, unknown> = {};
        for (const a of (appRes.approvals ?? [])) {
          map[(a as { requestId: string }).requestId] = a;
        }
        setApprovalsMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? allRequests : allRequests.filter(r => r.status === filter);

  const handleToggle = (id: string) => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Solicitações</h1>
        {onNavigate && (
          <button
            onClick={() => onNavigate('new-request')}
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={12} /> Nova Solicitação
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        {/* Filter chips + count */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 mr-1">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="text-xs px-3 py-1 rounded-full border transition-colors"
              style={filter === f.id
                ? { background: '#111827', color: 'white', borderColor: '#111827' }
                : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100 text-[9px] font-bold uppercase tracking-wider text-gray-400">
          <span className="w-4"></span>
          <span className="w-20">Loja</span>
          <span className="w-16">Tipo</span>
          <span className="w-14">Valor</span>
          <span className="w-14">Data</span>
          <span className="flex-1">OS</span>
          <span className="w-16">Status</span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">Nenhuma solicitação encontrada.</div>
        ) : (
          filtered.map(req => (
            <RequestRow
              key={req.id}
              request={req}
              isOpen={openId === req.id}
              onToggle={() => handleToggle(req.id)}
              approval={approvalsMap[req.id] as never}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

> **Nota:** `approvalsApi.getAll()` pode não existir no `api.ts` atual. Verificar se há endpoint `GET /approvals` — se não houver, remover a chamada e deixar `approvalsMap` vazio.

- [ ] **Verificar que a lista renderiza e o dropdown expande/recolhe**

```bash
npm run dev
```
Clicar em uma linha — deve expandir mostrando detalhes.

- [ ] **Commit**

```bash
git add src/app/components/requests/
git commit -m "feat: reescrever RequestsList com dropdown por linha"
```

---

### Task 13: Atualizar NewRequest — adicionar Sedex

**Files:**
- Modify: `src/app/components/NewRequest.tsx` (ou criar em `requests/NewRequest.tsx`)

- [ ] **Localizar o select de tipo de serviço** em `NewRequest.tsx`. Encontrar algo como:

```tsx
<select ... >
  <option value="montagem">Montagem</option>
  <option value="motoboy">Motoboy</option>
</select>
```

Adicionar a opção Sedex:
```tsx
<option value="sedex">Sedex</option>
```

- [ ] **Atualizar a validação** — se houver checagem explícita do tipo, incluir `'sedex'` nos valores válidos.

- [ ] **Verificar criação de solicitação do tipo Sedex no browser**

- [ ] **Commit**

```bash
git add src/app/components/NewRequest.tsx
git commit -m "feat: adicionar Sedex ao formulário de nova solicitação"
```

---

### Task 14: Reescrever ApprovalPanel

**Files:**
- Create: `src/app/components/approvals/ApprovalPanel.tsx`

- [ ] **Criar o novo `ApprovalPanel.tsx`:**

```tsx
// src/app/components/approvals/ApprovalPanel.tsx
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Calendar, DollarSign, Hash, User } from 'lucide-react';
import { requests as requestsApi, approvals as approvalsApi } from '../../../lib/api';
import { REQUEST_TYPE_LABELS } from '../../../types';
import type { Request } from '../../../types';

interface ApprovalPanelProps {
  onActionComplete?: () => void;
}

export function ApprovalPanel({ onActionComplete }: ApprovalPanelProps) {
  const [pending, setPending] = useState<Request[]>([]);
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const res = await requestsApi.getAll();
      setPending((res.requests ?? []).filter((r: Request) => r.status === 'pending'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    const obs = observations[requestId] ?? '';
    if (action === 'rejected' && !obs.trim()) {
      alert('Observação é obrigatória para reprovar.');
      return;
    }
    setProcessing(requestId);
    try {
      await approvalsApi.create({ requestId, action, observation: obs });
      await fetchPending();
      onActionComplete?.();
    } catch (err) {
      console.error(err);
      alert('Erro ao processar aprovação. Tente novamente.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="py-20 text-center text-sm text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-900">Aprovações</h1>
        {pending.length > 0 && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
            style={{ background: 'var(--color-status-pending-bg)', color: 'var(--color-status-pending-text)' }}>
            {pending.length} aguardando
          </span>
        )}
      </div>

      {pending.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <CheckCircle size={32} className="mx-auto mb-3 text-green-400" />
          <p className="text-sm text-gray-500">Nenhuma solicitação pendente.</p>
        </div>
      ) : (
        pending.map(req => (
          <div key={req.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
            {/* Header */}
            <div className="flex items-start gap-3 p-4 border-b border-gray-100">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Hash size={15} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{req.storeName} — {REQUEST_TYPE_LABELS[req.type]}</div>
                <div className="text-xs text-gray-400 mt-0.5">Solicitado por {req.requestedBy}</div>
              </div>
              <span className="text-[9px] font-semibold px-2 py-1 rounded-full"
                style={{ background: 'var(--color-status-pending-bg)', color: 'var(--color-status-pending-text)' }}>
                Pendente
              </span>
            </div>

            {/* Detail chips */}
            <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-gray-100">
              {[
                { icon: DollarSign, label: new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(req.value) },
                { icon: Calendar,   label: req.date },
                { icon: Hash,       label: `OS #${req.osNumber}` },
                { icon: User,       label: req.requestedBy },
              ].map(chip => (
                <span key={chip.label} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border bg-gray-50 border-gray-200 text-gray-600">
                  <chip.icon size={9} className="text-gray-400" />
                  {chip.label}
                </span>
              ))}
              <span className="inline-flex items-center text-[10px] px-2 py-1 rounded-md border"
                style={req.chargedToClient
                  ? { background:'#f0fdf4', borderColor:'#bbf7d0', color:'#166534' }
                  : { background:'#fefce8', borderColor:'#fde68a', color:'#92400e' }}>
                {req.chargedToClient ? 'Cobrado do cliente' : 'Não cobrado do cliente'}
              </span>
            </div>

            {/* Justificativa */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-600 italic">"{req.justification}"</p>
            </div>

            {/* Action area — sticky on mobile */}
            <div className="px-4 py-3 flex flex-col sm:flex-row gap-2 sticky bottom-0 bg-white">
              <input
                type="text"
                placeholder="Observação (obrigatória para reprovar)..."
                value={observations[req.id] ?? ''}
                onChange={e => setObservations(prev => ({ ...prev, [req.id]: e.target.value }))}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:border-gray-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(req.id, 'approved')}
                  disabled={processing === req.id}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
                  style={{ background:'#f0fdf4', borderColor:'#bbf7d0', color:'#166534' }}
                >
                  <CheckCircle size={13} /> Aprovar
                </button>
                <button
                  onClick={() => handleAction(req.id, 'rejected')}
                  disabled={processing === req.id}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
                  style={{ background:'#fef2f2', borderColor:'#fecaca', color:'#dc2626' }}
                >
                  <XCircle size={13} /> Reprovar
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

> Verificar se `approvalsApi.create` existe em `src/lib/api.ts`. Se o método se chamar diferente, adaptar.

- [ ] **Commit**

```bash
git add src/app/components/approvals/ApprovalPanel.tsx
git commit -m "feat: reescrever ApprovalPanel com novo design"
```

---

## FASE 3 — Relatórios + Admin

---

### Task 15: Componentes de Relatório

**Files:**
- Create: `src/app/components/reports/ReportFilters.tsx`
- Create: `src/app/components/reports/ReportTotals.tsx`
- Create: `src/app/components/reports/ReportTable.tsx`
- Create: `src/app/components/reports/MonthlyReportPage.tsx`

- [ ] **Criar `ReportFilters.tsx`:**

```tsx
// src/app/components/reports/ReportFilters.tsx
import type { Store } from '../../../types';

export interface ReportFiltersState {
  month: string;    // formato 'YYYY-MM'
  storeId: string;  // '' = todas
  type: string;     // '' = todos
  status: string;   // '' = todos
}

interface ReportFiltersProps {
  filters: ReportFiltersState;
  stores: Store[];
  onChange: (filters: ReportFiltersState) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  return {
    value: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
    label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  };
});

export function ReportFilters({ filters, stores, onChange }: ReportFiltersProps) {
  const set = (key: keyof ReportFiltersState, value: string) =>
    onChange({ ...filters, [key]: value });

  const selectCls = "text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-400 text-gray-700";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Mês</label>
        <select className={selectCls} value={filters.month} onChange={e => set('month', e.target.value)}>
          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Loja</label>
        <select className={selectCls} value={filters.storeId} onChange={e => set('storeId', e.target.value)}>
          <option value="">Todas as lojas</option>
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Tipo</label>
        <select className={selectCls} value={filters.type} onChange={e => set('type', e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="montagem">Montagem</option>
          <option value="motoboy">Motoboy</option>
          <option value="sedex">Sedex</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Status</label>
        <select className={selectCls} value={filters.status} onChange={e => set('status', e.target.value)}>
          <option value="">Todos</option>
          <option value="approved">Aprovadas</option>
          <option value="rejected">Reprovadas</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>
    </div>
  );
}
```

- [ ] **Criar `ReportTotals.tsx`:**

```tsx
// src/app/components/reports/ReportTotals.tsx
import type { Request } from '../../../types';

interface ReportTotalsProps {
  requests: Request[];
}

const TYPE_CONFIG = [
  { key: 'montagem', label: 'Montagem', color: '#6366f1' },
  { key: 'motoboy',  label: 'Motoboy',  color: '#f59e0b' },
  { key: 'sedex',    label: 'Sedex',    color: '#10b981' },
] as const;

export function ReportTotals({ requests }: ReportTotalsProps) {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
  const total = requests.reduce((s, r) => s + r.value, 0);
  const totalCount = requests.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {TYPE_CONFIG.map(({ key, label, color }) => {
        const items = requests.filter(r => r.type === key);
        return (
          <div key={key} className="bg-white border border-gray-200 rounded-xl p-4" style={{ borderLeft: `3px solid ${color}`, boxShadow: 'var(--shadow-card)' }}>
            <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {label}
            </div>
            <div className="text-base font-bold text-gray-900">{fmt(items.reduce((s,r) => s+r.value, 0))}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{items.length} solicitaç{items.length !== 1 ? 'ões' : 'ão'}</div>
          </div>
        );
      })}
      <div className="bg-white border border-gray-200 rounded-xl p-4" style={{ borderLeft: '3px solid #111827', boxShadow: 'var(--shadow-card)' }}>
        <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2">Total</div>
        <div className="text-base font-bold text-gray-900">{fmt(total)}</div>
        <div className="text-[10px] text-gray-400 mt-0.5">{totalCount} solicitaç{totalCount !== 1 ? 'ões' : 'ão'}</div>
      </div>
    </div>
  );
}
```

- [ ] **Criar `ReportTable.tsx`:**

```tsx
// src/app/components/reports/ReportTable.tsx
import type { Request } from '../../../types';
import { REQUEST_TYPE_LABELS, REQUEST_STATUS_LABELS } from '../../../types';

interface ReportTableProps {
  requests: Request[];
  approvalsMap: Record<string, { observation?: string }>;
}

const TYPE_COLORS: Record<string, string> = {
  montagem: '#6366f1',
  motoboy:  '#f59e0b',
  sedex:    '#10b981',
};

export function ReportTable({ requests, approvalsMap }: ReportTableProps) {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
  const total = requests.reduce((s, r) => s + r.value, 0);

  const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    pending:  { bg: 'var(--color-status-pending-bg)',  text: 'var(--color-status-pending-text)' },
    approved: { bg: 'var(--color-status-approved-bg)', text: 'var(--color-status-approved-text)' },
    rejected: { bg: 'var(--color-status-rejected-bg)', text: 'var(--color-status-rejected-text)' },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Header */}
      <div className="grid text-[9px] font-bold uppercase tracking-wider text-gray-400 px-4 py-2.5 bg-gray-50 border-b border-gray-100"
        style={{ gridTemplateColumns: '1fr 80px 60px 70px 80px 70px 1fr 1.5fr 70px' }}>
        <span>Loja</span><span>Tipo</span><span>OS</span><span>Data</span>
        <span className="text-right">Valor</span><span>Cobrado</span>
        <span>Solicitante</span><span>Observação</span><span>Status</span>
      </div>

      {requests.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">Nenhum registro para os filtros selecionados.</div>
      ) : (
        requests.map(req => {
          const obs = approvalsMap[req.id]?.observation ?? '—';
          const ss = STATUS_STYLES[req.status] ?? STATUS_STYLES.pending;
          return (
            <div key={req.id} className="grid items-center px-4 py-2.5 border-b border-gray-50 last:border-0 text-xs gap-1"
              style={{ gridTemplateColumns: '1fr 80px 60px 70px 80px 70px 1fr 1.5fr 70px' }}>
              <span className="font-medium text-gray-800 truncate">{req.storeName}</span>
              <span className="flex items-center gap-1 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[req.type] }} />
                {REQUEST_TYPE_LABELS[req.type]}
              </span>
              <span className="text-gray-400">#{req.osNumber}</span>
              <span className="text-gray-400">{req.date}</span>
              <span className="text-right font-semibold text-gray-900 tabular-nums">{fmt(req.value)}</span>
              <span className="text-xs" style={{ color: req.chargedToClient ? '#16a34a' : '#9ca3af' }}>
                {req.chargedToClient ? 'Sim' : 'Não'}
              </span>
              <span className="text-gray-500 truncate">{req.requestedBy}</span>
              <span className="text-gray-400 italic truncate text-[10px]">{obs}</span>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full w-fit"
                style={{ background: ss.bg, color: ss.text }}>
                {REQUEST_STATUS_LABELS[req.status as keyof typeof REQUEST_STATUS_LABELS] ?? req.status}
              </span>
            </div>
          );
        })
      )}

      {/* Footer total */}
      {requests.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">{requests.length} registro{requests.length !== 1 ? 's' : ''}</span>
          <span className="text-xs font-bold text-gray-900">Total: {fmt(total)}</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Criar `MonthlyReportPage.tsx`:**

```tsx
// src/app/components/reports/MonthlyReportPage.tsx
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { reports as reportsApi, stores as storesApi } from '../../../lib/api';
import type { Request, Store } from '../../../types';
import { ReportFilters, type ReportFiltersState } from './ReportFilters';
import { ReportTotals } from './ReportTotals';
import { ReportTable } from './ReportTable';

const now = new Date();
const DEFAULT_FILTERS: ReportFiltersState = {
  month: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,
  storeId: '',
  type: '',
  status: '',
};

export function MonthlyReportPage() {
  const [filters, setFilters] = useState<ReportFiltersState>(DEFAULT_FILTERS);
  const [requests, setRequests] = useState<Request[]>([]);
  const [approvalsMap, setApprovalsMap] = useState<Record<string, { observation?: string }>>({});
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storesApi.getAll().then(r => setStores(r.stores ?? [])).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    reportsApi.getMonthly(filters)
      .then(r => {
        setRequests(r.requests ?? []);
        const map: Record<string, { observation?: string }> = {};
        for (const a of (r.approvals ?? [])) {
          map[(a as { requestId: string; observation?: string }).requestId] = a as { observation?: string };
        }
        setApprovalsMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const handleExportPDF = () => {
    // Reutilizar lógica existente de exportação PDF do MonthlyReport.tsx original
    alert('Exportação PDF — integrar lógica do componente original');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Relatórios</h1>
        <div className="flex gap-2">
          <button onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={12} /> PDF
          </button>
        </div>
      </div>
      <ReportFilters filters={filters} stores={stores} onChange={setFilters} />
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Carregando...</div>
      ) : (
        <>
          <ReportTotals requests={requests} />
          <ReportTable requests={requests} approvalsMap={approvalsMap} />
        </>
      )}
    </div>
  );
}
```

> Para `reportsApi.getMonthly(filters)`: verificar se existe esta função em `api.ts`. Se o endpoint existente for `GET /reports/monthly?month=&storeId=&type=&status=`, criar/adaptar o método no `api.ts`.

- [ ] **Commit**

```bash
git add src/app/components/reports/
git commit -m "feat: criar componentes de relatório (filters, totals, table, page)"
```

---

### Task 16: Admin separado em abas

**Files:**
- Create: `src/app/components/admin/UserTable.tsx`
- Create: `src/app/components/admin/UserForm.tsx`
- Create: `src/app/components/admin/StoreTable.tsx`
- Create: `src/app/components/admin/StoreForm.tsx`
- Create: `src/app/components/admin/UserAdminPage.tsx`

- [ ] **Criar `UserTable.tsx`:**

```tsx
// src/app/components/admin/UserTable.tsx
import { Pencil, Trash2 } from 'lucide-react';
import type { User } from '../../../types';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  approver: { bg: '#ede9fe', text: '#6d28d9', label: 'Aprovador' },
  store:    { bg: '#dbeafe', text: '#1d4ed8', label: 'Loja'      },
  viewer:   { bg: '#f3f4f6', text: '#6b7280', label: 'Visualizador' },
};

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      {users.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">Nenhum usuário encontrado.</div>
      ) : (
        users.map(u => {
          const rs = ROLE_STYLES[u.role] ?? ROLE_STYLES.viewer;
          return (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                {u.name.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{u.name}</div>
                <div className="text-xs text-gray-400 truncate">{u.email}</div>
              </div>
              <span className="text-[9px] font-semibold px-2 py-1 rounded-full" style={{ background: rs.bg, color: rs.text }}>
                {rs.label}
              </span>
              <div className="flex gap-1.5">
                <button onClick={() => onEdit(u)} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Pencil size={11} className="text-gray-500" />
                </button>
                <button onClick={() => onDelete(u.id)} className="w-7 h-7 rounded-md border border-red-100 bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
                  <Trash2 size={11} className="text-red-500" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
```

- [ ] **Criar `UserForm.tsx`:**

```tsx
// src/app/components/admin/UserForm.tsx
import { useState } from 'react';
import type { User, Store } from '../../../types';

interface UserFormProps {
  initial?: Partial<User>;
  stores: Store[];
  onSubmit: (data: Partial<User> & { password?: string }) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ initial, stores, onSubmit, onCancel }: UserFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [role, setRole] = useState<User['role']>(initial?.role ?? 'store');
  const [storeId, setStoreId] = useState(initial?.storeId ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const isNew = !initial?.id;
  const inputCls = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 bg-white";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSaving(true);
    try {
      await onSubmit({ id: initial?.id, name, email, role, storeId: role === 'store' ? storeId : undefined, password: isNew ? password : undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h3 className="text-sm font-bold text-gray-900">{isNew ? 'Novo Usuário' : 'Editar Usuário'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Nome *</label>
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Email *</label>
          <input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Perfil *</label>
          <select className={inputCls} value={role} onChange={e => setRole(e.target.value as User['role'])}>
            <option value="store">Loja</option>
            <option value="approver">Aprovador</option>
            <option value="viewer">Visualizador</option>
          </select>
        </div>
        {role === 'store' && (
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Loja</label>
            <select className={inputCls} value={storeId} onChange={e => setStoreId(e.target.value)}>
              <option value="">Selecionar loja...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        {isNew && (
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Senha *</label>
            <input className={inputCls} type="password" value={password} onChange={e => setPassword(e.target.value)} required={isNew} />
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={saving} className="text-xs px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Salvando...' : isNew ? 'Criar usuário' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Criar `StoreTable.tsx`:**

```tsx
// src/app/components/admin/StoreTable.tsx
import { Pencil, Trash2 } from 'lucide-react';
import type { Store } from '../../../types';

interface StoreTableProps {
  stores: Store[];
  onEdit: (store: Store) => void;
  onDelete: (storeId: string) => void;
}

export function StoreTable({ stores, onEdit, onDelete }: StoreTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      {stores.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">Nenhuma loja cadastrada.</div>
      ) : (
        stores.map(store => (
          <div key={store.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
              {store.code.slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{store.name}</div>
              <div className="text-xs text-gray-400">Código: {store.code}</div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => onEdit(store)} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Pencil size={11} className="text-gray-500" />
              </button>
              <button onClick={() => onDelete(store.id)} className="w-7 h-7 rounded-md border border-red-100 bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
                <Trash2 size={11} className="text-red-500" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

- [ ] **Criar `StoreForm.tsx`:**

```tsx
// src/app/components/admin/StoreForm.tsx
import { useState } from 'react';
import type { Store } from '../../../types';

interface StoreFormProps {
  initial?: Partial<Store>;
  onSubmit: (data: Partial<Store>) => Promise<void>;
  onCancel: () => void;
}

export function StoreForm({ initial, onSubmit, onCancel }: StoreFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [saving, setSaving] = useState(false);
  const isNew = !initial?.id;
  const inputCls = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 bg-white";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSubmit({ id: initial?.id, name, code }); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h3 className="text-sm font-bold text-gray-900">{isNew ? 'Nova Loja' : 'Editar Loja'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Nome *</label>
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Código *</label>
          <input className={inputCls} value={code} onChange={e => setCode(e.target.value)} required />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={saving} className="text-xs px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Salvando...' : isNew ? 'Criar loja' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Criar `UserAdminPage.tsx`:**

```tsx
// src/app/components/admin/UserAdminPage.tsx
import { useEffect, useState } from 'react';
import { Plus, Users, Home } from 'lucide-react';
import { users as usersApi, stores as storesApi } from '../../../lib/api';
import type { User, Store } from '../../../types';
import { UserTable } from './UserTable';
import { UserForm } from './UserForm';
import { StoreTable } from './StoreTable';
import { StoreForm } from './StoreForm';

type Tab = 'users' | 'stores';

interface UserAdminPageProps {
  currentUser: User;
}

export function UserAdminPage({ currentUser }: UserAdminPageProps) {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [editingStore, setEditingStore] = useState<Partial<Store> | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);

  const loadData = async () => {
    const [u, s] = await Promise.all([usersApi.getAll(), storesApi.getAll()]);
    setUsers(u.users ?? []);
    setStores(s.stores ?? []);
  };

  useEffect(() => { loadData().catch(console.error); }, []);

  const handleUserSubmit = async (data: Partial<User> & { password?: string }) => {
    if (data.id) {
      await usersApi.update(data.email!, data);
    } else {
      await usersApi.create(data);
    }
    await loadData();
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleUserDelete = async (userId: string) => {
    if (!confirm('Excluir este usuário?')) return;
    const u = users.find(x => x.id === userId);
    if (u) await usersApi.delete(u.email);
    await loadData();
  };

  const handleStoreSubmit = async (data: Partial<Store>) => {
    if (data.id) {
      await storesApi.update(data.id, data);
    } else {
      await storesApi.create(data);
    }
    await loadData();
    setShowStoreForm(false);
    setEditingStore(null);
  };

  const handleStoreDelete = async (storeId: string) => {
    if (!confirm('Excluir esta loja?')) return;
    await storesApi.delete(storeId);
    await loadData();
  };

  const tabCls = (t: Tab) => `flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
    tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
  }`;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-gray-900">Administração</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('users')} className={tabCls('users')}>
          <Users size={13} /> Usuários ({users.length})
        </button>
        <button onClick={() => setTab('stores')} className={tabCls('stores')}>
          <Home size={13} /> Lojas ({stores.length})
        </button>
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          {(showUserForm || editingUser) ? (
            <UserForm
              initial={editingUser ?? undefined}
              stores={stores}
              onSubmit={handleUserSubmit}
              onCancel={() => { setShowUserForm(false); setEditingUser(null); }}
            />
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => setShowUserForm(true)}
                className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                <Plus size={12} /> Novo Usuário
              </button>
            </div>
          )}
          <UserTable
            users={users.filter(u => u.id !== currentUser.id)}
            onEdit={u => { setEditingUser(u); setShowUserForm(false); }}
            onDelete={handleUserDelete}
          />
        </div>
      )}

      {/* Stores tab */}
      {tab === 'stores' && (
        <div className="space-y-4">
          {(showStoreForm || editingStore) ? (
            <StoreForm
              initial={editingStore ?? undefined}
              onSubmit={handleStoreSubmit}
              onCancel={() => { setShowStoreForm(false); setEditingStore(null); }}
            />
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => setShowStoreForm(true)}
                className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                <Plus size={12} /> Nova Loja
              </button>
            </div>
          )}
          <StoreTable
            stores={stores}
            onEdit={s => { setEditingStore(s); setShowStoreForm(false); }}
            onDelete={handleStoreDelete}
          />
        </div>
      )}
    </div>
  );
}
```

> Verificar em `api.ts` os métodos disponíveis: `usersApi.getAll()`, `usersApi.create()`, `usersApi.update()`, `usersApi.delete()`, `storesApi.getAll()`, `storesApi.create()`, `storesApi.update()`, `storesApi.delete()`. Adaptar nomes se necessário.

- [ ] **Commit**

```bash
git add src/app/components/admin/
git commit -m "feat: criar UserAdminPage com abas Usuários/Lojas"
```

---

## FASE 4 — Notificações + Mobile

---

### Task 17: FCM token refresh + deep link

**Files:**
- Modify: `src/lib/pushNotifications.ts`
- Modify: `src/app/App.tsx`

- [ ] **Adicionar `refreshFCMToken` em `pushNotifications.ts`:**

Localizar a função `initializePushNotifications()` existente. Após registrar o token pela primeira vez, adicionar lógica de refresh:

```typescript
// Adicionar após o bloco de requestPermissions/registration existente:

export async function refreshFCMTokenIfNeeded(userId: string): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    // Ouvir novo token
    PushNotifications.addListener('registration', async (token) => {
      const saved = localStorage.getItem('fcm_token');
      if (token.value !== saved) {
        console.log('🔄 FCM token mudou, atualizando...');
        localStorage.setItem('fcm_token', token.value);
        // Chamar API para salvar novo token
        const { notifications } = await import('./api');
        await notifications.saveFCMToken(token.value, getPlatform() as 'ios' | 'android');
      }
    });
    // Re-register para forçar emissão do token atual
    await PushNotifications.register();
  } catch (err) {
    console.error('Erro no refresh do FCM token:', err);
  }
}
```

- [ ] **Adicionar handler de deep link em `pushNotifications.ts`:**

```typescript
export type DeepLinkHandler = (requestId: string) => void;

export function setupDeepLinkFromNotification(onNavigate: DeepLinkHandler): void {
  if (!isNativePlatform()) return;

  import('@capacitor/push-notifications').then(({ PushNotifications }) => {
    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      const requestId = action.notification.data?.requestId as string | undefined;
      if (requestId) {
        console.log('🔗 Deep link: abrindo solicitação', requestId);
        onNavigate(requestId);
      }
    });
  }).catch(console.error);
}
```

- [ ] **No backend `fcm.ts`**, certificar que o payload de notificação inclui `requestId`:

Localizar a função que envia push (provavelmente `sendPushNotification` ou similar). Garantir que o campo `data` inclui `requestId`:

```typescript
data: {
  requestId: request.id,  // ← adicionar se não existir
  click_action: 'FLUTTER_NOTIFICATION_CLICK',
}
```

- [ ] **Em `App.tsx`**, chamar `refreshFCMTokenIfNeeded` e `setupDeepLinkFromNotification` após login:

```typescript
// Dentro de handleLogin, após initializePushNotifications():
if (result.success) {
  setupPushListeners();
  refreshFCMTokenIfNeeded(loggedUser.id);
  setupDeepLinkFromNotification((requestId) => {
    // Navegar para a solicitação específica
    handleNavigate('requests');
    // Idealmente passar o requestId para RequestsList abrir o dropdown
    // Por ora, navegar para a lista filtrada
  });
}
```

- [ ] **Commit**

```bash
git add src/lib/pushNotifications.ts src/app/App.tsx supabase/functions/server/fcm.ts
git commit -m "feat: FCM token refresh automático e deep link em notificações"
```

---

### Task 18: Otimizações UX Mobile

**Files:**
- Modify: `src/app/components/layout/BottomNav.tsx`
- Modify: `src/app/components/approvals/ApprovalPanel.tsx`
- Modify: `src/styles/theme.css`

- [ ] **Adicionar regras de safe-area e touch targets em `theme.css`:**

Ao final do arquivo:
```css
/* === MOBILE NATIVE === */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .safe-bottom {
    padding-bottom: calc(env(safe-area-inset-bottom) + 8px);
  }
}

/* Garantir touch targets mínimos de 44px */
button, a, [role="button"] {
  min-height: 44px;
}
/* Exceção para botões de ícone compactos (badge, etc) */
.icon-btn-compact {
  min-height: unset;
}
```

- [ ] **Pull-to-refresh na lista de solicitações:**

Em `RequestsList.tsx`, adicionar handler de scroll para mobile:

```tsx
// Adicionar import
import { useRef } from 'react';

// Dentro do componente, adicionar:
const containerRef = useRef<HTMLDivElement>(null);
const startYRef = useRef(0);

const handleTouchStart = (e: React.TouchEvent) => {
  startYRef.current = e.touches[0].clientY;
};

const handleTouchEnd = async (e: React.TouchEvent) => {
  const deltaY = e.changedTouches[0].clientY - startYRef.current;
  const isAtTop = (containerRef.current?.scrollTop ?? 0) === 0;
  if (deltaY > 70 && isAtTop) {
    setLoading(true);
    await Promise.all([requestsApi.getAll(), /* approvals */])
      .then(/* mesmo handler do useEffect */)
      .finally(() => setLoading(false));
  }
};

// No JSX, adicionar ao div container:
// ref={containerRef}
// onTouchStart={handleTouchStart}
// onTouchEnd={handleTouchEnd}
```

- [ ] **Verificar app no emulador Android ou browser mobile (DevTools responsive)**

Abrir Chrome DevTools → Toggle device toolbar → simular iPhone. Verificar:
- Bottom nav não cobre conteúdo
- Botões têm área de toque adequada
- Safe area respeitada no bottom nav

- [ ] **Commit**

```bash
git add src/app/components/ src/styles/theme.css
git commit -m "feat: otimizações UX mobile — safe area, touch targets, pull-to-refresh"
```

---

## Checklist de Integração Final

Após implementar todas as fases:

- [ ] `npm run build` sem erros de TypeScript
- [ ] Dev server sobe e app carrega com estilos corretos
- [ ] Login funciona e renderiza AppShell com sidebar
- [ ] Em mobile (< 768px): sidebar oculta, bottom nav visível
- [ ] Badge de pendentes atualiza ao navegar
- [ ] Criar solicitação do tipo Sedex — aparece na lista
- [ ] Clicar na linha da lista abre dropdown com detalhes
- [ ] Aprovar/reprovar solicitação — email disparado via Resend
- [ ] Notificação push ao criar/aprovar/reprovar
- [ ] Admin: aba Usuários e aba Lojas funcionam independentemente
- [ ] Relatório: filtros aplicam e totais por tipo exibem corretamente
- [ ] `npm run build` novamente — sem warnings críticos

---

## Notas de Implementação

### API — métodos a verificar em `src/lib/api.ts`
Antes de implementar cada fase, confirmar que estes métodos existem (e criar se não existirem):

| Módulo | Método | Endpoint |
|---|---|---|
| `requests` | `getAll()` | `GET /requests` |
| `approvals` | `create(data)` | `POST /approvals` |
| `approvals` | `getAll()` | `GET /approvals` (pode não existir) |
| `reports` | `getMonthly(filters)` | `GET /reports/monthly` |
| `stores` | `getAll()` | `GET /stores` |
| `stores` | `create(data)` | `POST /stores` |
| `stores` | `update(id, data)` | `PUT /stores/:id` |
| `stores` | `delete(id)` | `DELETE /stores/:id` |
| `users` | `getAll()` | `GET /users` |
| `users` | `create(data)` | `POST /users` |
| `users` | `update(email, data)` | `PUT /users/:email` |
| `users` | `delete(email)` | `DELETE /users/:email` |
| `notifications` | `saveFCMToken(token, platform)` | `POST /save-fcm-token` |

### Worktree
Executar em worktree isolada para não afetar a branch principal durante implementação:
```bash
git worktree add ../oticas-carol-impl feature/melhoria-completa
cd ../oticas-carol-impl
```
