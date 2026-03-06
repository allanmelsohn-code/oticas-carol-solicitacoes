# 🧪 COMO TESTAR AS NOTIFICAÇÕES - PASSO A PASSO

## ✅ TESTE RÁPIDO (2 minutos)

### **Passo 1: Acessar a Página de Notificações**
1. Faça login no sistema
2. Clique no **ícone de sino (🔔)** no canto superior direito do cabeçalho
3. Você verá a página "Notificações"

### **Passo 2: Verificar o Status**
Na página, você verá um card de **Debug** no final mostrando:
```
Debug:
Suportado: ✅ Sim
Permissão: default (ou granted/denied)
Ativado: ❌ Não (ou ✅ Sim)
```

### **Passo 3: Ativar as Notificações**
1. Clique no botão grande azul **"Ativar Notificações"**
2. O navegador mostrará um popup perguntando: "Permitir que este site envie notificações?"
3. Clique em **"Permitir"** ou **"Allow"**
4. ✅ Uma notificação de teste aparecerá automaticamente!

### **Passo 4: Testar**
1. Após ativar, você verá o botão **"🧪 Testar Notificação"**
2. Clique nele
3. Uma notificação deve aparecer no seu sistema operacional

---

## 🔍 O QUE FAZER SE NÃO FUNCIONAR

### **Cenário 1: Botão "Ativar" não faz nada**
**Verifique no Console do Navegador:**
1. Pressione **F12** (ou clique com botão direito → Inspecionar)
2. Vá na aba **"Console"**
3. Clique em "Ativar Notificações" novamente
4. Você verá mensagens como:
   ```
   🔍 Verificando suporte a notificações...
   ✅ Suporte: true
   📝 Solicitando permissão ao usuário...
   ```

**Se aparecer erro:** Copie e me envie a mensagem de erro

### **Cenário 2: Aparece "Permissão Bloqueada"**
Significa que você clicou "Bloquear" no popup anteriormente.

**Solução Rápida:**
1. Veja o card vermelho com instruções na página
2. Clique no **ícone de cadeado** 🔒 na barra de endereços
3. Procure "Notificações" e altere para "Permitir"
4. Clique no botão **"🔄 Recarregar Página"**
5. Tente ativar novamente

### **Cenário 3: Notificações não aparecem**
Verifique:
1. ✓ O status no card Debug mostra "Ativado: ✅ Sim"?
2. ✓ As notificações do sistema operacional estão ativadas?
   - **Windows:** Configurações → Sistema → Notificações
   - **Mac:** Preferências → Notificações → [Seu Navegador]
3. ✓ O navegador não está em modo "Não Perturbe"?

---

## 📸 COMO DEVE FICAR

### **ANTES de Ativar:**
```
🔔 Configurações de Notificações

🔇 Notificações Desativadas
Ative para receber alertas quando houver atualizações.

[Botão Azul Grande: "Ativar Notificações"]

💡 Dica
Mantenha esta aba aberta em segundo plano...

Debug:
Suportado: ✅ Sim
Permissão: default
Ativado: ❌ Não
```

### **DEPOIS de Ativar:**
```
🔔 Configurações de Notificações

🔊 Notificações Ativadas
Você receberá alertas em tempo real sobre suas solicitações.

✅ Você será notificado quando:
• Uma nova solicitação for criada (aprovadores)
• Sua solicitação for aprovada
• Sua solicitação for reprovada

[Botão: "🧪 Testar Notificação"]
[Botão Vermelho: "Desativar"]

💡 Dica
Mantenha esta aba aberta...

Debug:
Suportado: ✅ Sim
Permissão: granted
Ativado: ✅ Sim
```

---

## 🎯 TESTE COMPLETO (Para Aprovadores e Lojistas)

### **Teste 1: Lojista Cria Solicitação → Aprovador é Notificado**
1. **Lojista:** Faça login e ative notificações
2. **Aprovador:** Faça login (em outra aba/navegador) e ative notificações
3. **Lojista:** Crie uma nova solicitação
4. **Aprovador:** Deve receber notificação: "🆕 Nova Solicitação Pendente"

### **Teste 2: Aprovador Aprova → Lojista é Notificado**
1. **Aprovador:** Aprove a solicitação criada
2. **Lojista:** Deve receber notificação: "✅ Solicitação Aprovada"

### **Teste 3: Aprovador Reprova → Lojista é Notificado**
1. **Aprovador:** Reprove uma solicitação
2. **Lojista:** Deve receber notificação: "❌ Solicitação Reprovada"

---

## 🐛 DEBUG AVANÇADO

### **Abrir Console do Navegador:**
1. Pressione **F12**
2. Vá na aba **Console**
3. Ative as notificações
4. Você verá logs detalhados:

```
🔍 Verificando suporte a notificações...
✅ Suporte: true
📋 Status atual:
  - Permissão do navegador: default
  - Notificações ativadas: false
🔔 Tentando ativar notificações...
📝 Solicitando permissão ao usuário...
📬 Permissão recebida: granted
✅ Notificações habilitadas e salvas no localStorage
✅ Permissão concedida!
📬 Notificação enviada: 🔔 Notificações Ativadas!
```

### **Verificar localStorage:**
No Console, digite:
```javascript
localStorage.getItem('notifications-enabled')
```
Deve retornar: `"true"`

### **Verificar Permissão do Navegador:**
No Console, digite:
```javascript
Notification.permission
```
Deve retornar: `"granted"`

---

## ✅ CHECKLIST FINAL

Antes de relatar qualquer problema, verifique:

- [ ] O navegador é Chrome, Firefox, Edge ou Safari atualizado?
- [ ] As notificações do sistema operacional estão ativadas?
- [ ] O navegador tem permissão para enviar notificações?
- [ ] Você clicou em "Permitir" quando o popup apareceu?
- [ ] O card Debug mostra "Permissão: granted" e "Ativado: ✅ Sim"?
- [ ] Você testou com o botão "🧪 Testar Notificação"?
- [ ] A aba do sistema está aberta (pode estar minimizada)?

---

## 📞 AINDA COM PROBLEMAS?

Me envie:
1. **Screenshot** da página de Notificações mostrando o card Debug
2. **Screenshot** do Console (F12 → Console) após clicar em "Ativar"
3. **Navegador e versão** que está usando
4. **Sistema operacional** (Windows/Mac/Android/iOS)

---

**Sistema Óticas Carol - Teste de Notificações**  
Atualizado: Fevereiro 2026
