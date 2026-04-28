# Melhorias Formulário de Solicitações — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar 3 melhorias: campo OS aceita somente números, justificativa de reprovação visível para a loja, e tabela de preços do fornecedor selecionável no formulário.

**Architecture:** Feature 1 é uma mudança de input pura no frontend. Feature 2 corrige um bug: o backend já persiste o approval, mas o frontend nunca o busca — adicionar endpoint GET + busca lazy no toggle. Feature 3 adiciona um novo modelo `ServicePrice` no KV, CRUD no backend, página admin com terceira aba, e campo valor condicional no formulário.

**Tech Stack:** React + TypeScript, Supabase Edge Functions (Hono), Deno KV via wrapper `kv`, Tailwind CSS, Shadcn/ui.

---

## File Map

| Arquivo | O que muda |
|---|---|
| `src/app/components/NewRequest.tsx` | Feature 1: restrict OS input; Feature 3: valor condicional |
| `supabase/functions/server/index.tsx` | Feature 2: GET /approvals/:id; Feature 3: CRUD /service-prices |
| `src/lib/api.ts` | Feature 2: `approvals.get()`; Feature 3: objeto `servicePrices` |
| `src/app/components/requests/RequestsList.tsx` | Feature 2: fetch approval no toggle |
| `src/app/components/admin/UserAdminPage.tsx` | Feature 3: aba "Preços" + render ServicePricePage |
| `src/app/components/admin/ServicePricePage.tsx` | Feature 3: novo componente admin CRUD |
| `src/types.ts` | Feature 3: interface `ServicePrice` |

---

## Task 1: Campo OS — somente números

**Files:**
- Modify: `src/app/components/NewRequest.tsx` (~linha 285)

- [ ] **Abrir `src/app/components/NewRequest.tsx` e localizar o input do campo osNumber (~linha 285):**

```tsx
<Input
  id="osNumber"
  value={formData.osNumber}
  onChange={(e) => handleChange('osNumber', e.target.value)}
  placeholder="Ex: 12345"
  required
/>
```

- [ ] **Substituir pelo input com restrição numérica:**

```tsx
<Input
  id="osNumber"
  inputMode="numeric"
  pattern="[0-9]*"
  value={formData.osNumber}
  onChange={(e) => {
    const v = e.target.value;
    if (/^\d*$/.test(v)) handleChange('osNumber', v);
  }}
  placeholder="Ex: 12345"
  required
/>
```

- [ ] **Verificar manualmente:** Abrir o formulário de nova solicitação → tentar digitar letras no campo OS → confirmar que nada aparece. Digitar números → confirmar que funciona normalmente. No mobile, confirmar que abre teclado numérico.

- [ ] **Commit:**

```bash
git add src/app/components/NewRequest.tsx
git commit -m "feat: campo OS aceita somente números"
```

---

## Task 2: Endpoint GET /approvals/:requestId no backend

**Files:**
- Modify: `supabase/functions/server/index.tsx` — após o bloco `app.post("/make-server-b2c42f95/approvals", ...)`

- [ ] **Localizar o fim do bloco POST de approvals (~linha 700) e adicionar o endpoint GET logo após:**

```ts
// Get approval for a specific request
app.get("/make-server-b2c42f95/approvals/:requestId", async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const requestId = c.req.param('requestId');
    const approval = await kv.get(`approval:${requestId}`);

    if (!approval) {
      return c.json({ error: 'Approval not found' }, 404);
    }

    return c.json({ approval });
  } catch (error) {
    console.log('Get approval error:', error);
    return c.json({ error: 'Failed to get approval' }, 500);
  }
});
```

- [ ] **Verificar:** Fazer deploy local ou testar via curl/Postman: `GET /make-server-b2c42f95/approvals/{id-de-request-reprovado}` com header `X-Session-ID` válido → deve retornar JSON com `{ approval: { approverName, observation, action, timestamp } }`. Request sem approval deve retornar 404.

- [ ] **Commit:**

```bash
git add supabase/functions/server/index.tsx
git commit -m "feat: endpoint GET /approvals/:requestId"
```

---

## Task 3: Método approvals.get() no API client

**Files:**
- Modify: `src/lib/api.ts` — objeto `approvals` (~linha 148)

- [ ] **Localizar o objeto `approvals` em `src/lib/api.ts` e adicionar o método `get`:**

