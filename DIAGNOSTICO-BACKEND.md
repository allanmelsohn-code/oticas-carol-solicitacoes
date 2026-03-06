# 🔧 Diagnóstico - Erro "Failed to Fetch" no Login

## Problema
O sistema está apresentando erro "failed to fetch" ao tentar fazer login.

## Possíveis Causas

### 1. Edge Function não está deployada ou não está ativa
**Sintoma:** Erro de conexão ao tentar acessar qualquer endpoint

**Solução:**
1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para o projeto `myuxgszvueycsutgojnp`
3. No menu lateral, clique em **Edge Functions**
4. Verifique se a função `make-server-b2c42f95` está listada e ativa
5. Se não estiver, faça o deploy novamente:
   ```bash
   supabase functions deploy make-server-b2c42f95
   ```

### 2. Problema de CORS
**Sintoma:** Erro de CORS no console do navegador

**Solução:**
- O servidor já está configurado com `app.use('*', cors())` no arquivo `/supabase/functions/server/index.tsx`
- Verifique se a função está usando a versão correta do Hono (4.0.2)

### 3. Edge Function com erro de sintaxe
**Sintoma:** Erro 500 ou timeout ao chamar qualquer endpoint

**Solução:**
1. Verifique os logs da Edge Function no Dashboard do Supabase:
   - Edge Functions → make-server-b2c42f95 → Logs
2. Procure por erros de sintaxe ou importação
3. Corrija os erros e faça redeploy

### 4. Banco de dados KV vazio (primeira execução)
**Sintoma:** Erro "E-mail ou senha incorretos" mesmo com credenciais corretas

**Solução:**
1. Execute o setup inicial acessando: `?setup=true` na URL do app
2. Ou acesse o arquivo `/setup.html` no navegador
3. Isso criará os usuários e lojas padrão no banco de dados

## Ferramentas de Diagnóstico

### Teste 1: Health Check Direto
Abra o navegador e acesse:
```
https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/health
```

**Resultado esperado:**
```json
{"status":"ok"}
```

Se você receber isso, o backend está funcionando!

### Teste 2: Página de Diagnóstico
Acesse o arquivo `/test-backend.html` no navegador e execute os testes automáticos.

### Teste 3: Console do Navegador
1. Abra o DevTools do navegador (F12)
2. Vá para a aba **Console**
3. Tente fazer login novamente
4. Procure por logs com os emojis:
   - 🚀 = Iniciando requisição
   - 📡 = Resposta recebida
   - ✅ = Sucesso
   - ❌ = Erro

### Teste 4: Aba Network
1. Abra o DevTools (F12)
2. Vá para a aba **Network**
3. Tente fazer login
4. Procure pela requisição para `/signin`
5. Verifique:
   - Status code (deve ser 200 para sucesso)
   - Response (corpo da resposta)
   - Headers (Authorization deve estar presente)

## Checklist de Verificação

- [ ] Edge Function está deployada no Supabase?
- [ ] Edge Function está respondendo no endpoint `/health`?
- [ ] Console do navegador mostra algum erro específico?
- [ ] Setup inicial foi executado (`?setup=true`)?
- [ ] Credenciais estão corretas? (admin@oticascarol.com.br / admin123)
- [ ] Há conexão com a internet?
- [ ] Firewall ou VPN está bloqueando a conexão?

## Logs Detalhados

Com as últimas alterações, agora temos logs muito mais detalhados:

### No Login (Frontend):
- 🔑 Email sendo usado
- 🌐 URL da API
- 📡 Status da resposta
- ❌ Detalhes do erro (se houver)

### No Backend (Edge Function):
- 🚀 Endpoint chamado
- 👤 Usuário autenticado
- ✅ Operação bem-sucedida
- ❌ Erros com contexto completo

## Comandos Úteis (Terminal)

### Testar Health Check via cURL:
```bash
curl https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/health \
  -H "Authorization: Bearer sb_publishable_Cyb7dkRd4A08p9D9I_smRg_BoN7C862"
```

### Testar Login via cURL:
```bash
curl -X POST https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server/signin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sb_publishable_Cyb7dkRd4A08p9D9I_smRg_BoN7C862" \
  -d '{"email":"admin@oticascarol.com.br","password":"admin123"}'
```

## Próximos Passos

1. **Primeiro**, teste o health check abrindo a URL no navegador
2. **Se funcionar**, o problema é no código de autenticação
3. **Se não funcionar**, o problema é no deploy da Edge Function
4. Use a página `/test-backend.html` para diagnóstico completo
5. Verifique os logs no console do navegador (F12)
6. Se necessário, faça redeploy da Edge Function no Supabase

## Informações do Projeto

- **Project ID:** myuxgszvueycsutgojnp
- **API Base:** https://myuxgszvueycsutgojnp.supabase.co/functions/v1/server
- **Edge Function:** server
- **Região:** Padrão Supabase (us-east-1)

## Usuários Padrão (após setup)

| Email | Senha | Perfil |
|-------|-------|--------|
| admin@oticascarol.com.br | admin123 | Aprovador |
| chris@oticascarol.com.br | chris123 | Aprovador |
| loja1640@oticascarol.com.br | senha123 | Loja |

---

**💡 Dica:** Sempre verifique o console do navegador (F12) primeiro - ele geralmente mostra a causa exata do problema!