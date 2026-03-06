# 🏪 Óticas Carol - Guia Completo para Projeto Local

## 🎯 OBJETIVO FINAL

Transformar o projeto web (Figma Make) em aplicativo nativo Android/iOS com notificações push funcionando perfeitamente.

---

## 📚 GUIAS DISPONÍVEIS (LEIA NA ORDEM)

| # | Arquivo | Quando Usar | Tempo |
|---|---------|-------------|-------|
| 1️⃣ | **COMECE-AQUI.md** | 👈 Leia primeiro! Índice geral | 2 min |
| 2️⃣ | **COMO-EXPORTAR-FIGMA-MAKE.md** | Como baixar os arquivos | 5 min |
| 3️⃣ | **LISTA-ARQUIVOS.md** | Checklist de todos os arquivos | 10 min |
| 4️⃣ | **TEMPLATES-ESSENCIAIS.md** | Arquivos para criar manualmente | 5 min |
| 5️⃣ | **INICIO-RAPIDO.md** | ⭐ Guia passo a passo (10 passos) | 30 min |
| 6️⃣ | **SETUP-LOCAL.md** | Guia completo e detalhado | 1 hora |
| 7️⃣ | **setup-windows.ps1** | Script automático de setup | 5 min |

---

## ⚡ CAMINHO MAIS RÁPIDO

### Para quem quer começar agora:

```powershell
# 1. Leia COMECE-AQUI.md (2 min)
# 2. Baixe os arquivos (COMO-EXPORTAR-FIGMA-MAKE.md)
# 3. Siga INICIO-RAPIDO.md (30 min)
# 4. Execute setup-windows.ps1 (5 min)
# 5. Configure Firebase (10 min)
# 6. Gere o APK (15 min)
```

**Total: ~1 hora** para ter o app rodando no celular! 📱

---

## 📋 RESUMO EXECUTIVO

### O QUE VOCÊ VAI FAZER:

1. ✅ Baixar o projeto do Figma Make para o PC
2. ✅ Instalar dependências (Node.js, Android Studio)
3. ✅ Configurar Capacitor (transforma web em nativo)
4. ✅ Configurar Firebase (notificações push)
5. ✅ Gerar APK (arquivo instalável)
6. ✅ Instalar no celular e testar

### O QUE VOCÊ VAI TER NO FINAL:

- 📱 App nativo Android (arquivo `.apk`)
- 🔔 Notificações push funcionando perfeitamente
- 🚀 Capacidade de fazer updates e gerar novos builds
- 📦 Projeto pronto para publicar na Play Store

---

## 🛠️ PRÉ-REQUISITOS

### Obrigatórios:

- [ ] **Windows 10/11** (você tem ✅)
- [ ] **Node.js 18+** → https://nodejs.org/
- [ ] **Android Studio** → https://developer.android.com/studio
- [ ] **Conta Firebase** (grátis) → https://console.firebase.google.com/
- [ ] **Acesso ao Supabase** (já configurado ✅)

### Opcionais:

- [ ] **VS Code** → https://code.visualstudio.com/
- [ ] **Git** → https://git-scm.com/
- [ ] **Mac** (só para gerar iOS)

---

## 🗺️ ROADMAP COMPLETO

```
FASE 1: PREPARAÇÃO (20 min)
├── ✅ Instalar Node.js
├── ✅ Instalar Android Studio
├── ✅ Habilitar scripts PowerShell
└── ✅ Criar pasta do projeto

FASE 2: DOWNLOAD (15 min)
├── ✅ Baixar arquivos do Figma Make
├── ✅ Criar arquivos faltantes
└── ✅ Verificar estrutura

FASE 3: CONFIGURAÇÃO (20 min)
├── ✅ npm install
├── ✅ npm run build
├── ✅ npm run cap:add:android
└── ✅ Verificar pasta android/

FASE 4: FIREBASE (10 min)
├── ✅ Criar projeto Firebase
├── ✅ Adicionar app Android
├── ✅ Baixar google-services.json
├── ✅ Copiar para android/app/
└── ✅ Configurar FCM_SERVER_KEY no Supabase

FASE 5: BUILD (15 min)
├── ✅ npm run cap:sync
├── ✅ npm run cap:open:android
├── ✅ Aguardar Gradle sync
└── ✅ Build > Build APK

FASE 6: TESTE (10 min)
├── ✅ Copiar APK para celular
├── ✅ Instalar app
├── ✅ Fazer login
├── ✅ Testar notificações
└── ✅ Validar funcionamento
```

