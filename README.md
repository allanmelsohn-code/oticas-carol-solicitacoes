# 🏢 Óticas Carol - Sistema de Gestão de Franquias

Sistema web completo (dashboard administrativo) para controle operacional e financeiro das franquias Óticas Carol, com foco em solicitações de serviços, aprovação centralizada e conciliação mensal por loja.

---

## 📱 **NOVIDADE: APP MOBILE NATIVO!**

O sistema agora está disponível como **aplicativo nativo** para iOS e Android com **notificações push em tempo real** via Firebase Cloud Messaging!

---

## ✨ Funcionalidades

### 👥 **3 Perfis de Usuários:**
- **Loja:** Criar solicitações e visualizar status
- **Aprovadores:** Aprovar/reprovar solicitações (Allan e Chris)
- **Visualização Financeira:** Acesso ao extrato mensal

### 📋 **Módulos Principais:**
- ✅ **Solicitação de Pedidos:** Montagem/Motoboy com valores e observações
- ✅ **Aprovação de Solicitações:** Sistema de aprovação centralizado com notificações
- ✅ **Extrato Mensal por Loja:** Exportação em PDF/Excel
- ✅ **Notificações Push:** Notificações em tempo real no app mobile

### 🎨 **Interface:**
- Design clean, corporativo e profissional
- Dashboard responsivo
- Cores neutras e componentes reutilizáveis
- Pensada para uso diário e rápido

---

## 🚀 Tecnologias

### **Frontend:**
- React 18.3
- TypeScript
- Tailwind CSS v4
- Vite
- Material UI
- Recharts (gráficos)
- jsPDF (exportação PDF)

### **Mobile:**
- Capacitor 8
- Firebase Cloud Messaging (FCM)
- Push Notifications
- iOS & Android

### **Backend:**
- Supabase (Database + Edge Functions)
- Hono (Web Server)
- Firebase Cloud Messaging
- Key-Value Store

---

## 📦 Instalação

### **1. Clonar repositório:**
```bash
git clone <seu-repositorio>
cd oticas-carol-app
```

### **2. Instalar dependências:**
```bash
npm install
```

### **3. Executar em desenvolvimento:**
```bash
npm run dev
```

### **4. Build para produção:**
```bash
npm run build
```

---

## 📱 BUILD PARA MOBILE

### **🤖 Android:**
Veja instruções completas em: **[BUILD-ANDROID.md](./BUILD-ANDROID.md)**

**Resumo:**
```bash
# 1. Build web
npm run build

# 2. Sync Capacitor
npx cap sync android

# 3. Gerar APK
cd android
./gradlew assembleDebug
cd ..
```

**⚠️ IMPORTANTE:** Você precisa do arquivo `google-services.json` do Firebase!  
Veja: **[IMPORTANTE-FIREBASE.txt](./IMPORTANTE-FIREBASE.txt)**

### **🍎 iOS:**
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

Build no Xcode.

**⚠️ IMPORTANTE:** Você precisa do arquivo `GoogleService-Info.plist` do Firebase!

---

## 🔔 Notificações Push

O sistema possui notificações push nativas funcionais:

### **Eventos que geram notificações:**
1. **Nova solicitação criada** → Notifica aprovadores
2. **Solicitação aprovada** → Notifica a loja
3. **Solicitação reprovada** → Notifica a loja com motivo

### **Como funciona:**
1. Usuário abre o app e faz login
2. App solicita permissão de notificações
3. Token FCM é registrado no backend
4. Notificações chegam em tempo real!

### **Arquivos importantes:**
- `/src/lib/pushNotifications.ts` - Gerenciamento de push notifications
- `/supabase/functions/server/fcm.ts` - Backend FCM
- `/supabase/functions/server/index.tsx` - Rotas do servidor

---

## 🔐 Autenticação

Sistema de autenticação simples com usuários fixos:

### **Usuários padrão:**
- **Allan:** allan@oticascarol.com.br (Aprovador)
- **Chris:** chris@oticascarol.com.br (Aprovador)
- **Lojas:** Cada loja tem seu próprio usuário

---

## 🗂️ Estrutura do Projeto

