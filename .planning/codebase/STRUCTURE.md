# Codebase Structure

**Analysis Date:** 2026-04-28

## Directory Layout

```
oticas-carol-solicitacoes/
├── src/                                # Frontend source code (Vite + React)
│   ├── main.tsx                        # Application entry point
│   ├── types.ts                        # Shared TypeScript interfaces (User, Request, Store, etc.)
│   ├── app/
│   │   ├── App.tsx                     # Root component — auth state, navigation, view routing
│   │   ├── components/
│   │   │   ├── admin/                  # Admin management components
│   │   │   │   ├── UserAdminPage.tsx
│   │   │   │   ├── UserForm.tsx
│   │   │   │   ├── UserTable.tsx
│   │   │   │   ├── StoreForm.tsx
│   │   │   │   └── StoreTable.tsx
│   │   │   ├── figma/                  # Figma-related utilities
│   │   │   │   └── ImageWithFallback.tsx
│   │   │   ├── layout/                 # App shell and navigation
│   │   │   │   ├── AppShell.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   └── navItems.ts        # Navigation configuration (role-based)
│   │   │   ├── reports/                # Report views
│   │   │   │   ├── MonthlyReportPage.tsx
│   │   │   │   ├── ReportFilters.tsx
│   │   │   │   ├── ReportTable.tsx
│   │   │   │   └── ReportTotals.tsx
│   │   │   ├── requests/               # Request list components
│   │   │   │   ├── RequestsList.tsx    # Wrapper component
│   │   │   │   ├── RequestRow.tsx      # Individual request row
│   │   │   │   └── RequestDropdown.tsx
│   │   │   ├── ui/                     # Radix UI + shadcn primitives (70+ files)
│   │   │   │   ├── button.tsx, input.tsx, dialog.tsx, table.tsx, etc.
│   │   │   │   └── sonner.tsx         # Toast notifications
│   │   │   ├── ApprovalPanel.tsx       # Approval/rejection workflow (main approver view)
│   │   │   ├── Dashboard.tsx           # Summary stats and recent requests
│   │   │   ├── NewRequest.tsx          # Create request form
│   │   │   ├── RequestsList.tsx        # List all requests with filters
│   │   │   ├── RequestDetail.tsx       # Single request view
│   │   │   ├── MonthlyReport.tsx       # Report generation (wrapper)
│   │   │   ├── UserAdmin.tsx           # User/store management entry point
│   │   │   ├── NotificationSettings.tsx # Mobile notification preferences
│   │   │   ├── Login.tsx               # Authentication page
│   │   │   ├── Setup.tsx               # Initial setup wizard
│   │   │   ├── Navigation.tsx          # Navigation state management
│   │   │   ├── Help.tsx                # Help/documentation page
│   │   │   └── ErrorBoundary.tsx       # React error boundary
│   ├── lib/                            # API client and utilities
│   │   ├── api.ts                      # REST client: auth, requests, approvals, reports, users, stores
│   │   ├── pushNotifications.ts        # FCM initialization and listeners
│   │   ├── notifications.ts            # Email/notification utilities
│   │   ├── utils.ts                    # Helper functions (currency, date formatting)
│   │   └── seed.ts                     # Database seeding functions
│   ├── utils/                          # Global utilities
│   │   └── currency.ts                 # Currency formatting
│   └── styles/                         # CSS files
│       ├── index.css                   # Main style entry
│       ├── tailwind.css                # Tailwind directives
│       ├── fonts.css                   # Custom fonts
│       └── theme.css                   # Theme variables and overrides
│
├── supabase/                           # Backend (Supabase Edge Functions)
│   └── functions/
│       └── server/
│           ├── index.tsx               # Hono API server (all REST endpoints)
│           ├── types.ts                # Backend TypeScript interfaces
│           ├── types.tsx               # Additional type definitions
│           ├── kv_store.tsx            # KV store abstraction (Supabase)
│           ├── email.ts                # Sendgrid email sending
│           └── fcm.ts                  # Firebase Cloud Messaging integration
│
├── utils/
│   └── supabase/                       # Supabase configuration
│       └── info.ts                     # Project ID and public key
│
├── public/                             # Static assets
│
├── index.html                          # HTML template for Vite
├── vite.config.ts                      # Vite configuration (React plugin, Tailwind, path aliases)
├── capacitor.config.ts                 # Capacitor mobile app configuration
├── package.json                        # Dependencies and scripts
├── postcss.config.mjs                  # PostCSS configuration (Tailwind)
│
└── .planning/
    └── codebase/                       # Architecture documentation (this directory)
        ├── ARCHITECTURE.md
        ├── STRUCTURE.md
        ├── CONVENTIONS.md
        ├── TESTING.md
        ├── STACK.md
        ├── INTEGRATIONS.md
        └── CONCERNS.md
```

