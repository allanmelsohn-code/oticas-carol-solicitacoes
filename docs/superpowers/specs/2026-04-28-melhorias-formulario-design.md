# Design: Melhorias no Formulário de Solicitações

**Data:** 2026-04-28  
**Status:** Aprovado

---

## Escopo

Três melhorias independentes no sistema de solicitações:

1. Campo OS aceita somente números
2. Justificativa de reprovação visível para a loja
3. Tabela de preços do fornecedor com seleção no formulário

---

## Feature 1: Campo OS — somente números

### Problema
O campo "Número da OS" em `NewRequest.tsx` aceita qualquer texto, mas OS é sempre numérico.

### Solução
- Adicionar `inputMode="numeric"` e `pattern="[0-9]*"` no `<Input>` do campo `osNumber`
- Filtrar no `onChange`: aceitar apenas dígitos (`/^\d*$/`)
- No mobile: abre teclado numérico automaticamente
- No desktop: bloqueia entrada de letras via handler

### Arquivos afetados
- `src/app/components/NewRequest.tsx` — campo `osNumber` (~linha 286)

### Sem mudanças em
- Backend, schema, KV storage

---

## Feature 2: Justificativa de reprovação para a loja

### Problema
O `RequestDropdown` já tem o visual "Motivo da reprovação" implementado, mas nunca exibe dados. O `approvalsMap` em `RequestsList` é inicializado vazio e nunca é populado, porque não há chamada à API.

### Causa raiz
- Não existe endpoint `GET /approvals/:requestId` no backend
- Não existe método `approvals.get()` no `api.ts`
- `RequestsList` nunca busca dados de aprovação

### Solução

**Backend** (`supabase/functions/server/index.tsx`):
- Adicionar `GET /make-server-b2c42f95/approvals/:requestId`
- Requer autenticação; retorna `kv.get('approval:{requestId}')` ou 404

**API client** (`src/lib/api.ts`):
- Adicionar `approvals.get(requestId: string)` chamando `GET /approvals/:requestId`

**Frontend** (`src/app/components/requests/RequestsList.tsx`):
- No `handleToggle`, ao abrir uma linha, verificar se `approvalsMap[id]` já existe
- Se não, chamar `approvals.get(id)` e atualizar `approvalsMap`
- Loading lazy: só busca quando o usuário expande a linha

### Fluxo
```
Loja expande linha → handleToggle(id)
  → se approvalsMap[id] === undefined
    → GET /approvals/:id
    → setApprovalsMap(prev => ({ ...prev, [id]: resultado }))
  → RequestDropdown recebe approval com dados reais
  → Exibe "Motivo da reprovação" em vermelho (já implementado)
```

### Arquivos afetados
- `supabase/functions/server/index.tsx` — novo endpoint GET approvals
- `src/lib/api.ts` — método `approvals.get()`
- `src/app/components/requests/RequestsList.tsx` — fetch no handleToggle

---

## Feature 3: Tabela de preços do fornecedor

### Problema
O campo "Valor" em `NewRequest.tsx` é um input numérico livre, sujeito a erros de digitação. Para Montagem e Motoboy existem preços fixos por serviço definidos pelo fornecedor.

### Modelo de dados

**KV key:** `service-price:{id}`

```ts
interface ServicePrice {
  id: string;
  description: string;  // ex: "Lente progressiva Shamir"
  price: number;        // ex: 120.00
  type: 'montagem' | 'motoboy';
}
```

### Backend (`supabase/functions/server/index.tsx`)

Novos endpoints (requerem autenticação; POST/PUT/DELETE requerem role `approver`):

| Método | Rota | Ação |
|--------|------|------|
| GET | `/service-prices` | Lista todos os preços (opcionalmente filtrado por `?type=montagem`) |
| POST | `/service-prices` | Cria novo item |
| PUT | `/service-prices/:id` | Atualiza item existente |
| DELETE | `/service-prices/:id` | Remove item |

### API client (`src/lib/api.ts`)

Novo objeto `servicePrices` com métodos `getAll(type?)`, `create(data)`, `update(id, data)`, `remove(id)`.

### Admin — nova aba "Tabela de Preços"

Localização: área admin (junto a Usuários e Lojas).

- Navegação: nova opção no `UserAdminPage` ou rota admin separada
- Layout: duas seções separadas — "Montagem" e "Motoboy"
- Cada seção: tabela com colunas Descrição | Valor | Ações (editar/excluir)
- Botão "+ Adicionar" abre formulário inline (descrição + valor)
- Sem modal: edição inline na linha da tabela para simplicidade

Novo arquivo: `src/app/components/admin/ServicePricePage.tsx`

### Formulário de solicitação (`NewRequest.tsx`)

**Lógica por tipo:**

| Tipo | Campo Valor |
|------|-------------|
| `sedex` | Input numérico livre (valor só conhecido após despacho) |
| `montagem` | Select com opções da tabela filtradas por `type=montagem` |
| `motoboy` | Select com opções da tabela filtradas por `type=motoboy` |

**Comportamento do select:**
- Opções: `"{description} — R$ {price}"` 
- Ao selecionar, `formData.value` é preenchido automaticamente com o `price` da opção
- Se a tabela estiver vazia para o tipo selecionado: exibe aviso "Tabela de preços não configurada" e cai de volta para input manual
- Os preços são carregados uma vez no `useEffect` de montagem do componente

**Troca de tipo:**
- Ao trocar para `sedex`: limpa `formData.value` e exibe input manual
- Ao trocar de `sedex` para outro tipo: limpa `formData.value` e exibe select

### Arquivos afetados
- `supabase/functions/server/index.tsx` — 4 novos endpoints
- `src/lib/api.ts` — objeto `servicePrices`
- `src/app/components/admin/ServicePricePage.tsx` — novo componente admin
- `src/app/components/NewRequest.tsx` — troca input por select condicional
- `src/app/components/Navigation.tsx` ou admin router — link para nova página

---

## Ordem de implementação sugerida

1. Feature 1 (OS numérico) — trivial, 5 min
2. Feature 2 (justificativa de reprovação) — bug fix, backend + frontend
3. Feature 3 (tabela de preços) — maior, backend + admin + formulário