```
oticas-carol-app/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Componente principal
│   │   └── components/                # Componentes React
│   ├── lib/
│   │   └── pushNotifications.ts       # Push notifications mobile
│   ├── styles/
│   │   ├── theme.css                  # Variáveis CSS
│   │   └── fonts.css                  # Fontes
│   └── utils/
│       └── supabase/                  # Config Supabase
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx              # Servidor Hono
│           ├── fcm.ts                 # Firebase Cloud Messaging
│           ├── kv_store.tsx           # Key-Value Store
│           └── types.ts               # TypeScript types
├── android/                           # Projeto Android (gerado)
├── ios/                              # Projeto iOS (gerado)
├── capacitor.config.ts               # Config Capacitor
├── BUILD-ANDROID.md                  # Guia build Android
├── IMPORTANTE-FIREBASE.txt           # Config Firebase
└── package.json
```

---

## 🔧 Variáveis de Ambiente (Supabase)

Configuradas automaticamente no Supabase:

- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_ANON_KEY` - Chave pública
- `SUPABASE_SERVICE_ROLE_KEY` - Chave privada (backend only)
- `FIREBASE_SERVER_KEY` - Server key do Firebase (para push notifications)

---

## 📊 Banco de Dados

O sistema usa uma **tabela Key-Value** (`kv_store_b2c42f95`) para armazenar:
- Usuários
- Lojas
- Solicitações (requests)
- Tokens FCM (notificações)
- Sessões

---

## 🎯 Fluxo de Uso

### **Como Loja:**
1. Login → Dashboard
2. Criar nova solicitação (Montagem/Motoboy)
3. Aguardar aprovação
4. Receber notificação de aprovação/reprovação

### **Como Aprovador:**
1. Login → Dashboard
2. Ver solicitações pendentes
3. Receber notificação de novas solicitações
4. Aprovar ou reprovar com observações

### **Visualização Financeira:**
1. Login → Extrato Mensal
2. Filtrar por loja e período
3. Exportar PDF/Excel

---

## 📱 Distribuição do App

### **Desenvolvimento (Debug):**
- APK gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`
- Pode ser instalado direto no celular
- **Não** é aceito na Google Play Store

### **Produção (Release):**
```bash
cd android
./gradlew assembleRelease
cd ..
```

- APK gerado em: `android/app/build/outputs/apk/release/`
- Precisa ser **assinado** com keystore
- Pode ser publicado na Google Play Store

---

## 🐛 Troubleshooting

### **Notificações não chegam:**
1. Verificar se `google-services.json` está em `android/app/`
2. Verificar se `FIREBASE_SERVER_KEY` está configurado no Supabase
3. Verificar permissão de notificações no celular
4. Verificar logs no Supabase: Dashboard > Edge Functions > server > Logs

### **Erro ao gerar APK:**
1. Verificar Java JDK 17+ instalado: `java -version`
2. Limpar build: `cd android && ./gradlew clean && cd ..`
3. Sync novamente: `npx cap sync android`

### **App não abre:**
1. Verificar logs: `adb logcat`
2. Verificar build: `npm run build`
3. Sync: `npx cap sync android`

---

## 📚 Documentação Adicional

- **[BUILD-ANDROID.md](./BUILD-ANDROID.md)** - Guia completo de build Android
- **[IMPORTANTE-FIREBASE.txt](./IMPORTANTE-FIREBASE.txt)** - Configuração Firebase
- **[Capacitor Docs](https://capacitorjs.com/)** - Documentação oficial Capacitor
- **[Firebase FCM Docs](https://firebase.google.com/docs/cloud-messaging)** - Firebase Cloud Messaging

---

## 👨‍💻 Desenvolvimento

### **Adicionar nova funcionalidade:**
1. Criar componente em `/src/app/components/`
2. Importar e usar em `App.tsx`
3. Se precisar backend, adicionar rota em `/supabase/functions/server/index.tsx`

### **Testar no mobile:**
```bash
npm run build
npx cap sync android
npx cap run android
```

---

## 📄 Licença

Proprietário - Óticas Carol © 2026

---

## 🆘 Suporte

Para dúvidas ou problemas:
- Verificar documentação em `BUILD-ANDROID.md`
- Verificar logs do Supabase
- Verificar console do navegador/adb logcat

---

**Desenvolvido com ❤️ para Óticas Carol**

**Versão:** 1.0.0  
**Data:** Fevereiro 2026
