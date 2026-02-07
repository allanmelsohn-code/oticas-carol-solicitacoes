# Documentação Técnica - Sistema Óticas Carol

## Arquitetura

### Padrão Arquitetural
- **Frontend**: React SPA (Single Page Application)
- **Backend**: Serverless (Supabase Edge Functions)
- **Database**: Key-Value Store (Supabase)
- **Auth**: Supabase Authentication

### Estrutura de Diretórios

```
/src
├── app/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes de UI base
│   │   ├── Login.tsx       # Tela de login
│   │   ├── Setup.tsx       # Configuração inicial
│   │   ├── Navigation.tsx  # Barra de navegação
│   │   ├── Dashboard.tsx   # Dashboard principal
│   │   ├── NewRequest.tsx  # Criar solicitação
│   │   ├── ApprovalPanel.tsx # Painel de aprovação
│   │   ├── MonthlyReport.tsx # Relatório mensal
│   │   ├── RequestsList.tsx  # Lista de solicitações
│   │   ├── RequestDetail.tsx # Detalhes da solicitação
│   │   └── Help.tsx        # Ajuda
│   └── App.tsx             # Componente principal
├── lib/
│   ├── api.ts              # Cliente API
│   ├── seed.ts             # Script de inicialização
│   └── utils.ts            # Funções utilitárias
├── types.ts                # Tipos TypeScript
└── styles/                 # Estilos globais

/supabase/functions/server
├── index.tsx               # Servidor Hono
├── types.tsx               # Tipos do servidor
└── kv_store.tsx           # Utilitário KV (protegido)
```

## Banco de Dados

### Estrutura de Dados (Key-Value Store)

#### Users
```typescript
Key: user:{userId}
Value: {
  id: string;
  email: string;
  name: string;
  role: 'store' | 'approver' | 'viewer';
  storeId?: string; // Apenas para role 'store'
}
```

#### Stores
```typescript
Key: store:{storeId}
Value: {
  id: string;
  code: string;
  name: string;
}
```

#### Requests
```typescript
Key: request:{requestId}
Value: {
  id: string;
  storeId: string;
  storeName: string;
  requestedBy: string;
  type: 'montagem' | 'motoboy';
  justification: string;
  value: number;
  date: string;
  osNumber: string;
  chargedToClient: boolean;
  status: 'pending' | 'approved' | 'rejected';
  attachments?: string[];
  createdAt: string;
}
```

#### Approvals
```typescript
Key: approval:{requestId}
Value: {
  requestId: string;
  approvedBy: string;
  approverName: string;
  action: 'approved' | 'rejected';
  observation?: string;
  timestamp: string;
}
```

## API Endpoints

### Auth
- `POST /make-server-b2c42f95/signup` - Criar usuário
- `POST /make-server-b2c42f95/signin` - Fazer login
- `GET /make-server-b2c42f95/me` - Obter usuário atual

### Stores
- `GET /make-server-b2c42f95/stores` - Listar lojas
- `POST /make-server-b2c42f95/stores` - Criar loja (apenas aprovadores)

### Requests
- `POST /make-server-b2c42f95/requests` - Criar solicitação
- `GET /make-server-b2c42f95/requests` - Listar solicitações (filtradas por role)
- `GET /make-server-b2c42f95/requests/:id` - Obter solicitação por ID

### Approvals
- `POST /make-server-b2c42f95/approvals` - Aprovar/reprovar solicitação (apenas aprovadores)

### Reports
- `GET /make-server-b2c42f95/reports/monthly` - Relatório mensal (com query params)

### Dashboard
- `GET /make-server-b2c42f95/stats` - Estatísticas do dashboard

## Autenticação e Autorização

### Fluxo de Autenticação
1. Usuário faz login com email/senha
2. Supabase Auth valida credenciais
3. Sistema retorna access token
4. Token é armazenado em localStorage
5. Token é enviado em todas as requisições subsequentes

### Controle de Acesso

#### Loja (store)
- Criar solicitações
- Visualizar próprias solicitações
- Visualizar dashboard filtrado

#### Aprovador (approver)
- Todas as permissões de loja
- Aprovar/reprovar solicitações
- Visualizar todas as solicitações
- Criar lojas
- Acessar relatórios mensais

#### Visualizador (viewer)
- Visualizar dashboard
- Acessar relatórios mensais

