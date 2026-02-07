# 📱 GUIA COMPLETO - APP NATIVO iOS & Android
## Sistema Óticas Carol com Notificações Push

---

## 🎯 **O QUE FOI IMPLEMENTADO**

✅ **Capacitor** instalado e configurado  
✅ **Push Notifications** nativas para iOS e Android  
✅ **Integração com Firebase Cloud Messaging (FCM)**  
✅ **Backend** pronto para enviar notificações  
✅ **Auto-registro** de tokens ao fazer login  
✅ **Notificações automáticas** para:
- Lojistas quando solicitações são aprovadas/reprovadas
- Aprovadores quando há novas solicitações

---

## 📋 **PRÉ-REQUISITOS**

### **Para Ambas as Plataformas:**
- [x] Node.js 18+ instalado
- [x] Projeto Figma Make buildado (`npm run build`)

### **Para Android:**
- [x] Android Studio instalado
- [x] Java JDK 17+ instalado
- [x] Conta Google Play (opcional, para publicar)

### **Para iOS:**
- [x] **Mac com macOS** (obrigatório)
- [x] Xcode 14+ instalado
- [x] Conta Apple Developer ($99/ano)
- [x] CocoaPods instalado (`sudo gem install cocoapods`)

---

## 🔥 **PASSO 1: Configurar Firebase**

### **1.1. Criar Projeto no Firebase**

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: **`Óticas Carol`**
4. Desative Google Analytics (opcional)
5. Clique em **"Criar projeto"**

### **1.2. Adicionar App Android**

1. No console do Firebase, clique no ícone do **Android**
2. Preencha:
   - **Nome do pacote Android:** `com.oticascarol.dashboard`
   - **Apelido do app:** Óticas Carol Android
3. Clique em **"Registrar app"**
4. **Baixe o arquivo `google-services.json`**
5. Salve em: `android/app/google-services.json` (após gerar o Android)

### **1.3. Adicionar App iOS**

1. No console do Firebase, clique no ícone do **iOS**
2. Preencha:
   - **ID do pacote iOS:** `com.oticascarol.dashboard`
   - **Apelido do app:** Óticas Carol iOS
3. Clique em **"Registrar app"**
4. **Baixe o arquivo `GoogleService-Info.plist`**
5. Salve em: `ios/App/GoogleService-Info.plist` (após gerar o iOS)

### **1.4. Obter Server Key**

1. No Firebase Console, vá em: **Configurações do Projeto** (ícone de engrenagem)
2. Vá na aba **"Cloud Messaging"**
3. Em **"Cloud Messaging API (Legacy)"**, copie a **"Chave do servidor"**
4. Guarde esta chave! Vamos usar no Supabase

---

## ⚙️ **PASSO 2: Configurar Variável de Ambiente no Supabase**

### **2.1. Adicionar FCM_SERVER_KEY**

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. Vá em **"Settings"** → **"Edge Functions"** → **"Secrets"**
3. Adicione uma nova secret:
   - **Name:** `FCM_SERVER_KEY`
   - **Value:** Cole a "Chave do servidor" do Firebase

4. Clique em **"Add Secret"**

✅ **Pronto!** O backend agora pode enviar notificações push!

---

## 🏗️ **PASSO 3: Build do Projeto Web**

Antes de gerar os apps nativos, você precisa fazer build do projeto web:

```bash
# No diretório do projeto
npm run build
```

Isso vai criar a pasta `dist/` com os arquivos do app.

---

## 📦 **PASSO 4: Inicializar Capacitor**

```bash
# Inicializar o Capacitor (apenas na primeira vez)
npx cap init

# Quando pedir, confirme:
# - App name: Óticas Carol
# - App ID: com.oticascarol.dashboard
# - WebDir: dist
```

---

## 📱 **PASSO 5A: Gerar e Configurar APP ANDROID**

### **5A.1. Adicionar Plataforma Android**

