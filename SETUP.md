# Sistema Óticas Carol - Guia de Configuração

## 🚀 Primeiros Passos

### 1. Criar Usuários

Abra o console do navegador (F12) e execute os comandos abaixo:

#### Criar Administrador
```javascript
await fetch('https://PROJECT_ID.supabase.co/functions/v1/make-server-b2c42f95/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@oticascarol.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'approver'
  })
});
```

#### Criar Chris (Aprovador)
```javascript
await fetch('https://PROJECT_ID.supabase.co/functions/v1/make-server-b2c42f95/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'chris@oticascarol.com',
    password: 'chris123',
    name: 'Chris',
    role: 'approver'
  })
});
```

### 2. Fazer Login

Use as credenciais criadas acima para fazer login no sistema.

### 3. Criar Lojas

Após fazer login como aprovador, abra o console novamente e execute:

```javascript
// Importar a API
import { stores } from '/src/lib/api';

// Criar lojas
await stores.create('OC001', 'Óticas Carol Shopping Center');
await stores.create('OC002', 'Óticas Carol Centro');
await stores.create('OC003', 'Óticas Carol Norte');
await stores.create('OC004', 'Óticas Carol Sul');
```

### 4. Criar Usuários de Loja

Ainda no console:

```javascript
await fetch('https://PROJECT_ID.supabase.co/functions/v1/make-server-b2c42f95/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'loja1@oticascarol.com',
    password: 'loja123',
    name: 'Funcionário Loja 1',
    role: 'store',
    storeId: 'ID_DA_LOJA_1' // Use o ID retornado ao criar a loja
  })
});
```

## 📋 Perfis de Usuário

### Loja (Franqueado/Funcionário)
- Criar novas solicitações
- Visualizar histórico de solicitações
- Acompanhar status de aprovação

### Aprovador (Admin e Chris)
- Aprovar/reprovar solicitações
- Visualizar todas as solicitações
- Acessar relatórios financeiros

### Visualizador
- Acessar relatórios financeiros
- Visualizar dashboard

## 🔄 Fluxo de Uso

1. **Loja** cria uma nova solicitação (Montagem ou Motoboy)
2. **Aprovador** recebe notificação e revisa a solicitação
3. **Aprovador** aprova ou reprova (com observação se reprovar)
4. **Loja** visualiza o status atualizado
5. **Aprovador** gera extrato mensal para conciliação

## 💰 Relatórios

- Filtros por loja, mês/ano, tipo de serviço
- Totais automáticos (cobrado/não cobrado, montagem/motoboy)
- Exportação em PDF e Excel

## 🎨 Funcionalidades

✅ Sistema de autenticação
✅ Controle de acesso por perfil
✅ Formulário de solicitação com validação
✅ Painel de aprovação em tempo real
✅ Dashboard com estatísticas
✅ Extrato mensal com filtros
✅ Exportação de relatórios
✅ Design responsivo e profissional
