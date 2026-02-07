# 🚀 GUIA COMPLETO: Criar Projeto Local Óticas Carol

## 📋 PRÉ-REQUISITOS

### Instale no seu PC (Windows):

1. **Node.js** (v18 ou superior)
   - Download: https://nodejs.org/
   - Escolha a versão LTS
   - Confirme: `node -v` e `npm -v`

2. **Git** (opcional, mas recomendado)
   - Download: https://git-scm.com/

3. **Android Studio** (para Android)
   - Download: https://developer.android.com/studio
   - Durante instalação, inclua:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device

4. **VS Code** (recomendado)
   - Download: https://code.visualstudio.com/

---

## 📁 PASSO 1: CRIAR ESTRUTURA DO PROJETO

### 1.1. Abra o PowerShell (normal, não precisa ser admin):

```powershell
# Habilitar scripts (se ainda não fez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 1.2. Crie a pasta do projeto:

```powershell
# Navegue para onde quer criar (exemplo: Documents)
cd $HOME\Documents

# Crie a pasta
mkdir oticas-carol-app
cd oticas-carol-app
```

---

## 📦 PASSO 2: BAIXAR OS ARQUIVOS DO FIGMA MAKE

### Opção A: Download Manual (RECOMENDADO)

1. **No Figma Make**, procure por um botão de **"Export"** ou **"Download"** 
2. Baixe todos os arquivos do projeto
3. Extraia dentro de `C:\Users\SEU_USUARIO\Documents\oticas-carol-app`

### Opção B: Copiar Arquivos Manualmente

Vou te dar a lista completa de arquivos para copiar do Figma Make.

**ARQUIVOS ESSENCIAIS (copie do Figma Make):**

```
📁 oticas-carol-app/
├── 📄 package.json
├── 📄 vite.config.ts
├── 📄 capacitor.config.ts
├── 📄 postcss.config.mjs
├── 📄 index.html (crie se não existir)
├── 📁 src/
│   ├── 📁 app/
│   │   ├── App.tsx
│   │   └── 📁 components/ (todos os arquivos .tsx)
│   ├── 📁 lib/
│   │   ├── api.ts
│   │   ├── notifications.ts
│   │   ├── pushNotifications.ts
│   │   ├── seed.ts
│   │   └── utils.ts
│   ├── 📁 styles/
│   │   ├── fonts.css
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── theme.css
│   ├── 📁 types.ts
│   └── 📁 utils/
│       └── currency.ts
├── 📁 supabase/
│   └── 📁 functions/
│       └── 📁 server/
│           ├── index.tsx
│           ├── fcm.ts
│           ├── kv_store.tsx
│           ├── types.ts
│           └── types.tsx
└── 📁 utils/
    └── 📁 supabase/
        └── info.tsx
