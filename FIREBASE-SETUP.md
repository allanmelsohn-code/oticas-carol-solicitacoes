# INSTRUÇÕES: CONFIGURAR FIREBASE NO ANDROID

## 📋 CHECKLIST PRÉ-BUILD

Antes de executar `build-apk.ps1`, siga estes passos:

---

## 1️⃣ BAIXAR google-services.json

1. Acesse: **https://console.firebase.google.com/**
2. Selecione o projeto **"Óticas Carol"** (ID: `30569876119`)
3. Clique em ⚙️ **Project Settings**
4. Vá em **"Your apps"** > Seção **Android**
5. Se ainda não adicionou o app Android:
   - Clique em **"Add app"** > Android
   - Package name: `com.oticascarol.app`
   - App nickname: `Óticas Carol Android`
   - Clique em **"Register app"**
6. **Download** do arquivo `google-services.json`
7. **Mova** o arquivo para:
   ```
   C:\Users\allan\oticas-carol-app\android\app\google-services.json
   ```

---

## 2️⃣ VERIFICAR CONFIGURAÇÃO DO GRADLE

O Capacitor já deve ter configurado automaticamente, mas verifique:

### Arquivo: `android/build.gradle`

Deve ter esta linha no bloco `dependencies`:
```gradle
classpath 'com.google.gms:google-services:4.4.0'
```

### Arquivo: `android/app/build.gradle`

No final do arquivo, deve ter:
```gradle
apply plugin: 'com.google.gms.google-services'
```

---

## 3️⃣ EXECUTAR O BUILD

Agora sim, execute:

```powershell
cd C:\Users\allan\oticas-carol-app
.\build-apk.ps1
```

---

## ✅ RESULTADO ESPERADO

Ao final você terá:
- ✅ APK gerado em: `android\app\build\outputs\apk\debug\app-debug.apk`
- ✅ App funcionando com notificações push
- ✅ Pronto para instalar em qualquer Android

---

## 🎯 APÓS INSTALAR NO CELULAR

1. **Abra o app**
2. **Faça login** (ex: allan@oticascarol.com.br)
3. **Permita notificações** quando o app solicitar
4. **O token FCM será salvo automaticamente no backend**

Verificar no Supabase Logs se apareceu:
```
✅ FCM token salvo para usuário allan@oticascarol.com.br (android)
```

---

## 🔔 TESTAR NOTIFICAÇÕES

### Cenário 1: Nova Solicitação
1. Login com **Loja** no celular A
2. Login com **Aprovador** no celular B
3. Crie uma solicitação no celular A
4. ✅ Notificação chega no celular B!

### Cenário 2: Aprovação/Reprovação
1. Aprovador aprova/reprova uma solicitação
2. ✅ Loja recebe notificação!

---

Qualquer dúvida, avise! 🚀