```bash
npx cap add android
```

### **5A.2. Copiar google-services.json**

Copie o arquivo `google-services.json` (baixado no Passo 1.2) para:
```
android/app/google-services.json
```

### **5A.3. Configurar build.gradle**

Edite `android/app/build.gradle` e adicione no final:

```gradle
apply plugin: 'com.google.gms.google-services'
```

Edite `android/build.gradle` e adicione nas dependencies:

```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
}
```

### **5A.4. Abrir no Android Studio**

```bash
npx cap open android
```

### **5A.5. Build e Teste**

1. No Android Studio, clique em **"Run"** (ou pressione Shift+F10)
2. Escolha um dispositivo (emulador ou físico)
3. Aguarde o build e instalação
4. **Teste o app!**

### **5A.6. Gerar APK para Produção**

No Android Studio:
1. **Build** → **Generate Signed Bundle / APK**
2. Escolha **APK**
3. Crie uma nova keystore (ou use existente)
4. Selecione **release**
5. Clique em **Finish**

O APK estará em: `android/app/release/app-release.apk`

---

## 🍎 **PASSO 5B: Gerar e Configurar APP iOS** *(Requer Mac)*

### **5B.1. Adicionar Plataforma iOS**

```bash
npx cap add ios
```

### **5B.2. Instalar Dependências**

```bash
cd ios/App
pod install
cd ../..
```

### **5B.3. Copiar GoogleService-Info.plist**

Copie o arquivo `GoogleService-Info.plist` (baixado no Passo 1.3) para:
```
ios/App/GoogleService-Info.plist
```

### **5B.4. Abrir no Xcode**

```bash
npx cap open ios
```

### **5B.5. Configurar Certificados**

No Xcode:
1. Selecione o projeto **App** no navegador esquerdo
2. Vá na aba **"Signing & Capabilities"**
3. Selecione seu **Team** (conta Apple Developer)
4. Xcode vai gerar automaticamente os certificados

### **5B.6. Habilitar Push Notifications**

1. Ainda em **"Signing & Capabilities"**
2. Clique no botão **"+ Capability"**
3. Adicione:
   - **Push Notifications**
   - **Background Modes** → marque **"Remote notifications"**

### **5B.7. Configurar APNs no Firebase**

1. No Xcode, vá em: **Xcode** → **Preferences** → **Accounts**
2. Clique no seu Time → **"Manage Certificates"**
3. Gere um **"Apple Push Notification service SSL"**
4. Baixe o certificado `.p8`
5. No Firebase Console:
   - Vá em **Project Settings** → **Cloud Messaging**
   - Em **iOS app configuration**, faça upload do certificado `.p8`

### **5B.8. Build e Teste**

1. No Xcode, selecione um dispositivo (real ou simulator)
2. Clique no botão **Play** (ou Cmd+R)
3. Aguarde o build
4. **Teste o app!**

### **5B.9. Gerar IPA para App Store**

1. No Xcode: **Product** → **Archive**
2. Quando finalizar, clique em **"Distribute App"**
3. Escolha **"App Store Connect"**
4. Siga o assistente
5. Faça upload para o App Store Connect

---

## 🔄 **ATUALIZANDO O APP (Workflow Diário)**

Quando fizer mudanças no código:

```bash
# 1. Build do projeto web
npm run build

# 2. Sincronizar com apps nativos
npx cap sync

# 3. Abrir no Android Studio ou Xcode
npx cap open android
# ou
npx cap open ios
```

---

## 🧪 **TESTANDO NOTIFICAÇÕES PUSH**

### **Teste 1: Criar Solicitação (Lojista)**

1. Faça login como lojista no app (ex: `loja1640@oticascarol.com.br`)
2. Crie uma nova solicitação
3. **Aprovadores devem receber notificação:** "🆕 Nova Solicitação Pendente"

### **Teste 2: Aprovar Solicitação (Aprovador)**

