# 🚀 Configuração Completa do Supabase

## Pré-requisitos

- Node.js instalado (versão 18 ou superior)
- Conta no Supabase (https://supabase.com)
- Supabase CLI instalado

## Passo 1: Instalar Supabase CLI

### Windows:
```powershell
npm install -g supabase
```

### macOS/Linux:
```bash
npm install -g supabase
```

### Verificar instalação:
```bash
supabase --version
```

## Passo 2: Login no Supabase CLI

```bash
supabase login
```

Isso abrirá o navegador para você fazer login. Após o login, você receberá um token de acesso.

## Passo 3: Vincular ao Projeto Existente

O projeto já existe com ID: `myuxgszvueycsutgojnp`

```bash
supabase link --project-ref myuxgszvueycsutgojnp
```

Você será solicitado a inserir a senha do banco de dados. Se você não souber, pode resetá-la no Dashboard do Supabase.

## Passo 4: Deploy da Edge Function

A Edge Function é o backend do sistema. Ela precisa ser deployada no Supabase.

```bash
# Deploy da função server (backend principal)
supabase functions deploy server --no-verify-jwt

# Verificar se foi deployado
supabase functions list
```

### Importante sobre --no-verify-jwt:
Esta flag é necessária porque estamos usando autenticação customizada (baseada em sessões) ao invés do JWT padrão do Supabase Auth.

## Passo 5: Configurar Variáveis de Ambiente (Secrets)

O backend precisa de algumas variáveis de ambiente. Vamos configurá-las:

```bash
# Obter a URL do projeto
supabase status

# Configurar secrets
supabase secrets set SUPABASE_URL=https://myuxgszvueycsutgojnp.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>
```

### Como obter as chaves:

1. Acesse: https://supabase.com/dashboard/project/myuxgszvueycsutgojnp/settings/api
2. Copie:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key - **mantenha em segredo!**)

## Passo 6: Verificar Deployment

Após o deploy, teste se o backend está funcionando:

### Teste via navegador:
```
https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/health
```

Resposta esperada:
```json
{"status":"ok"}
```

### Teste via cURL:
```bash
curl https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/health \
  -H "Authorization: Bearer sb_publishable_Cyb7dkRd4A08p9D9I_smRg_BoN7C862"
```

## Passo 7: Executar Setup Inicial

Após confirmar que o backend está funcionando:

1. Acesse o aplicativo com `?setup=true` na URL
2. Clique em "Testar Conexão com Backend"
3. Se estiver online, clique em "Executar Setup Completo"
4. Isso criará os usuários e lojas padrão

## Estrutura de Arquivos do Supabase

```
/supabase/
  /functions/
    /server/
      index.tsx       # Arquivo principal do backend
      kv_store.tsx    # Funções de banco de dados
      email.tsx       # Funções de email
      fcm.ts          # Notificações push
      types.ts        # Tipos TypeScript
```

## Comandos Úteis

### Ver logs em tempo real:
```bash
supabase functions serve server
```

### Ver logs de produção:
```bash
supabase functions logs server
```

### Fazer redeploy:
```bash
supabase functions deploy server --no-verify-jwt
```

### Listar todas as funções:
```bash
supabase functions list
```

### Deletar uma função:
```bash
supabase functions delete server
```

## Troubleshooting

### Erro: "Function not found"
**Causa:** A função não foi deployada ou o nome está errado.

**Solução:**
```bash
supabase functions deploy server --no-verify-jwt
```

### Erro: "Invalid JWT"
**Causa:** A flag `--no-verify-jwt` não foi usada no deploy.

**Solução:**
```bash
supabase functions deploy server --no-verify-jwt
```

### Erro: "Project not linked"
**Causa:** O projeto não foi vinculado ao CLI.

**Solução:**
```bash
supabase link --project-ref myuxgszvueycsutgojnp
```

### Erro: "Permission denied"
**Causa:** Você não tem permissão para acessar o projeto.

**Solução:**
1. Verifique se você está logado com a conta correta
2. Verifique se você tem acesso ao projeto no Dashboard
3. Tente fazer login novamente: `supabase login`

## Verificação Final

Depois de tudo configurado, faça este checklist:

- [ ] Supabase CLI instalado e logado
- [ ] Projeto vinculado (`supabase link`)
- [ ] Edge Function deployada (`supabase functions deploy server --no-verify-jwt`)
- [ ] Health check retorna `{"status":"ok"}`
- [ ] Setup inicial executado (cria usuários e lojas)
- [ ] Login funciona com `admin@oticascarol.com.br` / `admin123`

## Próximos Passos

Após a configuração inicial:

1. **Teste o login** com as credenciais de admin
2. **Acesse o painel de gerenciamento de usuários** (perfil admin)
3. **Crie uma solicitação de teste** (perfil loja)
4. **Aprove/rejeite a solicitação** (perfil aprovador)
5. **Gere um relatório mensal** para verificar exportação

## Suporte

Se você encontrar problemas:

1. Verifique os logs: `supabase functions logs server`
2. Teste o health check no navegador
3. Use a página `/test-backend.html` para diagnóstico
4. Consulte o arquivo `/DIAGNOSTICO-BACKEND.md`

## Informações do Projeto

- **Project ID:** myuxgszvueycsutgojnp
- **Project URL:** https://myuxgszvueycsutgojnp.supabase.co
- **Edge Function:** server
- **Região:** us-east-1 (padrão Supabase)

---

📝 **Nota:** Mantenha a `SUPABASE_SERVICE_ROLE_KEY` em segredo! Nunca a exponha no frontend ou em repositórios públicos.