# 📋 LISTA COMPLETA DE ARQUIVOS PARA COPIAR

## ✅ CHECKLIST: Copie estes arquivos do Figma Make para seu PC

### 📄 ARQUIVOS RAIZ (pasta principal)

- [ ] `package.json`
- [ ] `vite.config.ts`
- [ ] `capacitor.config.ts`
- [ ] `postcss.config.mjs`
- [ ] `index.html` (se existir, senão crie conforme template abaixo)
- [ ] `.gitignore` (opcional)

---

### 📁 src/app/

- [ ] `App.tsx`

### 📁 src/app/components/

- [ ] `ApprovalPanel.tsx`
- [ ] `Dashboard.tsx`
- [ ] `Help.tsx`
- [ ] `Login.tsx`
- [ ] `MonthlyReport.tsx`
- [ ] `Navigation.tsx`
- [ ] `NewRequest.tsx`
- [ ] `NotificationSettings.tsx`
- [ ] `RequestDetail.tsx`
- [ ] `RequestsList.tsx`
- [ ] `Setup.tsx`
- [ ] `UserAdmin.tsx`

### 📁 src/app/components/figma/

- [ ] `ImageWithFallback.tsx`

### 📁 src/app/components/ui/

- [ ] `accordion.tsx`
- [ ] `alert-dialog.tsx`
- [ ] `alert.tsx`
- [ ] `aspect-ratio.tsx`
- [ ] `avatar.tsx`
- [ ] `badge.tsx`
- [ ] `breadcrumb.tsx`
- [ ] `button.tsx`
- [ ] `calendar.tsx`
- [ ] `card.tsx`
- [ ] `carousel.tsx`
- [ ] `chart.tsx`
- [ ] `checkbox.tsx`
- [ ] `collapsible.tsx`
- [ ] `command.tsx`
- [ ] `context-menu.tsx`
- [ ] `dialog.tsx`
- [ ] `drawer.tsx`
- [ ] `dropdown-menu.tsx`
- [ ] `form.tsx`
- [ ] `hover-card.tsx`
- [ ] `input-otp.tsx`
- [ ] `input.tsx`
- [ ] `label.tsx`
- [ ] `menubar.tsx`
- [ ] `navigation-menu.tsx`
- [ ] `pagination.tsx`
- [ ] `popover.tsx`
- [ ] `progress.tsx`
- [ ] `radio-group.tsx`
- [ ] `resizable.tsx`
- [ ] `scroll-area.tsx`
- [ ] `select.tsx`
- [ ] `separator.tsx`
- [ ] `sheet.tsx`
- [ ] `sidebar.tsx`
- [ ] `skeleton.tsx`
- [ ] `slider.tsx`
- [ ] `sonner.tsx`
- [ ] `switch.tsx`
- [ ] `table.tsx`
- [ ] `tabs.tsx`
- [ ] `textarea.tsx`
- [ ] `toggle-group.tsx`
- [ ] `toggle.tsx`
- [ ] `tooltip.tsx`
- [ ] `use-mobile.ts`
- [ ] `utils.ts`

---

### 📁 src/lib/

- [ ] `api.ts`
- [ ] `notifications.ts`
- [ ] `pushNotifications.ts`
- [ ] `seed.ts`
- [ ] `utils.ts`

---

### 📁 src/styles/

- [ ] `fonts.css`
- [ ] `index.css`
- [ ] `tailwind.css`
- [ ] `theme.css`

---

### 📁 src/

- [ ] `types.ts`

### 📁 src/utils/

- [ ] `currency.ts`

---

### 📁 supabase/functions/server/

- [ ] `index.tsx`
- [ ] `fcm.ts`
- [ ] `kv_store.tsx`
- [ ] `types.ts`
- [ ] `types.tsx`

---

### 📁 utils/supabase/

- [ ] `info.tsx`

---

## 📝 TEMPLATE: index.html

Se não existir no Figma Make, crie este arquivo na raiz:

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Óticas Carol - Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 📝 TEMPLATE: src/main.tsx

Se não existir, crie este arquivo:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 📝 TEMPLATE: .gitignore

Opcional, mas recomendado:

```
# Dependencies
node_modules/
package-lock.json
pnpm-lock.yaml
yarn.lock

# Build
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

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
```

---

## 🔄 COMO COPIAR MANUALMENTE

### Método 1: Interface do Figma Make

1. Abra cada arquivo no Figma Make
2. Selecione todo o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)
4. No VS Code local, crie o arquivo
5. Cole (Ctrl+V)
6. Salve (Ctrl+S)

### Método 2: Botão de Export

Se o Figma Make tiver botão de Download/Export:
1. Clique no botão
2. Baixe o ZIP
3. Extraia na pasta do projeto

---

## ✅ VERIFICAÇÃO FINAL

Depois de copiar tudo, sua pasta deve ter esta estrutura:

```
oticas-carol-app/
├── package.json ✅
├── vite.config.ts ✅
├── capacitor.config.ts ✅
├── postcss.config.mjs ✅
├── index.html ✅
├── src/
│   ├── main.tsx ✅
│   ├── types.ts ✅
│   ├── app/
│   │   ├── App.tsx ✅
│   │   └── components/ (12 arquivos) ✅
│   ├── lib/ (5 arquivos) ✅
│   ├── styles/ (4 arquivos) ✅
│   └── utils/
│       └── currency.ts ✅
├── supabase/
│   └── functions/
│       └── server/ (5 arquivos) ✅
└── utils/
    └── supabase/
        └── info.tsx ✅
```

**Total:** ~90 arquivos

---

## 🚀 PRÓXIMO PASSO

Depois de copiar tudo:

```powershell
cd oticas-carol-app
npm install
npm run build
```

Se compilar sem erros, está tudo certo! ✅