1. Faça login como aprovador (ex: `admin@oticascarol.com.br`)
2. Aprove uma solicitação
3. **Lojista deve receber notificação:** "✅ Solicitação Aprovada"

### **Teste 3: Reprovar Solicitação (Aprovador)**

1. Como aprovador, reprove uma solicitação
2. **Lojista deve receber notificação:** "❌ Solicitação Reprovada"

---

## 🐛 **TROUBLESHOOTING**

### **Android: google-services.json não encontrado**
- Certifique-se que o arquivo está em: `android/app/google-services.json`
- Execute `npx cap sync` novamente

### **iOS: CocoaPods error**
```bash
cd ios/App
pod deintegrate
pod install
cd ../..
```

### **Notificações não chegam**
1. Verifique se `FCM_SERVER_KEY` está configurada no Supabase
2. Veja os logs do servidor Supabase (Edge Functions)
3. Teste com um usuário que acabou de fazer login (token registrado)

### **Build failed no iOS**
- Certifique-se de ter um Team selecionado em Signing
- Limpe o build: **Product** → **Clean Build Folder** (Shift+Cmd+K)

---

## 📦 **PUBLICANDO NAS LOJAS**

### **Google Play Store (Android)**

1. Crie uma conta em: https://play.google.com/console
2. Taxa única: $25
3. Crie um novo app
4. Faça upload do APK gerado
5. Preencha as informações (descrição, screenshots, etc.)
6. Envie para revisão

### **Apple App Store (iOS)**

1. Crie uma conta Apple Developer: https://developer.apple.com/
2. Taxa anual: $99
3. Acesse App Store Connect: https://appstoreconnect.apple.com/
4. Crie um novo app
5. Faça upload do IPA gerado no Xcode
6. Preencha as informações
7. Envie para revisão

---

## 📊 **MONITORAMENTO**

### **Ver Logs do Backend:**
1. Acesse Supabase Dashboard
2. Vá em **Edge Functions**
3. Selecione a função `make-server-b2c42f95`
4. Veja os logs em tempo real

### **Ver Tokens Registrados:**
No console do Supabase (Query Editor):
```sql
SELECT * FROM kv_store WHERE key LIKE 'fcm_token:%';
```

---

## 🎨 **PERSONALIZAÇÕES**

### **Trocar Ícone do App:**

1. Gere ícones com: https://icon.kitchen/
2. Substitua em:
   - **Android:** `android/app/src/main/res/mipmap-*`
   - **iOS:** `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### **Trocar Splash Screen:**

1. Edite: `android/app/src/main/res/drawable/splash.png`
2. Edite: `ios/App/App/Assets.xcassets/Splash.imageset/`

---

## ✅ **CHECKLIST FINAL**

Antes de publicar, verifique:

- [ ] Firebase configurado com ambos os apps (iOS e Android)
- [ ] `FCM_SERVER_KEY` adicionada no Supabase
- [ ] `google-services.json` copiado para Android
- [ ] `GoogleService-Info.plist` copiado para iOS
- [ ] Push Notifications habilitadas no Xcode (iOS)
- [ ] APNs configurado no Firebase (iOS)
- [ ] Testado notificações em dispositivos reais
- [ ] Ícones e splash screens personalizados
- [ ] Build de produção gerado (APK/IPA)
- [ ] Informações da loja preenchidas
- [ ] Screenshots tirados

---

## 🚀 **PRONTO!**

Seu app agora é nativo para iOS e Android com notificações push funcionando perfeitamente!

### **Links Úteis:**
- 📘 Documentação Capacitor: https://capacitorjs.com/docs
- 🔥 Firebase Console: https://console.firebase.google.com/
- 🍎 App Store Connect: https://appstoreconnect.apple.com/
- 🤖 Google Play Console: https://play.google.com/console

---

**Desenvolvido para Óticas Carol**  
Fevereiro 2026
