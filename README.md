# Sistema de Controle Operacional - Óticas Carol

Dashboard administrativo para controle operacional e financeiro das franquias Óticas Carol, com foco em solicitações de serviços, aprovação centralizada e conciliação mensal por loja.

## 🚀 Início Rápido

### 1. Acesse a Configuração Inicial

Na tela de login, clique em **"Primeira vez? Configure o sistema aqui"** ou acesse diretamente com `?setup=true` na URL.

### 2. Configuração Automática

1. Clique em **"Criar Usuários Padrão"** para criar:
   - **Administrador**: `admin@oticascarol.com` / `admin123`
   - **Chris**: `chris@oticascarol.com` / `chris123`

2. Na seção **"Criar Lojas"**, faça login com o usuário admin

3. Clique em **"Criar Lojas Padrão"** para criar:
   - OC001 - Óticas Carol Shopping Center
   - OC002 - Óticas Carol Centro
   - OC003 - Óticas Carol Norte
   - OC004 - Óticas Carol Sul

4. Clique em **"Ir para Login"** e faça login com admin@oticascarol.com

### 3. Comece a Usar

Agora você pode:
- ✅ Criar solicitações de serviço
- ✅ Aprovar/reprovar solicitações
- ✅ Visualizar dashboard com estatísticas
- ✅ Gerar relatórios mensais
- ✅ Exportar dados em PDF e Excel

## 👥 Perfis de Usuário

### 🏪 Loja (Franqueado / Funcionário)
- Criar novas solicitações (Montagem ou Motoboy)
- Visualizar histórico de solicitações
- Acompanhar status de aprovação
- Ver detalhes de cada solicitação

### ✅ Aprovador (Administrador e Chris)
- Aprovar ou reprovar solicitações
- Adicionar observações
- Visualizar todas as solicitações do sistema
- Acessar dashboard com estatísticas gerais
- Gerar relatórios financeiros mensais
- Criar novas lojas
- Exportar dados em PDF/Excel

### 👀 Visualizador
- Visualizar dashboard
- Acessar relatórios financeiros
- Exportar dados

## 📋 Funcionalidades

### 1. Solicitação de Pedido (Loja)

Formulário completo com:
- Loja (dropdown com código e nome)
- Solicitante (nome do responsável)
- Tipo de solicitação (Montagem ou Entrega Motoboy)
- Justificativa (campo texto)
- Valor do serviço (R$)
- Data da solicitação
- Número da OS
- Cobrado do cliente? (Sim/Não - toggle)

Status inicial: **Pendente de aprovação**

### 2. Aprovação de Solicitações

Painel exclusivo para aprovadores com:
- Lista de solicitações pendentes
- Informações completas de cada solicitação
- Ações: Aprovar / Reprovar / Visualizar Detalhes
- Campo obrigatório de observação para reprovação
- Histórico de solicitações processadas

### 3. Extrato Mensal por Loja

Relatório financeiro com:

**Filtros:**
- Loja
- Mês / Ano
- Tipo de serviço (Montagem / Motoboy)

**Totais Automáticos:**
- Total geral
- Total cobrado do cliente
- Total não cobrado
- Total por tipo de serviço (Montagem / Motoboy)

**Exportação:**
- PDF (formato profissional)
- Excel (CSV)

### 4. Dashboard

Visão geral com:
- Total de solicitações
- Solicitações pendentes
- Solicitações aprovadas
- Solicitações reprovadas
- Estatísticas do mês atual
- Valor total mensal

## 🎨 Interface

- Design clean, corporativo e profissional
- Layout responsivo (desktop e mobile)
- Cores neutras com destaque para status
- Componentes reutilizáveis
- Navegação intuitiva
- Feedback visual para todas as ações

## 📊 Fluxo de Uso

1. **Loja** acessa o sistema e cria nova solicitação
2. Solicitação fica com status "Pendente"
3. **Aprovador** visualiza no painel de aprovações
4. **Aprovador** analisa e aprova ou reprova
5. **Loja** vê o status atualizado
6. No fim do mês, **Aprovador** gera extrato para conciliação
7. Relatório pode ser exportado em PDF ou Excel

## 🔐 Segurança

- Autenticação via Supabase
- Controle de acesso por perfil
- Rotas protegidas no backend
- Validação de permissões em cada ação

## ⚠️ Importante

Este sistema foi criado no Figma Make e **não é destinado a coletar informações pessoais sensíveis (PII) ou proteger dados críticos de negócio**. Para uso em produção com dados financeiros reais, recomendamos:

1. Revisão de segurança adicional
2. Implementação de auditoria
3. Backup automático de dados
4. SSL/TLS certificado
5. Monitoramento de acessos

## 💡 Dicas de Uso

### Criar Usuários de Loja

Após criar as lojas, você pode criar usuários vinculados a cada loja:

1. Na tela de Setup, em "Criar Usuário Manualmente"
2. Preencha nome, email, senha
3. Selecione perfil "Loja"
4. O usuário será vinculado à loja

### Conciliação Mensal

1. Acesse "Extrato Mensal"
2. Selecione o mês/ano
3. Escolha a loja (ou todas)
4. Filtre por tipo de serviço se necessário
5. Confira os totais
6. Exporte em PDF para enviar ao laboratório/motoboy
7. Exporte em Excel para análise interna

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript
- **Estilo**: Tailwind CSS v4
- **Backend**: Supabase (Edge Functions + Auth + Database)
- **Servidor**: Hono (Deno)
- **Exportação**: jsPDF + jspdf-autotable
- **Ícones**: Lucide React

## 📞 Suporte

Para dúvidas sobre o sistema:
1. Verifique este README
2. Consulte o arquivo SETUP.md
3. Revise os logs no console do navegador (F12)

---

**Sistema desenvolvido para Óticas Carol** 👓
