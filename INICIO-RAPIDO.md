# ⚡ INÍCIO RÁPIDO - Projeto Local em 10 Passos

## 🎯 OBJETIVO

Criar o projeto Óticas Carol localmente e gerar o app Android.

---

## ✅ PASSO A PASSO

### 1️⃣ INSTALE OS PRÉ-REQUISITOS

- [ ] **Node.js 18+** → https://nodejs.org/
- [ ] **Android Studio** → https://developer.android.com/studio
- [ ] **VS Code** → https://code.visualstudio.com/ (opcional)

---

### 2️⃣ HABILITE SCRIPTS NO POWERSHELL

Abra **PowerShell como Administrador** (Win + X > Windows PowerShell Admin):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Digite **"S"** e pressione Enter.

Feche o PowerShell Admin.

---

### 3️⃣ CRIE A PASTA DO PROJETO

Abra **PowerShell normal** (não precisa ser admin):

```powershell
cd $HOME\Documents
mkdir oticas-carol-app
cd oticas-carol-app
```

---

### 4️⃣ BAIXE OS ARQUIVOS DO FIGMA MAKE

**OPÇÃO A: Se houver botão de Export/Download**

1. No Figma Make, clique em **Export** ou **Download**
2. Baixe o ZIP
3. Extraia TUDO dentro de `C:\Users\SEU_USUARIO\Documents\oticas-carol-app`

**OPÇÃO B: Copiar manualmente**

1. Abra o arquivo **`LISTA-ARQUIVOS.md`** (que acabei de criar)
2. Copie TODOS os arquivos listados do Figma Make para o seu PC
3. Use o VS Code para criar os arquivos localmente

**IMPORTANTE:** Copie especialmente:
- ✅ `package.json`
- ✅ `vite.config.ts`
- ✅ `capacitor.config.ts`
- ✅ `postcss.config.mjs`
- ✅ Pasta `src/` completa
- ✅ Pasta `supabase/` completa
- ✅ Pasta `utils/` completa

---

### 5️⃣ CRIE OS ARQUIVOS QUE FALTAM

Abra o arquivo **`TEMPLATES-ESSENCIAIS.md`** (que acabei de criar) e crie:

1. **`index.html`** (na raiz)
2. **`src/main.tsx`**
3. **`.gitignore`** (opcional)
4. **`tsconfig.json`** (opcional)

---

### 6️⃣ INSTALE AS DEPENDÊNCIAS

No PowerShell, dentro da pasta do projeto:

```powershell
npm install
```

Aguarde 5-10 minutos (dependendo da internet).

Se der erro de peer dependencies, execute:

```powershell
npm install react@18.3.1 react-dom@18.3.1
```

---

### 7️⃣ FAÇA O BUILD

```powershell
npm run build
```

**✅ Se aparecer a pasta `dist/`, tudo está funcionando!**

Se der erro, me mande a mensagem de erro completa.

---

### 8️⃣ CONFIGURE O CAPACITOR

```powershell
# Inicializar (se ainda não foi)
npm run cap:init
```

Quando pedir:
- **App name:** Óticas Carol
- **App ID:** com.oticascarol.dashboard
- **Web directory:** dist

```powershell
# Adicionar Android
npm run cap:add:android
```

Aguarde... isso cria a pasta `android/` com o projeto Android Studio.

```powershell
# Sincronizar
npm run cap:sync
```

---

### 9️⃣ CONFIGURE O FIREBASE

#### 9.1. Acesse o Firebase Console

https://console.firebase.google.com/

#### 9.2. Crie/Acesse o projeto "Óticas Carol"

#### 9.3. Adicione o app Android

1. Clique **"Adicionar app" > Android**
2. **Nome do pacote Android:** `com.oticascarol.dashboard`
3. Baixe o arquivo **`google-services.json`**

#### 9.4. Coloque o arquivo no lugar certo

Copie o `google-services.json` para:

```powershell
copy "$HOME\Downloads\google-services.json" "android\app\google-services.json"
```

Verifique se está em: `oticas-carol-app\android\app\google-services.json`

#### 9.5. Pegue a Server Key

1. Firebase Console > **"Configurações do Projeto"** (engrenagem)
2. Aba **"Cloud Messaging"**
3. Copie a **"Chave do servidor"** (Server Key)

#### 9.6. Configure no Supabase

1. Acesse: https://supabase.com/dashboard
2. **Project Settings > Edge Functions > Secrets**
3. Adicione:
   - **Name:** `FCM_SERVER_KEY`
   - **Value:** (cole a chave)

---

### 🔟 GERE O APK

```powershell
npm run cap:open:android
```

Isso abre o **Android Studio**.

**No Android Studio:**

1. **Aguarde** a sincronização do Gradle terminar (barra inferior)
2. Clique em **"Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"**
3. Aguarde 5-10 minutos
4. Quando terminar, aparece: **"locate"** (clique para ver o APK)

**Localização do APK:**

```
oticas-carol-app\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 📲 INSTALAR NO CELULAR

### Método 1: Via USB

1. Ative **"Opções do desenvolvedor"** no Android:
   - Configurações > Sobre o telefone
   - Toque 7x em "Número da versão"
2. Ative **"Depuração USB"**
3. Conecte o celular no PC
4. No Android Studio, clique em **▶️ Run**
5. Selecione seu dispositivo

### Método 2: Via arquivo APK

1. Envie o APK para o celular (WhatsApp, Drive, etc.)
2. Abra o arquivo no celular
3. Permita instalar de fontes desconhecidas
4. Instale normalmente

---

## 🎉 TESTE O APP

1. Abra o app no celular
2. Faça login
3. Permita notificações quando solicitar
4. Teste criando uma solicitação
5. Veja se as notificações chegam! 🔔

---

## 🐛 PROBLEMAS COMUNS

### "npm não é reconhecido"
➜ Reinstale o Node.js: https://nodejs.org/

### "Scripts desabilitados"
➜ Execute no PowerShell Admin:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Module not found" ao fazer build
➜ Reinstale dependências:
```powershell
rm -r node_modules
npm install
```

### App crasha ao abrir
➜ Verifique se o `google-services.json` está em `android/app/`

### Android Studio não sincroniza
➜ File > Invalidate Caches > Invalidate and Restart

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, consulte:

- **`SETUP-LOCAL.md`** - Guia completo e detalhado
- **`LISTA-ARQUIVOS.md`** - Checklist de todos os arquivos
- **`TEMPLATES-ESSENCIAIS.md`** - Templates dos arquivos necessários
- **`GUIA-APP-NATIVO.md`** - Guia de configuração do Capacitor
- **`COMO-TESTAR-NOTIFICACOES.md`** - Como testar push notifications

---

## 💬 SUPORTE

Se travar em algum passo, me mande:

1. Em qual passo você está
2. O comando que executou
3. A mensagem de erro completa (screenshot ou copiar/colar)

Vou te ajudar! 🚀

---

**Boa sorte!** 🍀
