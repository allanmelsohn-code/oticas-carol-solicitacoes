# 📱 GUIA: COMO GERAR APK DO ÓTICAS CAROL APP

## ✅ PRÉ-REQUISITOS

1. **Java JDK 17+** instalado
   - Download: https://adoptium.net/
   - Verifique: `java -version`

2. **Node.js** instalado (já tem ✅)

3. **Arquivo google-services.json** do Firebase
   - Baixe em: https://console.firebase.google.com/
   - Coloque em: `android/app/google-services.json`

---

## 🚀 MÉTODO AUTOMÁTICO (RECOMENDADO)

### Execute o script PowerShell:

```powershell
cd C:\Users\allan\oticas-carol-app
.\build-apk.ps1
```

Se der erro de execução, permita scripts:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## 🔧 MÉTODO MANUAL

### 1️⃣ **Fazer build do projeto web:**

```powershell
npm run build
```

### 2️⃣ **Sincronizar com Capacitor:**

```powershell
npx cap sync android
```

### 3️⃣ **Gerar APK:**

```powershell
cd android
.\gradlew.bat assembleDebug
cd ..
```

### 4️⃣ **Localizar o APK:**

O arquivo estará em:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 📤 INSTALAR NO CELULAR ANDROID

### **Opção 1: Via USB**
1. Conecte o celular via USB
2. Ative "Depuração USB" nas opções do desenvolvedor
3. Execute:
   ```powershell
   npx cap run android
   ```

### **Opção 2: Instalar APK manualmente**
1. Copie o arquivo `app-debug.apk` para o celular
2. Abra o arquivo no celular
3. Permita instalação de apps desconhecidos
4. Instale o app

### **Opção 3: Enviar por WhatsApp/Email**
1. Envie o APK por WhatsApp ou Email
2. Abra no celular e instale

---

## ❌ PROBLEMAS COMUNS

### **Erro: "Java not found"**
- Instale Java JDK 17+: https://adoptium.net/
- Adicione ao PATH do sistema

### **Erro: "google-services.json not found"**
1. Baixe do Firebase Console
2. Coloque em: `android/app/google-services.json`

### **Erro: "Gradle sync failed"**
```powershell
cd android
.\gradlew.bat clean
cd ..
npx cap sync android
```

### **Erro: "SDK location not found"**
1. Crie arquivo `android/local.properties`
2. Adicione (ajuste o caminho):
   ```
   sdk.dir=C\:\\Users\\allan\\AppData\\Local\\Android\\Sdk
   ```

---

## 🎯 PRÓXIMOS PASSOS APÓS INSTALAR

1. **Abra o app no celular**
2. **Faça login**
3. **Permita notificações** quando solicitado
4. **Teste criar uma solicitação**
5. **Verifique se recebe notificação push**

---

## 🔥 CONFIGURAR NOTIFICAÇÕES PUSH

O app já está configurado para:
- ✅ Solicitar permissão de notificações
- ✅ Registrar token FCM no backend
- ✅ Receber notificações em tempo real

**Para testar:**
1. Instale em 2 celulares (ou 1 celular + 1 emulador)
2. Login com usuário "Loja" no primeiro
3. Login com usuário "Aprovador" no segundo
4. Crie uma solicitação no primeiro
5. Notificação chegará no segundo! 🎉

---

## 📊 MONITORAR NOTIFICAÇÕES

Logs do servidor aparecem no Supabase:
- Dashboard > Edge Functions > server > Logs

Procure por:
- `✅ FCM token salvo para usuário...`
- `📤 Enviando notificação push...`
- `✅ Notificação push enviada com sucesso`

---

## 🚀 GERAR APK DE PRODUÇÃO (Release)

Quando estiver pronto para produção:

```powershell
cd android
.\gradlew.bat assembleRelease
cd ..
```

APK estará em: `android\app\build\outputs\apk\release\`

**IMPORTANTE:** APK Release precisa ser assinado com keystore!

---

Boa sorte! 🎉
