# PWA — Óticas Carol

**Data:** 2026-05-03  
**Status:** Aprovado

## Objetivo

Permitir que usuários instalem o app Óticas Carol na tela inicial do celular (Android e iPhone), abrindo-o como aplicativo nativo sem barra de endereço do browser.

## Restrições

- O app **não funciona offline** — requer conexão com internet (Supabase). Não há necessidade de cache de conteúdo.
- O app já está hospedado no Vercel (HTTPS), requisito obrigatório para PWA.

## Arquitetura

Usa `vite-plugin-pwa` para gerar automaticamente:
- Web App Manifest (`manifest.webmanifest`)
- Service Worker mínimo (estratégia `NetworkOnly`)
- Meta tags de iOS (`apple-mobile-web-app-capable`, `apple-touch-icon`)

Nenhuma mudança no código React.

## Ícones

Origem: `Gemini_Generated_Image_i4cgy5i4cgy5i4cg.png` (ícone azul com checkmark).

Tamanhos gerados e colocados em `public/`:
| Arquivo | Tamanho | Uso |
|---|---|---|
| `icon-192x192.png` | 192×192 | Ícone padrão Android |
| `icon-512x512.png` | 512×512 | Ícone grande / splash |
| `apple-touch-icon.png` | 180×180 | iPhone / iPad (Safari) |

## Web App Manifest

```json
{
  "name": "Óticas Carol",
  "short_name": "Óticas Carol",
  "description": "Gerenciamento de solicitações da Óticas Carol",
  "theme_color": "#111827",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    { "src": "icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

## Service Worker

Estratégia: `generateSW` com `runtimeCaching: []`.  
Comportamento: sem cache de rotas ou assets em runtime. O SW existe apenas para satisfazer o critério de instalabilidade dos browsers.

## Mudanças nos arquivos

| Arquivo | Mudança |
|---|---|
| `package.json` | Adiciona `vite-plugin-pwa` como devDependency |
| `vite.config.ts` | Registra o plugin com configurações do manifest e SW |
| `public/icon-192x192.png` | Novo — ícone gerado |
| `public/icon-512x512.png` | Novo — ícone gerado |
| `public/apple-touch-icon.png` | Novo — ícone gerado |

## Critérios de sucesso

- No Chrome Android: banner "Adicionar à tela inicial" aparece automaticamente, ou opção disponível no menu
- No Safari iOS: opção "Adicionar à Tela de Início" funciona com ícone correto
- App abre em modo standalone (sem barra de endereço)
- Lighthouse PWA score passa nos critérios de instalabilidade