## Frontend

### State Management
- React Hooks (useState, useEffect)
- Sem biblioteca externa de state management
- Estado local por componente

### Componentes Principais

#### Login
- Formulário de autenticação
- Validação de credenciais
- Feedback de erro

#### Setup
- Configuração inicial do sistema
- Criação de usuários padrão
- Criação de lojas
- Login inline para criação de lojas

#### Dashboard
- Cards com estatísticas
- Totais de solicitações por status
- Métricas do mês atual

#### NewRequest
- Formulário completo de solicitação
- Validação de campos obrigatórios
- Feedback visual de sucesso

#### ApprovalPanel
- Tabela de solicitações pendentes
- Ações inline (aprovar/reprovar/visualizar)
- Modal de confirmação
- Histórico de processadas

#### MonthlyReport
- Filtros avançados
- Tabela de registros
- Totalizadores automáticos
- Exportação PDF/Excel

#### RequestsList
- Lista de solicitações da loja
- Visualização de detalhes
- Badges de status

### Estilização
- Tailwind CSS v4
- Componentes UI customizados
- Design responsivo
- Tema corporativo (azul/cinza)

## Backend

### Servidor
- Framework: Hono
- Runtime: Deno
- CORS habilitado
- Logging de erros

### Validação
- Validação de tokens em rotas protegidas
- Verificação de permissões por role
- Validação de dados de entrada

### Error Handling
- Try-catch em todas as rotas
- Logs detalhados no console
- Mensagens de erro claras para o frontend

## Segurança

### Implementado
✅ Autenticação via Supabase Auth
✅ Tokens JWT
✅ Controle de acesso por role
✅ Validação de permissões no backend
✅ CORS configurado
✅ Service Role Key protegida (apenas backend)

### Recomendações para Produção
- Implementar rate limiting
- Adicionar auditoria de ações
- Configurar backup automático
- Implementar rotação de tokens
- Adicionar HTTPS obrigatório
- Configurar logs centralizados
- Implementar monitoramento

## Exportação de Dados

### PDF
- Biblioteca: jsPDF + jspdf-autotable
- Formato: A4
- Conteúdo: Tabela formatada + totais
- Uso: Envio para fornecedores

### Excel (CSV)
- Formato: UTF-8
- Separador: vírgula
- Cabeçalhos incluídos
- Uso: Análise interna

## Performance

### Otimizações
- Componentes funcionais com React Hooks
- Carregamento lazy quando necessário
- Requisições paralelas quando possível
- Cache de dados em localStorage (token)

### Métricas
- Tempo de carregamento: < 2s
- Tempo de resposta API: < 500ms
- Tamanho do bundle: Otimizado pelo Vite

## Testes

### Sugeridos para Produção
- Testes unitários (Jest + React Testing Library)
- Testes de integração (Cypress)
- Testes de API (Postman/Newman)
- Testes de carga (k6)

## Deploy

### Frontend
- Build: `npm run build`
- Deploy automático via Figma Make

### Backend
- Deploy automático via Supabase
- Edge Functions global

## Troubleshooting

### Problemas Comuns

**Erro "Unauthorized" ao fazer login**
- Verificar se as credenciais estão corretas
- Confirmar que o usuário foi criado com sucesso
- Verificar logs do servidor

**Lojas não aparecem no dropdown**
- Verificar se as lojas foram criadas
- Confirmar que está logado como aprovador para criar lojas
- Verificar console do navegador para erros

**Relatórios vazios**
- Confirmar que existem solicitações aprovadas
- Verificar filtros de data
- Confirmar permissões do usuário

**Erro ao exportar PDF**
- Verificar se jspdf está instalado
- Verificar console para erros específicos
- Tentar exportar Excel como alternativa

## Manutenção

### Backup
- Exportar dados regularmente via API
- Fazer backup do código fonte
- Documentar configurações do Supabase

### Atualizações
- Monitorar dependências desatualizadas
- Testar em ambiente de staging
- Fazer deploy incremental

### Monitoramento
- Verificar logs do servidor regularmente
- Monitorar uso de recursos
- Acompanhar feedback dos usuários

## Contato Técnico

Para questões técnicas, consulte:
1. Este documento
2. README.md
3. SETUP.md
4. Código fonte com comentários
