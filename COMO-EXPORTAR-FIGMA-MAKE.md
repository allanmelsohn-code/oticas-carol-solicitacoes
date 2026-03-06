# 📥 COMO EXPORTAR ARQUIVOS DO FIGMA MAKE

## 🎯 OBJETIVO

Baixar todos os arquivos do projeto Óticas Carol do Figma Make para o seu PC.

---

## 🔍 MÉTODOS DISPONÍVEIS

### MÉTODO 1: Botão de Export/Download (MAIS FÁCIL)

#### Procure por um destes botões no Figma Make:

- 🔽 **"Download"**
- 📦 **"Export"**
- 💾 **"Download Source Code"**
- 📁 **"Export Project"**
- ⬇️ **Ícone de download**

#### Onde procurar:

1. **Menu superior direito** (ícone de ⋮ ou ⋯)
2. **Barra de ferramentas** superior
3. **Configurações** do projeto (ícone de engrenagem ⚙️)
4. **Menu File** ou equivalente

#### Passos:

1. Clique no botão de Download/Export
2. Escolha **"Download as ZIP"** ou similar
3. Aguarde o download
4. Extraia o arquivo ZIP em `C:\Users\SEU_USUARIO\Documents\oticas-carol-app`
5. Pronto! Pule para a seção "Verificar Arquivos" abaixo

---

### MÉTODO 2: Copiar Manualmente (SE NÃO HOUVER BOTÃO)

Se não encontrar botão de export, você precisa copiar arquivo por arquivo.

#### 2.1. Estrutura de Pastas

Primeiro, crie a estrutura no seu PC:

```powershell
# No PowerShell
cd $HOME\Documents\oticas-carol-app

# Criar pastas
mkdir src
mkdir src\app
mkdir src\app\components
mkdir src\app\components\figma
mkdir src\app\components\ui
mkdir src\lib
mkdir src\styles
mkdir src\utils
mkdir supabase
mkdir supabase\functions
mkdir supabase\functions\server
mkdir utils
mkdir utils\supabase
```

#### 2.2. Copiar Arquivos Raiz

No Figma Make, abra cada arquivo e copie o conteúdo:

**Arquivos da raiz:**
1. `package.json` → Copie para `C:\Users\...\oticas-carol-app\package.json`
2. `vite.config.ts` → Copie para `C:\Users\...\oticas-carol-app\vite.config.ts`
3. `capacitor.config.ts` → Copie para `C:\Users\...\oticas-carol-app\capacitor.config.ts`
4. `postcss.config.mjs` → Copie para `C:\Users\...\oticas-carol-app\postcss.config.mjs`

#### 2.3. Copiar src/app/

**No Figma Make:** Navegue até `src/app/`

Copie cada arquivo para a pasta correspondente no seu PC:

```
src/app/App.tsx → C:\Users\...\oticas-carol-app\src\app\App.tsx
```

#### 2.4. Copiar src/app/components/

Copie TODOS os arquivos da pasta `components`:

- ApprovalPanel.tsx
- Dashboard.tsx
- Help.tsx
- Login.tsx
- MonthlyReport.tsx
- Navigation.tsx
- NewRequest.tsx
- NotificationSettings.tsx
- RequestDetail.tsx
- RequestsList.tsx
- Setup.tsx
- UserAdmin.tsx

#### 2.5. Copiar src/app/components/ui/

Copie TODOS os ~50 arquivos da pasta `ui/`:

- accordion.tsx
- alert-dialog.tsx
- button.tsx
- card.tsx
- ... (todos os outros)

#### 2.6. Copiar src/lib/

- api.ts
- notifications.ts
- pushNotifications.ts
- seed.ts
- utils.ts

#### 2.7. Copiar src/styles/

- fonts.css
- index.css
- tailwind.css
- theme.css

#### 2.8. Copiar supabase/functions/server/

- index.tsx
- fcm.ts
- kv_store.tsx
- types.ts
- types.tsx

#### 2.9. Copiar utils/supabase/

- info.tsx

#### 2.10. Copiar src/ (raiz)

- types.ts

#### 2.11. Copiar src/utils/

- currency.ts

---

### MÉTODO 3: Via Console do Navegador (AVANÇADO)

Se você conhece JavaScript, pode usar o console do navegador para baixar todos os arquivos de uma vez.

#### Abra o Console (F12):

```javascript
// Este script baixa todos os arquivos visíveis
// ATENÇÃO: Pode não funcionar dependendo da arquitetura do Figma Make

// Função para baixar arquivo
function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Exemplo: Baixar um arquivo específico
// downloadFile('App.tsx', 'conteúdo do arquivo aqui');
```

