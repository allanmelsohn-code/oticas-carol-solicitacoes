# 📝 TEMPLATES DE ARQUIVOS ESSENCIAIS

Estes arquivos podem não estar visíveis no Figma Make, mas são necessários localmente.

---

## 📄 1. index.html (RAIZ DO PROJETO)

**Local:** `oticas-carol-app/index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="Sistema de Gestão Óticas Carol" />
    <meta name="theme-color" content="#1e40af" />
    
    <!-- PWA / Mobile -->
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Óticas Carol" />
    
    <title>Óticas Carol - Dashboard</title>
    
    <!-- Favicon (opcional) -->
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 📄 2. src/main.tsx

**Local:** `oticas-carol-app/src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Inicializar Capacitor (app nativo)
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  console.log('Running on native platform:', Capacitor.getPlatform());
} else {
  console.log('Running on web');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 📄 3. .gitignore (RAIZ - OPCIONAL)

**Local:** `oticas-carol-app/.gitignore`

```gitignore
# Dependencies
node_modules/
package-lock.json
pnpm-lock.yaml
yarn.lock

# Build outputs
dist/
build/

# Capacitor
android/
ios/
.capacitor/

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
Thumbs.db
```

---

## 📄 4. tsconfig.json (RAIZ - OPCIONAL)

**Local:** `oticas-carol-app/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 📄 5. tsconfig.node.json (RAIZ - OPCIONAL)

**Local:** `oticas-carol-app/tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 📄 6. .env.example (RAIZ - OPCIONAL)

**Local:** `oticas-carol-app/.env.example`

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Firebase (opcional, se quiser usar no web também)
VITE_FIREBASE_API_KEY=your_firebase_key_here
```

**⚠️ NÃO COMPARTILHE O .env COM AS CHAVES REAIS!**

---

## 📄 7. README.md (RAIZ - OPCIONAL)

**Local:** `oticas-carol-app/README.md`

```markdown
# 🏪 Óticas Carol - Dashboard

Sistema de gestão operacional e financeira para franquias Óticas Carol.

## 🚀 Tecnologias

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (Edge Functions + PostgreSQL)
- **Mobile:** Capacitor (Android/iOS)
- **Notificações:** Firebase Cloud Messaging

## 📱 Features

- ✅ Solicitação de serviços (montagem/motoboy)
- ✅ Aprovação centralizada
- ✅ Extrato mensal por loja
- ✅ Exportação PDF/Excel
- ✅ Notificações push nativas
- ✅ 3 perfis de usuário (Loja, Aprovador, Visualização)

## 🛠️ Setup Local

### Pré-requisitos

- Node.js 18+
- Android Studio (para Android)
- Xcode (para iOS, apenas Mac)

### Instalação

\`\`\`bash
# 1. Instalar dependências
npm install

# 2. Build
npm run build

# 3. Adicionar plataformas
npm run cap:add:android  # Android
npm run cap:add:ios      # iOS (Mac only)

# 4. Sincronizar
npm run cap:sync

# 5. Abrir IDEs
npm run cap:open:android  # Android Studio
npm run cap:open:ios      # Xcode
\`\`\`

### Configuração Firebase

1. Baixe \`google-services.json\` do Firebase Console
2. Coloque em \`android/app/google-services.json\`
3. Configure \`FCM_SERVER_KEY\` no Supabase Edge Functions

## 📦 Build

### Android

\`\`\`bash
npm run build
npm run cap:sync
npm run cap:open:android
# No Android Studio: Build > Build Bundle(s) / APK(s)
\`\`\`

### iOS

\`\`\`bash
npm run build
npm run cap:sync
npm run cap:open:ios
# No Xcode: Product > Archive
\`\`\`

## 📝 Scripts Disponíveis

- \`npm run dev\` - Servidor de desenvolvimento
- \`npm run build\` - Build de produção
- \`npm run cap:sync\` - Sincronizar web com nativo
- \`npm run cap:open:android\` - Abrir Android Studio
- \`npm run cap:open:ios\` - Abrir Xcode

## 🔒 Segurança

- Não commite arquivos \`.env\`
- Não commite \`google-services.json\`
- Mantenha as chaves do Supabase em variáveis de ambiente

## 📄 Licença

Proprietário - Óticas Carol © 2026
\`\`\`

---

## ✅ VERIFICAÇÃO

Depois de criar estes arquivos, você deve ter:

```
oticas-carol-app/
├── index.html ✅
├── package.json ✅
├── vite.config.ts ✅
├── capacitor.config.ts ✅
├── tsconfig.json ✅
├── tsconfig.node.json ✅
├── .gitignore ✅
├── .env.example ✅
├── README.md ✅
└── src/
    └── main.tsx ✅
```

---

## 🚀 PRÓXIMO PASSO

Execute:

```powershell
npm install
npm run build
```

Se aparecer uma pasta \`dist/\`, está tudo certo! ✅
