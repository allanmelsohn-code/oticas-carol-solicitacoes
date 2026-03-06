# 🚀 PRÓXIMOS PASSOS - Gerar App Nativo

## ✅ O QUE JÁ FOI FEITO

1. ✅ Projeto baixado do Figma Make
2. ✅ Dependências instaladas (`npm install`)
3. ✅ Imports do Figma corrigidos (removido `figma:asset`)
4. ✅ Logo substituído por emoji 👓
5. ✅ Capacitor.config.ts antigo deletado

---

## 📋 EXECUTE ESTES COMANDOS AGORA

Abra o PowerShell na pasta do projeto e execute:

```powershell
# 1. Build da aplicação
npm run build

# 2. Inicializar Capacitor
npm run cap:init
# Quando pedir, digite:
# ✔ App name: Óticas Carol
# ✔ App ID: com.oticascarol.dashboard
# ✔ Web directory: dist

# 3. Adicionar plataforma Android
npm run cap:add:android

# 4. Sincronizar código
npm run cap:sync

# 5. Abrir no Android Studio
npm run cap:open:android
```

---

## 🎯 DETALHES DE CADA PASSO

### 1️⃣ **`npm run build`**
- Compila o React → arquivos estáticos
- Cria pasta `dist/`
- Leva ~30 segundos

**Sucesso:**
```
✓ built in 2.3s
dist/index.html created
```

---

### 2️⃣ **`npm run cap:init`**
- Cria `capacitor.config.ts`
- Configura nome e ID do app

**Digite exatamente:**
```
App name: Óticas Carol
App ID: com.oticascarol.dashboard
Web directory: dist
```

---

### 3️⃣ **`npm run cap:add:android`**
- Cria pasta `android/`
- Instala Android Studio project
- Leva ~60 segundos

**Sucesso:**
```
✔ Adding native android project in: android/
✔ Creating Android project
```

---

### 4️⃣ **`npm run cap:sync`**
- Copia arquivos web → Android
- Sincroniza plugins (Firebase, Push)

**Sucesso:**
```
✔ Copying web assets
✔ Updating Android plugins
✔ Syncing Capacitor configuration
```

---

### 5️⃣ **`npm run cap:open:android`**
- Abre Android Studio automaticamente
- Você verá o projeto pronto!

---

## 🔥 FIREBASE - PRÓXIMO PASSO

Depois que o Android Studio abrir, você precisa configurar o Firebase:

### 📍 **Criar projeto no Firebase Console**

1. Acesse: https://console.firebase.google.com
2. Clique **"Adicionar projeto"**
3. Nome: `Óticas Carol`
4. Habilite Google Analytics (opcional)
5. Clique **"Criar projeto"**

---

### 📱 **Adicionar app Android**

1. No Firebase Console, clique no ícone **Android** ⚙️
2. Preencha:
   - **Package name:** `com.oticascarol.dashboard`
   - **App nickname:** Óticas Carol
3. Clique **"Registrar app"**
4. **Baixe o arquivo `google-services.json`**
5. Copie para: `android/app/google-services.json`

---

### 🔑 **Obter Server Key do Firebase**

1. No Firebase Console → **⚙️ Configurações do projeto**
2. Aba **"Cloud Messaging"**
3. Copie a **"Chave do servidor (legacy)"**
4. Você vai precisar dela para enviar notificações!

---

## 📦 ESTRUTURA DO PROJETO

```
C:\Users\allan\oticas-carol-app\
├── android/               ← Criado pelo Capacitor
│   ├── app/
│   │   ├── google-services.json  ← Cole aqui!
│   │   └── ...
│   └── ...
├── dist/                 ← Build do React
├── src/                  ← Código fonte
├── capacitor.config.ts   ← Criado pelo cap:init
└── package.json
```

---

## ⚠️ PROBLEMAS COMUNS

### ❌ **"vite not found"**
```powershell
npm install -D vite
```

### ❌ **"Could not find TypeScript"**
```powershell
npm install -D typescript
```

### ❌ **Android Studio não abre**
- Certifique-se que o Android Studio está instalado
- Baixe em: https://developer.android.com/studio

---

## 🎉 QUANDO TUDO FUNCIONAR

Você verá:
1. ✅ Android Studio aberto
2. ✅ Projeto `Óticas Carol` carregado
3. ✅ Emulador disponível
4. ✅ Botão ▶️ **Run** verde

**Clique em Run e veja o app rodando! 🚀**

---

## 🆘 PRECISA DE AJUDA?

Se der erro em algum passo, **copie e cole a mensagem de erro completa** e eu te ajudo!

---

**AGORA EXECUTE:**
```powershell
npm run build
```

E me avisa o resultado! 💪