**TEMPO TOTAL: ~1h30min**

---

## 🎓 CONCEITOS IMPORTANTES

### O que é Capacitor?

**Capacitor** é uma ferramenta que transforma seu site em app nativo.

- ✅ Seu código React continua funcionando
- ✅ Adiciona recursos nativos (câmera, notificações, GPS)
- ✅ Gera apps Android e iOS

### Como funciona?

```
┌─────────────────┐
│   Seu site      │
│   (React)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Capacitor     │  ← Converte web → nativo
└────────┬────────┘
         │
         ├──────────┐
         │          │
         ▼          ▼
    ┌────────┐  ┌────────┐
    │ Android│  │  iOS   │
    │  .apk  │  │  .ipa  │
    └────────┘  └────────┘
```

### O que é Firebase Cloud Messaging (FCM)?

**FCM** é o serviço do Google para enviar notificações push.

- ✅ Funciona mesmo com app fechado
- ✅ Grátis e confiável
- ✅ Suporta Android e iOS

---

## 📁 ESTRUTURA DO PROJETO

```
oticas-carol-app/
│
├── 📦 DEPENDÊNCIAS
│   ├── package.json (lista de bibliotecas)
│   └── node_modules/ (criado após npm install)
│
├── ⚙️ CONFIGURAÇÃO
│   ├── vite.config.ts (build da web)
│   ├── capacitor.config.ts (config do app nativo)
│   └── postcss.config.mjs (CSS)
│
├── 🌐 CÓDIGO WEB
│   ├── index.html (página principal)
│   └── src/
│       ├── main.tsx (entry point)
│       ├── app/App.tsx (componente principal)
│       ├── app/components/ (componentes React)
│       ├── lib/ (lógica de negócio)
│       ├── styles/ (CSS/Tailwind)
│       └── types.ts (TypeScript types)
│
├── 🏗️ BUILD
│   └── dist/ (criado após npm run build)
│       └── [arquivos HTML/JS/CSS compilados]
│
├── 📱 APPS NATIVOS
│   ├── android/ (criado após cap:add:android)
│   │   ├── app/
│   │   │   ├── src/main/assets/public/ ← código web vai aqui
│   │   │   └── google-services.json ← Firebase config
│   │   └── build/outputs/apk/ ← APK gerado aqui
│   │
│   └── ios/ (criado após cap:add:ios, só no Mac)
│
└── 🔧 BACKEND
    ├── supabase/functions/server/ (Edge Functions)
    │   ├── index.tsx (servidor Hono)
    │   ├── fcm.ts (envio de notificações)
    │   └── kv_store.tsx (banco de dados)
    └── utils/supabase/info.tsx (config Supabase)
```

---

## 🔄 FLUXO DE DESENVOLVIMENTO

### Ciclo de atualização:

```bash
# 1. Fazer mudanças no código (src/)
# 2. Fazer build
npm run build

# 3. Sincronizar com nativo
npm run cap:sync

# 4. Testar
npm run cap:open:android
# No Android Studio: Run (▶️)
```

### Comandos importantes:

| Comando | O que faz | Quando usar |
|---------|-----------|-------------|
| `npm install` | Instala dependências | Uma vez no início |
| `npm run build` | Compila React → HTML/JS | Sempre que mudar código |
| `npm run cap:sync` | Copia build para android/ios | Depois de build |
| `npm run cap:open:android` | Abre Android Studio | Para testar/gerar APK |
| `npm run dev` | Servidor local (web) | Para desenvolver |