## Directory Purposes

**src/**
- Purpose: Frontend source code
- Contains: React components, API client, utilities, styles
- Key files: `main.tsx`, `App.tsx`, `types.ts`

**src/app/components/**
- Purpose: All React components organized by feature
- Contains: Feature-specific components (admin, reports, requests) + UI primitives + layout
- Key files: `App.tsx`, `Layout/AppShell.tsx`, `Dashboard.tsx`, `ApprovalPanel.tsx`

**src/app/components/ui/**
- Purpose: Reusable Radix UI + shadcn component library
- Contains: 70+ files (button, input, dialog, table, select, etc.)
- Generated from: shadcn CLI; should not be manually edited

**src/lib/**
- Purpose: Core application logic and integration
- Contains: API client with session management, push notifications, utilities
- Key files: `api.ts` (all HTTP calls), `pushNotifications.ts` (FCM integration)

**src/styles/**
- Purpose: Global styles and design system
- Contains: Tailwind configuration, theme variables, custom CSS
- Key files: `index.css` (imports), `theme.css` (design tokens)

**supabase/functions/server/**
- Purpose: Backend API server (Hono framework)
- Contains: REST endpoints, KV store access, email/notification services
- Key files: `index.tsx` (all routes), `types.ts` (data models), `kv_store.tsx` (storage)

**utils/supabase/**
- Purpose: Supabase project configuration
- Contains: Project ID and anonymous key (public credentials)
- Files: `info.ts`

## Key File Locations

**Entry Points:**
- `index.html`: Root HTML template — mounts React to `#root` div
- `src/main.tsx`: Creates React root, renders error boundary and App
- `src/app/App.tsx`: Main application component — orchestrates auth, navigation, views

**Configuration:**
- `vite.config.ts`: Build configuration (React plugin, Tailwind, path alias `@`)
- `capacitor.config.ts`: Mobile app configuration (app ID, name, plugins)
- `postcss.config.mjs`: PostCSS + Tailwind configuration
- `tsconfig.json`: TypeScript compilation settings
- `package.json`: Dependencies and build scripts

**Core Logic:**
- `src/lib/api.ts`: REST client and session management (all backend communication)
- `src/lib/pushNotifications.ts`: FCM token management and listeners
- `src/app/App.tsx`: Global state, auth validation, navigation routing

**API/Backend:**
- `supabase/functions/server/index.tsx`: Hono server with all REST endpoints
- `supabase/functions/server/kv_store.tsx`: KV store wrapper (read, write, prefix search)
- `supabase/functions/server/email.ts`: Email templates and Sendgrid integration
- `supabase/functions/server/fcm.ts`: Firebase Cloud Messaging push notifications

## Naming Conventions

**Files:**
- React components: PascalCase (e.g., `Dashboard.tsx`, `ApprovalPanel.tsx`)
- Non-component files: camelCase (e.g., `api.ts`, `pushNotifications.ts`)
- Utility functions: camelCase (e.g., `currency.ts`)
- Configuration files: kebab-case (e.g., `vite.config.ts`)

**Directories:**
- Feature directories: kebab-case (e.g., `src/app/components/admin/`, `requests/`)
- Grouped components: descriptive plural (e.g., `ui/`, `layout/`, `reports/`)

**Types & Interfaces:**
- PascalCase (e.g., `User`, `Request`, `Store`, `UserRole`, `RequestStatus`)
- Type suffixes for unions (e.g., `RequestType`, `RequestStatus`)

**Constants:**
- SCREAMING_SNAKE_CASE for enum-like maps (e.g., `REQUEST_TYPE_LABELS`, `REQUEST_STATUS_LABELS`)

**Functions:**
- camelCase (e.g., `createStore()`, `formatCurrency()`, `authenticateRequest()`)

**React Hook Naming:**
- Starts with `use` (e.g., `useState`, `useEffect`, `useCallback`)

**Variables:**
- camelCase for instances (e.g., `user`, `requestData`, `sessionId`)
- `_` prefix for unused (e.g., `_error` in catch blocks)

## Where to Add New Code

**New Feature/Page (e.g., Inventory Management):**
- Primary code: Create folder in `src/app/components/` (e.g., `inventory/`)
- Main component: `src/app/components/inventory/InventoryPage.tsx`
- Sub-components: `src/app/components/inventory/InventoryTable.tsx`, `InventoryForm.tsx`
- API integration: Add new facade to `src/lib/api.ts` (e.g., `inventory` object with CRUD methods)
- Backend endpoints: Add routes to `supabase/functions/server/index.tsx`
- Navigation: Add entry to `NAV_ITEMS` array in `src/app/components/layout/navItems.ts`
- Type definitions: Add interfaces to `src/types.ts` (frontend) and `supabase/functions/server/types.ts` (backend)
- View routing: Add case in `App.tsx` component render

**New Component/Module (e.g., InventoryChart):**
- Location: Appropriate subdirectory under `src/app/components/`
- File: `InventoryChart.tsx` (PascalCase, single file)
- Pattern: Accept props, use hooks for state, call API via props or context if needed

**New UI Primitive (e.g., custom button variant):**
- Location: Customize existing `src/app/components/ui/button.tsx`
- DO NOT: Create new file; extend existing shadcn component

**Shared Utilities (e.g., validation helpers):**
- Location: Create in `src/lib/utils.ts` or new file if large (e.g., `src/lib/validation.ts`)
- Pattern: Export pure functions, no dependencies on React or API

**Global Styles:**
- Location: `src/styles/theme.css` for design tokens, `src/styles/index.css` for imports
- Pattern: CSS variables for colors, spacing; Tailwind for component classes

**Backend Endpoints (new API route):**
- Location: Add to `supabase/functions/server/index.tsx`
- Pattern: Create Hono route with authentication check, KV operations
- Example: `app.post("/make-server-b2c42f95/inventory", authenticateRequest...)`
- KV key pattern: `inventory:{id}` (follow existing pattern)
- Type: Define in `supabase/functions/server/types.ts`

**Backend Service (e.g., SMS notifications):**
- Location: Create new file `supabase/functions/server/sms.ts`
- Pattern: Export named functions (e.g., `sendSMS()`)
- Import and call from `index.tsx` endpoints

## Special Directories

**src/app/components/ui/:**
- Purpose: UI component library (Radix UI + shadcn primitives)
- Generated: YES (by shadcn CLI)
- Committed: YES (checked into version control)
- Guidelines: Do not hand-edit; regenerate via `npx shadcn-ui@latest add [component]`

**.planning/codebase/:**
- Purpose: Architecture and design documentation
- Generated: NO (manually written)
- Committed: YES
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md

**public/**
- Purpose: Static assets served directly (favicon, logos)
- Generated: NO
- Committed: YES

**node_modules/:**
- Purpose: npm dependencies
- Generated: YES (by npm install)
- Committed: NO (.gitignore)

**supabase/functions/server/:**
- Purpose: Edge Function code (server-side)
- Deployed: Via Supabase CLI to Deno Edge Runtime
- Runtime: TypeScript/Deno (not Node.js)

## Import Path Aliases

**Configured in vite.config.ts:**
- `@` → `src/` (e.g., `import { User } from '@/types'` resolves to `src/types.ts`)

**Usage:**
- Prefer relative imports for same-level or nearby files (e.g., `./Button.tsx`)
- Use `@` for cross-directory imports (e.g., `@/types`, `@/lib/api`)
- Avoid `../../../` chains; use `@` instead

## Build & Deployment Structure

**Development:**
- Run: `npm run dev` (Vite dev server on http://localhost:5173)
- Hot reload: Changes to `src/` auto-refresh browser

**Production Build:**
- Run: `npm run build`
- Output: `dist/` directory (optimized HTML, JS, CSS bundles)
- Deployment: Upload `dist/` to Vercel, Netlify, or static host

**Mobile Build:**
- Run: `npm run cap:sync` (builds web, syncs to native projects)
- Android: `npm run cap:open:android` (opens Android Studio)
- iOS: `npm run cap:open:ios` (opens Xcode)

**Backend Deployment:**
- Supabase Edge Functions deployed via `supabase functions deploy server`
- Endpoint: `https://{projectId}.supabase.co/functions/v1/make-server-b2c42f95`