```ts
// Approvals API
export const approvals = {
  async process(requestId: string, action: 'approved' | 'rejected', observation?: string) {
    return apiCall('/approvals', {
      method: 'POST',
      body: JSON.stringify({ requestId, action, observation }),
    });
  },

  async get(requestId: string) {
    return apiCall(`/approvals/${requestId}`);
  },
};
```

- [ ] **Commit:**

```bash
git add src/lib/api.ts
git commit -m "feat: approvals.get() no API client"
```

---

## Task 4: Fetch approval info ao expandir linha na RequestsList

**Files:**
- Modify: `src/app/components/requests/RequestsList.tsx`

- [ ] **Adicionar import de `approvals` no topo do arquivo:**

```ts
import { requests as requestsApi, approvals as approvalsApi } from '../../../lib/api';
```

(Atualmente o arquivo importa só `requests as requestsApi` — adicionar `, approvals as approvalsApi` na mesma linha.)

- [ ] **Localizar a função `handleToggle` (~linha 86) e substituir:**

```ts
const handleToggle = (id: string) => setOpenId(prev => prev === id ? null : id);
```

**Por:**

```ts
const handleToggle = async (id: string) => {
  setOpenId(prev => prev === id ? null : id);

  // Busca approval apenas uma vez por request
  if (approvalsMap[id] === undefined) {
    try {
      const data = await approvalsApi.get(id);
      setApprovalsMap(prev => ({ ...prev, [id]: data.approval ?? null }));
    } catch {
      setApprovalsMap(prev => ({ ...prev, [id]: null }));
    }
  }
};
```

- [ ] **Verificar manualmente:** Logar como usuário de loja → abrir uma solicitação reprovada → expandir a linha → confirmar que aparece a seção "Motivo da reprovação" em vermelho com o texto preenchido pelo aprovador e o nome de quem reprovou. Expandir uma solicitação pendente → confirmar que a seção não aparece (approval é null). Expandir a mesma linha reprovada uma segunda vez → confirmar que não faz nova requisição (approvalsMap já tem o valor).

- [ ] **Commit:**

```bash
git add src/app/components/requests/RequestsList.tsx
git commit -m "fix: exibir motivo de reprovação para a loja"
```

---

## Task 5: Interface ServicePrice em types.ts

**Files:**
- Modify: `src/types.ts`

- [ ] **Adicionar interface `ServicePrice` ao final do arquivo `src/types.ts`:**

```ts
export interface ServicePrice {
  id: string;
  description: string;
  price: number;
  type: 'montagem' | 'motoboy';
}
```

- [ ] **Commit:**

```bash
git add src/types.ts
git commit -m "feat: interface ServicePrice em types.ts"
```

---

## Task 6: CRUD /service-prices no backend

**Files:**
- Modify: `supabase/functions/server/index.tsx` — adicionar bloco após os endpoints de approvals

- [ ] **Adicionar os 4 endpoints de service-prices no backend. Inserir após o bloco de approvals:**