---

## 🧪 COMO TESTAR

### Teste Local (Web):

```bash
npm run dev
# Abra http://localhost:5173
```

### Teste no Celular (App):

1. **Via Android Studio (USB):**
   - Conecte celular via USB
   - Ative "Depuração USB"
   - No Android Studio: ▶️ Run
   - Selecione o dispositivo

2. **Via APK:**
   - Build > Build APK
   - Copie `.apk` para o celular
   - Instale manualmente

---

## 🐛 TROUBLESHOOTING RÁPIDO

| Problema | Solução |
|----------|---------|
| "npm não reconhecido" | Reinstale Node.js |
| "Scripts desabilitados" | `Set-ExecutionPolicy RemoteSigned` |
| "Module not found" | `npm install` |
| "Build falhou" | Verifique se copiou todos os arquivos |
| "App crasha" | Verifique `google-services.json` |
| "Gradle sync failed" | File > Invalidate Caches (Android Studio) |
| "APK não instala" | Ative "Fontes desconhecidas" |
| "Notificações não chegam" | Verifique `FCM_SERVER_KEY` no Supabase |

Consulte **SETUP-LOCAL.md** para mais detalhes.

---

## 📞 SUPORTE

Se tiver qualquer problema:

1. ✅ Consulte a seção de troubleshooting no **SETUP-LOCAL.md**
2. ✅ Verifique se seguiu todos os passos na ordem
3. ✅ Me envie:
   - Qual passo você está
   - Comando que executou
   - Mensagem de erro completa (screenshot ou texto)

---

## 🎯 PRÓXIMOS PASSOS (APÓS TER O APK)

### Curto prazo:

- [ ] Testar todas as funcionalidades no app
- [ ] Ajustar ícone e splash screen
- [ ] Configurar cores do tema nativo
- [ ] Testar em diferentes dispositivos

### Médio prazo:

- [ ] Gerar APK de release (assinado)
- [ ] Criar conta Google Play Developer ($25 USD)
- [ ] Publicar na Play Store
- [ ] Configurar app iOS (se tiver Mac)

### Longo prazo:

- [ ] Sistema de updates automáticos
- [ ] Analytics (Firebase Analytics)
- [ ] Crash reporting (Firebase Crashlytics)
- [ ] A/B testing

---

## 📖 RECURSOS ADICIONAIS

### Documentação Oficial:

- **Capacitor:** https://capacitorjs.com/docs
- **Firebase:** https://firebase.google.com/docs
- **Android Studio:** https://developer.android.com/studio/intro
- **React:** https://react.dev/
- **Supabase:** https://supabase.com/docs

### Vídeos Úteis:

- "Capacitor Tutorial" (YouTube)
- "How to Build Android Apps" (YouTube)
- "Firebase Cloud Messaging Tutorial" (YouTube)

---

## ✨ DICAS FINAIS

1. 🎯 **Não pule etapas!** Siga na ordem exata
2. 📝 **Leia os erros!** Eles geralmente dizem o que fazer
3. ⏰ **Tenha paciência!** Builds podem levar 10-15 min
4. 💾 **Faça backups!** Copie a pasta antes de grandes mudanças
5. 🧪 **Teste muito!** Teste em diferentes celulares e versões Android

---

## 🏁 COMECE AGORA!

**Passo 1:** Abra **COMECE-AQUI.md** 👈

**Passo 2:** Depois abra **INICIO-RAPIDO.md**

**Passo 3:** Siga os 10 passos

**Passo 4:** Tenha o app rodando no celular! 🎉

---

**Boa sorte!** 🚀

Se precisar de ajuda, estou aqui! 💪

---

**Projeto:** Óticas Carol Dashboard  
**Versão:** 1.0.0  
**Data:** Fevereiro 2026  
**Desenvolvido com:** React + Capacitor + Firebase + Supabase
