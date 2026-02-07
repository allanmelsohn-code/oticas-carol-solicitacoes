# ⚡ QUICK START - Gerar Apps iOS & Android

## 🚀 **RESUMO EXECUTIVO**

Seu sistema web agora está pronto para virar app nativo! Siga estes passos:

---

## 📦 **COMANDOS RÁPIDOS**

```bash
# 1. Build do projeto
npm run build

# 2. Inicializar Capacitor (primeira vez)
npm run cap:init

# 3. Adicionar plataformas
npm run cap:add:android    # Para Android
npm run cap:add:ios        # Para iOS (só no Mac)

# 4. Sincronizar (após qualquer mudança)
npm run cap:sync

# 5. Abrir nos editores nativos
npm run cap:open:android   # Abre Android Studio
npm run cap:open:ios       # Abre Xcode (Mac)
```

---

## ⚙️ **SETUP MÍNIMO NECESSÁRIO**

### **1. Firebase (5 minutos)**
1. Criar projeto em: https://console.firebase.google.com/
2. Adicionar app Android → Baixar `google-services.json`
3. Adicionar app iOS → Baixar `GoogleService-Info.plist`
4. Copiar **Server Key** em Cloud Messaging

### **2. Supabase (1 minuto)**
1. Ir em: **Settings → Edge Functions → Secrets**
2. Adicionar secret:
   - **Name:** `FCM_SERVER_KEY`
   - **Value:** Server Key do Firebase

### **3. Copiar Arquivos do Firebase**

**Android:**
```
Copiar google-services.json → android/app/google-services.json
```

**iOS:**
```
Copiar GoogleService-Info.plist → ios/App/GoogleService-Info.plist
```

---

## 🎯 **WORKFLOW DIÁRIO**

Quando fizer mudanças no código:

```bash
npm run cap:sync          # Build + Sync com apps
npm run cap:open:android  # ou cap:open:ios
# Aperte RUN no Android Studio ou Xcode
```

---

## 🧪 **TESTAR**

1. Faça login como lojista no app
2. Crie uma solicitação
3. Aprovadores recebem notificação push! 🔔
4. Aprove/Reprove
5. Lojista recebe notificação push! 🔔

---

## 📱 **GERAR APK/IPA**

**Android:**
- Android Studio → Build → Generate Signed Bundle/APK

**iOS:**
- Xcode → Product → Archive → Distribute

---

## 📚 **DOCUMENTAÇÃO COMPLETA**

Veja o arquivo **`GUIA-APP-NATIVO.md`** para instruções detalhadas!

---

## ✅ **CHECKLIST**

- [ ] Firebase criado
- [ ] Server Key no Supabase
- [ ] `google-services.json` copiado
- [ ] `GoogleService-Info.plist` copiado (iOS)
- [ ] `npm run build` executado
- [ ] Apps gerados
- [ ] Notificações testadas

---

**Pronto para transformar seu sistema em app! 🚀**