```ts
// ===== SERVICE PRICE ROUTES =====

// Get all service prices (optionally filtered by type)
app.get("/make-server-b2c42f95/service-prices", async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);

    const typeFilter = c.req.query('type');
    let prices = await kv.getByPrefix('service-price:');

    if (typeFilter) {
      prices = prices.filter((p: { type: string }) => p.type === typeFilter);
    }

    prices.sort((a: { description: string }, b: { description: string }) =>
      a.description.localeCompare(b.description)
    );

    return c.json({ prices });
  } catch (error) {
    console.log('Get service prices error:', error);
    return c.json({ error: 'Failed to get service prices' }, 500);
  }
});

// Create service price (approver only)
app.post("/make-server-b2c42f95/service-prices", async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);
    if (user.role !== 'approver' && user.role !== 'approver_store') {
      return c.json({ error: 'Apenas aprovadores podem gerenciar a tabela de preços' }, 403);
    }

    const { description, price, type } = await c.req.json();
    if (!description || price == null || !type) {
      return c.json({ error: 'description, price e type são obrigatórios' }, 400);
    }

    const id = crypto.randomUUID();
    const servicePrice = { id, description, price: Number(price), type };
    await kv.set(`service-price:${id}`, servicePrice);

    return c.json({ servicePrice }, 201);
  } catch (error) {
    console.log('Create service price error:', error);
    return c.json({ error: 'Failed to create service price' }, 500);
  }
});

// Update service price (approver only)
app.put("/make-server-b2c42f95/service-prices/:id", async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);
    if (user.role !== 'approver' && user.role !== 'approver_store') {
      return c.json({ error: 'Apenas aprovadores podem gerenciar a tabela de preços' }, 403);
    }

    const id = c.req.param('id');
    const existing = await kv.get(`service-price:${id}`);
    if (!existing) return c.json({ error: 'Service price not found' }, 404);

    const { description, price, type } = await c.req.json();
    const updated = {
      ...existing,
      ...(description != null && { description }),
      ...(price != null && { price: Number(price) }),
      ...(type != null && { type }),
    };
    await kv.set(`service-price:${id}`, updated);

    return c.json({ servicePrice: updated });
  } catch (error) {
    console.log('Update service price error:', error);
    return c.json({ error: 'Failed to update service price' }, 500);
  }
});

// Delete service price (approver only)
app.delete("/make-server-b2c42f95/service-prices/:id", async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);
    if (user.role !== 'approver' && user.role !== 'approver_store') {
      return c.json({ error: 'Apenas aprovadores podem gerenciar a tabela de preços' }, 403);
    }

    const id = c.req.param('id');
    const existing = await kv.get(`service-price:${id}`);
    if (!existing) return c.json({ error: 'Service price not found' }, 404);

    await kv.del(`service-price:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete service price error:', error);
    return c.json({ error: 'Failed to delete service price' }, 500);
  }
});
```

- [ ] **Commit:**

```bash
git add supabase/functions/server/index.tsx
git commit -m "feat: CRUD /service-prices no backend"
```

---

## Task 7: objeto servicePrices no API client

**Files:**
- Modify: `src/lib/api.ts` — adicionar após o objeto `approvals`

- [ ] **Adicionar objeto `servicePrices` em `src/lib/api.ts` após o bloco de `approvals`:**

```ts
// Service Prices API
export const servicePrices = {
  async getAll(type?: 'montagem' | 'motoboy') {
    const query = type ? `?type=${type}` : '';
    return apiCall(`/service-prices${query}`);
  },

  async create(data: { description: string; price: number; type: 'montagem' | 'motoboy' }) {
    return apiCall('/service-prices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: { description?: string; price?: number; type?: 'montagem' | 'motoboy' }) {
    return apiCall(`/service-prices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async remove(id: string) {
    return apiCall(`/service-prices/${id}`, {
      method: 'DELETE',
    });
  },
};
```

- [ ] **Commit:**

```bash
git add src/lib/api.ts
git commit -m "feat: servicePrices no API client"
```

---

## Task 8: Componente admin ServicePricePage

**Files:**
- Create: `src/app/components/admin/ServicePricePage.tsx`

- [ ] **Criar o arquivo `src/app/components/admin/ServicePricePage.tsx` com o conteúdo completo:**

```tsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { servicePrices as servicePricesApi } from '../../../lib/api';
import type { ServicePrice } from '../../../types';
import { formatCurrency } from '../../../utils/currency';

interface ServicePricePageProps {
  // sem props por enquanto — usa usuário do contexto via API
}

type EditingState = { id: string; description: string; price: string } | null;

export function ServicePricePage(_props: ServicePricePageProps) {
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>(null);
  const [adding, setAdding] = useState<{ type: 'montagem' | 'motoboy'; description: string; price: string } | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await servicePricesApi.getAll();
      setPrices(data.prices ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar preços');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (type: 'montagem' | 'motoboy') => {
    if (!adding) {
      setAdding({ type, description: '', price: '' });
      return;
    }
    if (!adding.description.trim() || !adding.price) return;
    try {
      await servicePricesApi.create({
        description: adding.description.trim(),
        price: parseFloat(adding.price),
        type,
      });
      setAdding(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar preço');
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      await servicePricesApi.update(editing.id, {
        description: editing.description.trim(),
        price: parseFloat(editing.price),
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar preço');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este preço?')) return;
    try {
      await servicePricesApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover preço');
    }
  };

  const montagem = prices.filter(p => p.type === 'montagem');
  const motoboy = prices.filter(p => p.type === 'motoboy');

  const rowBase = 'flex items-center gap-2 text-xs py-2 border-b border-gray-100 last:border-0';
  const inputCls = 'flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-gray-500';
  const btnIcon = 'p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700';

  const Section = ({ title, type, items }: { title: string; type: 'montagem' | 'motoboy'; items: ServicePrice[] }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between py-2 border-b border-gray-200">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</span>
        <button
          onClick={() => setAdding({ type, description: '', price: '' })}
          className="flex items-center gap-1 text-xs text-gray-700 font-semibold hover:text-gray-900"
        >
          <Plus size={12} /> Adicionar
        </button>
      </div>

      {items.length === 0 && !(adding?.type === type) && (
        <p className="text-xs text-gray-400 py-2">Nenhum serviço cadastrado.</p>
      )}

      {items.map(p => (
        <div key={p.id} className={rowBase}>
          {editing?.id === p.id ? (
            <>
              <input
                className={inputCls}
                value={editing.description}
                onChange={e => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Descrição"
                autoFocus
              />
              <input
                className="w-24 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-gray-500"
                type="number"
                step="0.01"
                value={editing.price}
                onChange={e => setEditing(prev => prev ? { ...prev, price: e.target.value } : null)}
                placeholder="Valor"
              />
              <button onClick={handleSaveEdit} className={btnIcon}><Check size={13} className="text-green-600" /></button>
              <button onClick={() => setEditing(null)} className={btnIcon}><X size={13} /></button>
            </>
          ) : (
            <>
              <span className="flex-1 text-gray-700">{p.description}</span>
              <span className="w-24 font-semibold text-gray-900 tabular-nums">{formatCurrency(p.price)}</span>
              <button onClick={() => setEditing({ id: p.id, description: p.description, price: String(p.price) })} className={btnIcon}><Pencil size={12} /></button>
              <button onClick={() => handleDelete(p.id)} className={btnIcon}><Trash2 size={12} /></button>
            </>
          )}
        </div>
      ))}

      {adding?.type === type && (
        <div className={rowBase}>
          <input
            className={inputCls}
            value={adding.description}
            onChange={e => setAdding(prev => prev ? { ...prev, description: e.target.value } : null)}
            placeholder="Descrição do serviço"
            autoFocus
          />
          <input
            className="w-24 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-gray-500"
            type="number"
            step="0.01"
            value={adding.price}
            onChange={e => setAdding(prev => prev ? { ...prev, price: e.target.value } : null)}
            placeholder="Valor"
          />
          <button onClick={() => handleAdd(type)} className={btnIcon}><Check size={13} className="text-green-600" /></button>
          <button onClick={() => setAdding(null)} className={btnIcon}><X size={13} /></button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
      )}
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Carregando...</div>
      ) : (
        <>
          <Section title="Montagem (Laboratório)" type="montagem" items={montagem} />
          <Section title="Entrega Motoboy" type="motoboy" items={motoboy} />
        </>
      )}
    </div>
  );
}
```

- [ ] **Verificar que o arquivo foi criado sem erros de TypeScript:** `npx tsc --noEmit`

- [ ] **Commit:**

```bash
git add src/app/components/admin/ServicePricePage.tsx
git commit -m "feat: página admin ServicePricePage"
```

---

## Task 9: Aba "Preços" em UserAdminPage

**Files:**
- Modify: `src/app/components/admin/UserAdminPage.tsx`

- [ ] **Adicionar import de `ServicePricePage` e `Tag` icon no topo do arquivo:**

```ts
import { Plus, Users, Home, Tag } from 'lucide-react';
import { ServicePricePage } from './ServicePricePage';
```

- [ ] **Mudar o tipo `Tab` para incluir `'prices'`:**

```ts
type Tab = 'users' | 'stores' | 'prices';
```

- [ ] **Localizar o bloco de tabs (~linha 144) e adicionar o terceiro botão após o de 'stores':**

```tsx
<button
  className={`${tabBase} ${tab === 'prices' ? tabActive : tabInactive}`}
  onClick={() => setTab('prices')}
>
  <Tag size={13} />
  Preços
</button>
```

- [ ] **Localizar o bloco do botão "+ Novo usuário / Nova loja" (~linha 127) e atualizar para esconder o botão na aba preços** (o próprio `ServicePricePage` tem botões de adicionar por seção):

```tsx
{tab !== 'prices' && (
  <button
    onClick={() => {
      if (tab === 'users') {
        setEditingUser(null);
        setShowUserForm(true);
      } else {
        setEditingStore(null);
        setShowStoreForm(true);
      }
    }}
    className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
  >
    <Plus size={13} />
    {tab === 'users' ? 'Novo usuário' : 'Nova loja'}
  </button>
)}
```

- [ ] **Adicionar render da aba prices após o bloco de stores (~linha 218):**

```tsx
{/* Prices tab */}
{!loading && tab === 'prices' && (
  <ServicePricePage />
)}
```

- [ ] **Verificar manualmente:** Acessar área admin → confirmar nova aba "Preços" aparece. Clicar em "Adicionar" em Montagem → preencher descrição e valor → salvar → item aparece na lista. Editar → salvar → valor atualizado. Excluir → item some.

- [ ] **Commit:**

```bash
git add src/app/components/admin/UserAdminPage.tsx
git commit -m "feat: aba Preços na área admin"
```

---

## Task 10: Campo valor condicional em NewRequest

**Files:**
- Modify: `src/app/components/NewRequest.tsx`

- [ ] **Adicionar import de `servicePrices` no topo do arquivo (linha 11):**

```ts
import { stores, requests, auth, servicePrices as servicePricesApi } from '../../lib/api';
```

- [ ] **Adicionar import do tipo `ServicePrice`:**

```ts
import type { User, Store, Request, ServicePrice } from '../../types';
```

- [ ] **Adicionar estado para lista de preços após os estados existentes (~linha 47):**

```ts
const [priceOptions, setPriceOptions] = useState<ServicePrice[]>([]);
```

- [ ] **Adicionar carregamento dos preços no `useEffect` de montagem. Localizar o `useEffect` existente que carrega `stores` e `auth.me()` e adicionar o carregamento de preços dentro dele:**

```ts
// Dentro do useEffect existente, após carregar stores e auth:
const pricesResult = await servicePricesApi.getAll();
setPriceOptions(pricesResult.prices ?? []);
```

- [ ] **Localizar o bloco do campo "Valor (R$)" (~linha 295) e substituir completamente:**

```tsx
<div className="space-y-2">
  <Label htmlFor="value">Valor (R$) *</Label>
  {formData.type === 'sedex' ? (
    <Input
      id="value"
      type="number"
      step="0.01"
      value={formData.value}
      onChange={(e) => handleChange('value', e.target.value)}
      placeholder="0.00"
      required
    />
  ) : (() => {
    const options = priceOptions.filter(p => p.type === formData.type);
    if (options.length === 0) {
      return (
        <div className="space-y-1">
          <Input
            id="value"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => handleChange('value', e.target.value)}
            placeholder="0.00"
            required
          />
          <p className="text-xs text-amber-600">Tabela de preços não configurada — informe o valor manualmente.</p>
        </div>
      );
    }
    return (
      <Select
        id="value"
        value={formData.value}
        onChange={(e) => handleChange('value', e.target.value)}
        required
      >
        <option value="">Selecione o serviço</option>
        {options.map(p => (
          <option key={p.id} value={String(p.price)}>
            {p.description} — {formatCurrency(p.price)}
          </option>
        ))}
      </Select>
    );
  })()}
</div>
```

- [ ] **Adicionar limpeza do valor ao trocar o tipo de solicitação. Localizar o handler dos radio buttons (~linha 327) e adicionar reset do valor ao trocar tipo:**

```tsx
onChange={(e) => {
  handleChange('type', e.target.value);
  handleChange('value', '');
}}
```

Fazer isso nos 3 radio buttons (montagem, motoboy, sedex).

- [ ] **Verificar manualmente:**
  - Selecionar "Montagem" com preços cadastrados → campo valor vira select com opções. Selecionar uma opção → valor preenchido automaticamente.
  - Selecionar "Sedex" → campo valor volta a ser input numérico livre.
  - Selecionar "Motoboy" sem preços cadastrados → input manual com aviso em amarelo.
  - Trocar de Montagem para Sedex → valor limpa.
  - Submeter formulário → solicitação criada com valor correto.

- [ ] **Commit:**

```bash
git add src/app/components/NewRequest.tsx
git commit -m "feat: campo valor usa tabela de preços para montagem/motoboy"
```

---

## Verificação final

- [ ] Rodar `npx tsc --noEmit` e confirmar zero erros de TypeScript
- [ ] Testar fluxo completo: loja cria solicitação com serviço da tabela → aprovador reprova com observação → loja abre a solicitação → vê o motivo da reprovação
- [ ] Confirmar campo OS não aceita letras em nenhum cenário