**⚠️ Nota:** Este método é avançado e pode não funcionar em todas as versões do Figma Make.

---

## ✅ VERIFICAR ARQUIVOS BAIXADOS

Depois de baixar/copiar, verifique se tem esta estrutura:

```
oticas-carol-app/
├── package.json ✅
├── vite.config.ts ✅
├── capacitor.config.ts ✅
├── postcss.config.mjs ✅
├── src/
│   ├── types.ts ✅
│   ├── app/
│   │   ├── App.tsx ✅
│   │   └── components/ ✅
│   │       ├── (12 arquivos .tsx) ✅
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx ✅
│   │       └── ui/
│   │           └── (~50 arquivos .tsx/.ts) ✅
│   ├── lib/
│   │   ├── api.ts ✅
│   │   ├── notifications.ts ✅
│   │   ├── pushNotifications.ts ✅
│   │   ├── seed.ts ✅
│   │   └── utils.ts ✅
│   ├── styles/
│   │   ├── fonts.css ✅
│   │   ├── index.css ✅
│   │   ├── tailwind.css ✅
│   │   └── theme.css ✅
│   └── utils/
│       └── currency.ts ✅
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx ✅
│           ├── fcm.ts ✅
│           ├── kv_store.tsx ✅
│           ├── types.ts ✅
│           └── types.tsx ✅
└── utils/
    └── supabase/
        └── info.tsx ✅
```

### Contagem rápida:

- ✅ **~90 arquivos** no total
- ✅ Pasta `src/app/components/ui/` deve ter ~50 arquivos
- ✅ Pasta `supabase/functions/server/` deve ter 5 arquivos

---

## 🔧 FERRAMENTAS QUE PODEM AJUDAR

### VS Code (Recomendado)

1. Instale: https://code.visualstudio.com/
2. Abra a pasta do projeto: `File > Open Folder > oticas-carol-app`
3. Use o explorador de arquivos para criar/editar arquivos
4. Copie/cole o conteúdo do Figma Make diretamente

### Notepad++ (Alternativa)

1. Instale: https://notepad-plus-plus.org/
2. Use para criar/editar os arquivos `.tsx`, `.ts`, `.css`

---

## 📋 CHECKLIST VISUAL

Use o arquivo **`LISTA-ARQUIVOS.md`** como checklist:

1. Abra `LISTA-ARQUIVOS.md`
2. Marque ☑️ cada arquivo conforme copia
3. Verifique se marcou todos os ~90 arquivos

---

## 🐛 PROBLEMAS COMUNS

### "Não consigo ver os arquivos no Figma Make"

**Solução:**
1. Verifique se está na aba **"Code"** ou **"Files"**
2. Procure por um ícone de pasta 📁 ou árvore de arquivos
3. Pode estar em um menu lateral ou superior

### "Copiando mas não mantém a formatação"

**Solução:**
1. Use VS Code para colar o código
2. VS Code detecta automaticamente a sintaxe
3. Salve com a extensão correta (.tsx, .ts, .css)

### "Muitos arquivos para copiar manualmente"

**Solução:**
1. Priorize os arquivos essenciais primeiro:
   - package.json
   - vite.config.ts
   - capacitor.config.ts
   - src/app/App.tsx
   - src/main.tsx (crie usando o template)
2. Depois copie os outros

---

## 🎯 PRÓXIMO PASSO

Depois de baixar/copiar todos os arquivos:

1. ✅ Verifique se tem todos os arquivos (use `LISTA-ARQUIVOS.md`)
2. ✅ Crie os arquivos faltantes (use `TEMPLATES-ESSENCIAIS.md`)
3. ✅ Execute o setup (use `INICIO-RAPIDO.md`)

---

## 💡 DICA

Se o Figma Make tiver opção de **exportar para GitHub**, você pode:

1. Exportar para um repositório GitHub
2. Clonar o repositório no seu PC:
   ```powershell
   git clone URL_DO_REPOSITORIO
   cd nome-do-repositorio
   ```

Isso é mais rápido que copiar manualmente!

---

## 🆘 AINDA COM DÚVIDAS?

Me envie:
1. Screenshot da interface do Figma Make
2. Onde você está procurando o botão de export
3. Se consegue ver a árvore de arquivos

Vou te ajudar a encontrar a melhor forma de exportar! 🚀

---

**Próximo arquivo:** `INICIO-RAPIDO.md` (depois de ter os arquivos no PC)