```

---

## ⚙️ PASSO 3: CONFIGURAR O PROJETO

### 3.1. Abra o terminal na pasta do projeto:

```powershell
cd $HOME\Documents\oticas-carol-app
```

### 3.2. Instale as dependências:

```powershell
npm install
```

Isso vai instalar TODAS as bibliotecas necessárias (React, Capacitor, Supabase, etc.)

**⏱️ Aguarde 5-10 minutos** (depende da internet)

### 3.3. Instale o React (peer dependency):

```powershell
npm install react@18.3.1 react-dom@18.3.1
```

### 3.4. Verifique se tudo está OK:

```powershell
npm run build
```

Se aparecer uma pasta `dist/`, tudo funcionou! ✅

---

## 📱 PASSO 4: CONFIGURAR CAPACITOR

### 4.1. Inicializar Capacitor (se ainda não foi):

```powershell
npm run cap:init
```

**Quando pedir, responda:**
- **App name:** Óticas Carol
- **App ID:** com.oticascarol.dashboard  
- **Web directory:** dist

### 4.2. Adicionar plataforma Android:

```powershell
npm run cap:add:android
```

Isso cria a pasta `android/` com o projeto Android Studio.

### 4.3. Sincronizar o código web com o nativo:

```powershell
npm run cap:sync
```

Esse comando:
- Faz o build da web (`npm run build`)
- Copia os arquivos para `android/app/src/main/assets/public/`
- Sincroniza plugins do Capacitor

---

## 🔥 PASSO 5: CONFIGURAR FIREBASE (PUSH NOTIFICATIONS)

### 5.1. Acesse o Firebase Console:

https://console.firebase.google.com/

### 5.2. Crie/Acesse o projeto "Óticas Carol"

### 5.3. Adicione o app Android:

1. Clique em **"Adicionar app" > Android**
2. **Package name:** `com.oticascarol.dashboard`
3. **App nickname:** Óticas Carol
4. Baixe o arquivo **`google-services.json`**

### 5.4. Coloque o google-services.json no lugar certo:

```powershell
# Copie o arquivo baixado para:
copy "C:\Users\SEU_USUARIO\Downloads\google-services.json" "android\app\google-services.json"
```

**Caminho final:** `oticas-carol-app/android/app/google-services.json`

### 5.5. Pegue a Server Key do Firebase:

1. No Firebase Console, vá em **"Configurações do Projeto"** (ícone de engrenagem)
2. Aba **"Cloud Messaging"**
3. Em **"Cloud Messaging API (Legacy)"**, copie a **"Chave do servidor"**

### 5.6. Configure a Server Key no Supabase:

1. Acesse seu projeto Supabase: https://supabase.com/dashboard
2. Vá em **"Project Settings" > "Edge Functions" > "Secrets"**
3. Adicione a variável:
   - **Name:** `FCM_SERVER_KEY`
   - **Value:** (cole a chave copiada do Firebase)

---

## 🏗️ PASSO 6: GERAR O APK/AAB (ANDROID)

### 6.1. Abra o Android Studio:

```powershell
npm run cap:open:android
```

Aguarde o Android Studio abrir e indexar o projeto.

### 6.2. No Android Studio:

1. **Aguarde** a sincronização do Gradle terminar (barra inferior)
2. Clique em **"Build" > "Build Bundle(s) / APK(s)"**
3. Escolha:
   - **"Build APK(s)"** → Para testar
   - **"Build Bundle(s)"** → Para publicar na Play Store

### 6.3. Localize o APK gerado:

```
oticas-carol-app/android/app/build/outputs/apk/debug/app-debug.apk
```

Esse é o arquivo que você instala no celular! 📱

---

## 📲 PASSO 7: INSTALAR NO CELULAR

### Opção A: Via USB

1. Ative **"Opções do desenvolvedor"** no Android:
   - Vá em Configurações > Sobre o telefone
   - Toque 7x em "Número da versão"
2. Ative **"Depuração USB"** em Opções do desenvolvedor
3. Conecte o celular no PC via USB
4. No Android Studio, clique no botão ▶️ **"Run"**
5. Selecione seu dispositivo

### Opção B: Via arquivo APK

1. Copie o APK para o celular (Google Drive, WhatsApp, etc.)
2. Abra o arquivo no celular
3. Permita instalar de fontes desconhecidas
4. Instale

---

## ✅ PASSO 8: TESTAR NOTIFICAÇÕES PUSH

### 8.1. Abra o app no celular

### 8.2. Faça login

### 8.3. Permita notificações quando solicitar

### 8.4. Teste criando uma solicitação:

- Crie um pedido como **"Loja"**
- Veja se **"Aprovadores"** recebem notificação
- Aprove o pedido
- Veja se a **"Loja"** recebe notificação

---

## 🍎 BONUS: GERAR APP iOS (Se tiver Mac)

### No Mac:

```bash
npm run cap:add:ios
npm run cap:sync
npm run cap:open:ios
```

### No Xcode:

1. Configure o **Bundle Identifier:** com.oticascarol.dashboard
2. Configure o **Team** (Apple Developer Account)
3. Adicione o **GoogleService-Info.plist** do Firebase
4. Build: **Product > Build**
5. Run: **Product > Run** (no simulador ou device)

---

## 🐛 TROUBLESHOOTING

### Erro: "Scripts desabilitados no PowerShell"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "npm não reconhecido"
- Reinstale o Node.js: https://nodejs.org/

### Erro no build: "Module not found"
```powershell
rm -r node_modules package-lock.json
npm install
```

### Android Studio não abre o projeto
1. Feche o Android Studio
2. Delete a pasta `android/`
3. Execute novamente:
   ```powershell
   npm run cap:add:android
   npm run cap:sync
   npm run cap:open:android
   ```

### App crasha ao abrir
- Verifique se o `google-services.json` está em `android/app/`
- Verifique se a `FCM_SERVER_KEY` está configurada no Supabase

---

## 📞 SUPORTE

Se tiver qualquer problema, me mande:
- A mensagem de erro completa
- O comando que você executou
- Onde travou no processo

Vou te ajudar a resolver! 🚀

---

## ✨ PRÓXIMOS PASSOS

Depois de gerar o app:

1. ✅ Testar todas as funcionalidades
2. ✅ Fazer ajustes de UI/UX se necessário
3. ✅ Gerar APK de release (assinado)
4. ✅ Publicar na Google Play Store
5. ✅ Distribuir para os usuários

---

**Criado para:** Óticas Carol Dashboard  
**Data:** Fevereiro 2026  
**Versão:** 1.0
