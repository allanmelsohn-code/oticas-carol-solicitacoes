# 📱 GUIA COMPLETO: BUILD ANDROID - ÓTICAS CAROL APP

## 🎯 OBJETIVO
Gerar APK Android do sistema Óticas Carol com notificações push via Firebase Cloud Messaging.

---

## ✅ PRÉ-REQUISITOS

### 1. **Java JDK 17 ou superior**
- Download: https://adoptium.net/
- Verificar: `java -version`

### 2. **Node.js e npm** (já instalado ✅)

### 3. **Configuração do Firebase**
- Projeto Firebase criado: **Óticas Carol**
- Cloud Messaging ID: `30569876119`
- Server Key configurada no Supabase: ✅

---

## 📋 PASSO 1: BAIXAR google-services.json

### 1.1 Acessar Firebase Console
1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto **"Óticas Carol"**

### 1.2 Adicionar App Android (se não fez ainda)
1. Clique em ⚙️ **Project Settings**
2. Em **"Your apps"**, clique no ícone **Android**
3. Preencha:
   - **Android package name:** `com.oticascarol.app`
   - **App nickname:** `Óticas Carol Android`
   - **Debug signing certificate SHA-1:** (deixe em branco por enquanto)
4. Clique em **"Register app"**

### 1.3 Baixar google-services.json
1. Clique em **"Download google-services.json"**
2. Salve o arquivo
3. **IMPORTANTE:** Mova o arquivo para:
   ```
   android/app/google-services.json
   ```

---

## 🚀 PASSO 2: EXECUTAR BUILD

### 2.1 Fazer build do projeto web
```powershell
npm run build
```

### 2.2 Sincronizar com Capacitor
```powershell
npx cap sync android
```

### 2.3 Gerar APK Debug
```powershell
cd android
.\gradlew.bat assembleDebug
cd ..
```

**⏳ AGUARDE:** O primeiro build pode demorar 5-10 minutos!

---

## 📦 PASSO 3: LOCALIZAR E INSTALAR APK

### 3.1 Localizar APK
O arquivo estará em:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### 3.2 Instalar no celular

#### **Opção A: Via cabo USB**
1. Conecte celular via USB
2. Ative **"Depuração USB"** no celular:
   - Configurações > Sobre o telefone
   - Toque 7x em "Número da versão"
   - Volte > Opções do desenvolvedor
   - Ative "Depuração USB"
3. Execute:
   ```powershell
   npx cap run android
   ```

#### **Opção B: Transferir APK**
1. Copie `app-debug.apk` para o celular (via cabo, WhatsApp, ou email)
2. No celular, abra o arquivo APK
3. Permita "Instalar apps de fontes desconhecidas" se solicitado
4. Instale o app

---

## 🔔 PASSO 4: TESTAR NOTIFICAÇÕES PUSH

### 4.1 Primeiro uso
1. Abra o app no celular
2. Faça login
3. O app irá solicitar permissão para notificações - **ACEITE**
4. O token FCM será registrado automaticamente

### 4.2 Verificar registro do token
No Supabase Dashboard > Edge Functions > server > Logs, procure por:
```
✅ FCM token salvo para usuário [email] (android)
```

### 4.3 Teste completo
1. **Celular A:** Login com usuário **Loja**
2. **Celular B:** Login com usuário **Aprovador** (allan ou chris)
3. **No Celular A:** Crie uma nova solicitação
4. **No Celular B:** ✅ Receberá notificação push!

---

## ❌ TROUBLESHOOTING

### Erro: "SDK location not found"
**Solução:** Crie arquivo `android/local.properties` com:
```properties
sdk.dir=C\:\\Users\\SEU_USUARIO\\AppData\\Local\\Android\\Sdk
```

### Erro: "google-services.json not found"
**Solução:** 
1. Baixe do Firebase Console
2. Coloque em `android/app/google-services.json`
3. Execute `npx cap sync android` novamente

### Erro: "Java not found" ou versão errada
**Solução:**
1. Instale Java JDK 17+: https://adoptium.net/
2. Configure variável JAVA_HOME
3. Reinicie o PowerShell

### Erro durante gradlew assembleDebug
**Solução:**
```powershell
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
cd ..
```

### Notificações não chegam
**Checklist:**
- [ ] google-services.json configurado corretamente?
- [ ] Permissão de notificações aceita no app?
- [ ] FIREBASE_SERVER_KEY configurada no Supabase?
- [ ] Token FCM registrado? (verificar logs)

---

## 🔥 CONFIGURAÇÃO DO FIREBASE NO BACKEND

O backend já está configurado! A Server Key está salva no Supabase.

### Verificar configuração:
1. Supabase Dashboard
2. Project Settings > Edge Functions > Environment Variables
3. Confirmar que `FIREBASE_SERVER_KEY` existe

---

## 📊 MONITORAR LOGS

### No Supabase
Dashboard > Edge Functions > server > Logs

Procure por:
- `✅ FCM token salvo para usuário...`
- `📤 Enviando notificação push...`
- `✅ Notificação push enviada com sucesso`

### No celular (via adb)
```powershell
adb logcat | findstr "OticasCarol"
```

---

## 🎉 PRÓXIMOS PASSOS

### Para iOS (se tiver Mac):
1. `npx cap add ios`
2. `npx cap open ios`
3. Configurar no Xcode
4. Baixar `GoogleService-Info.plist` do Firebase
5. Build no Xcode

### Para produção (APK Release):
```powershell
cd android
.\gradlew.bat assembleRelease
cd ..
```

**⚠️ APK Release precisa ser assinado com keystore!**

---

## 📚 RECURSOS

- **Firebase Console:** https://console.firebase.google.com/
- **Capacitor Docs:** https://capacitorjs.com/
- **FCM Docs:** https://firebase.google.com/docs/cloud-messaging

---

## ✅ CHECKLIST FINAL

Antes de considerar completo:

- [ ] google-services.json baixado e em `android/app/`
- [ ] Build executado com sucesso
- [ ] APK gerado e localizado
- [ ] App instalado no celular
- [ ] Permissões de notificação aceitas
- [ ] Token FCM registrado (verificado nos logs)
- [ ] Teste de notificação realizado com sucesso

---

**Dúvidas? Entre em contato!** 🚀

**Data:** Fevereiro 2026  
**Versão:** 1.0.0
