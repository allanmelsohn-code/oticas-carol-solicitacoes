# Coding Conventions

**Analysis Date:** 2026-04-28

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `Dashboard.tsx`, `Login.tsx`, `ApprovalPanel.tsx`)
- Utility/library files: camelCase (e.g., `api.ts`, `utils.ts`, `pushNotifications.ts`)
- Component subdirectories: kebab-case folders organizing related components (e.g., `admin/`, `layout/`, `reports/`)
- Type definition files: `types.ts` as single type source file

**Functions:**
- React components: PascalCase, export as named exports (e.g., `export function Dashboard()`)
- Utility functions: camelCase (e.g., `formatCurrency()`, `createStore()`, `isNativePlatform()`)
- Event handlers: `handle` prefix followed by action name in camelCase (e.g., `handleSubmit()`, `handleUserDelete()`, `handleAction()`)
- Async functions: same naming convention, often prefixed with `load`, `fetch`, or `save` (e.g., `loadData()`, `fetchPending()`, `saveFCMTokenToBackend()`)

**Variables:**
- Local state: camelCase (e.g., `user`, `currentView`, `statusFilter`, `showSetup`)
- React state setters: `set` prefix followed by PascalCase (e.g., `setUser`, `setCurrentView`, `setPendingCount`)
- Set collections: camelCase with descriptive suffix (e.g., `selected`, `bulkObs`, `observations`)
- Private/internal flags: underscore prefix optional (e.g., `_refreshListenerRegistered`)

**Types & Interfaces:**
- Type names: PascalCase (e.g., `User`, `Request`, `Store`, `AppView`)
- Type aliases: PascalCase with `Type` suffix (e.g., `RequestType`, `RequestStatus`, `UserRole`)
- Interface names: PascalCase with `Props` suffix for component props (e.g., `LoginProps`, `DashboardProps`)
- Record/mapping constants: UPPER_CASE with descriptive names (e.g., `REQUEST_TYPE_LABELS`, `REQUEST_STATUS_LABELS`)

## Code Style

**Formatting:**
- No explicit formatter configured (no `.prettierrc` or `biome.json`)
- 2-space indentation observed throughout codebase
- Semicolons used consistently at end of statements
- String quotes: single quotes for JS/TS, template literals for interpolation
- Class names on JSX elements use Tailwind classes directly in JSX

**Linting:**
- No `.eslintrc` configuration file detected
- Code follows TypeScript best practices (type annotations on props, return types)
- Imports are organized but not strictly enforced by linter

## Import Organization

**Order:**
1. External dependencies: `react`, `@capacitor/*`, UI libraries (MUI, Radix, lucide-react)
2. Internal utilities: `./lib/api`, `./lib/utils`, `./lib/pushNotifications`
3. Type imports: `import type { ... }` statements grouped together
4. Components: relative imports from adjacent directories

**Path Aliases:**
- No path aliases configured in `tsconfig.json`
- Uses relative imports with `../` and `./` paths
- Example patterns:
  - From component to lib: `import { auth } from '../../lib/api'`
  - From component to types: `import type { User } from '../../types'`
  - Within admin components: `import { UserTable } from './UserTable'`

## Error Handling

**Patterns:**
- Try-catch blocks used in async functions and API calls
- Error type checking: `err instanceof Error ? err.message : 'Fallback message'`
- User-facing errors shown via `alert()` or error state UI
- Console logging for debugging: `console.error()`, `console.log()`
- Silent error handling with comments when non-critical:
  ```typescript
  .catch(console.error)
  .finally(() => setLoading(false));
  // OR
  } catch {
    // silently ignore — not critical
  }
  ```
- Validation before submission: `if (!obs.trim()) { alert('...');return; }`

## Logging

**Framework:** Native `console` object

**Patterns:**
- `console.log()`: informational messages with emoji prefixes for visual scanning
- `console.error()`: error logging
- Emoji prefixes used extensively for log type identification:
  - ✅ (check) = success
  - ❌ (x) = error
  - ℹ️ (info) = information
  - 🔍 (magnifying glass) = checking/validating
  - 📡 (satellite) = API calls
  - 📱 (mobile) = mobile/native platform
  - 🔑 (key) = authentication tokens
  - ⚠️ (warning) = warnings
  - 🔔 (bell) = notifications
  - 📝 (memo) = requests/permissions
  - 🏪 (store) = store operations
- Example: `console.log('✅ Session valid, user:', result.user);`
- Logging disabled in production would need to be implemented separately (no env-based logging gates currently visible)

## Comments

**When to Comment:**
- Inline comments explain non-obvious logic (e.g., "Check if we have a session")
- Section separators use dashed lines for visual organization:
  ```typescript
  // ─── Users ───────────────────────────────────────────────────────────────────
  ```
- Comments clarify API limitations or unexpected behavior:
  ```typescript
  // The current API does not expose a store update endpoint.
  // Show a user-facing message and bail out gracefully.
  ```
- HTML comments in JSX for structural organization: `{/* Header */}`, `{/* Bulk action bar */}`

**JSDoc/TSDoc:**
- Minimal JSDoc usage observed
- Some utility functions have brief JSDoc blocks:
  ```typescript
  /**
   * Helper function to create stores from console
   * Usage in browser console:
   * 
   * import { createStore } from '/src/lib/utils'
   * await createStore('OC001', 'Óticas Carol Shopping')
   */
  ```
- No consistent JSDoc for all exported functions
- Type safety relied upon through TypeScript interfaces rather than JSDoc types

## Function Design

**Size:** 
- Components typically range from 50-400 lines
- Larger components broken into logical sections via inline comments
- Helper handlers extracted as separate named functions within component

**Parameters:**
- React components receive single props object with destructuring: `({ currentUser }: UserAdminPageProps)`
- API functions take explicit parameters: `create(code: string, name: string)`
- Optional parameters handled through optional properties in types: `observation?: string`

**Return Values:**
- Functions return typed values: `Promise<{ success: boolean; token?: string; error?: string }>`
- React components implicitly return JSX
- Event handlers typically void, using callbacks for side effects
- API responses wrapped in objects with status/data structure: `{ user: User }`, `{ requests: Request[] }`

## Module Design

**Exports:**
- Named exports for components: `export function Dashboard() { ... }`
- Named exports for utilities: `export async function createStore() { ... }`
- Default export only for App entry point: `export default function App() { ... }`
- Type exports: `export type UserRole = '...'`
- Interface exports: `export interface User { ... }`

**Barrel Files:**
- No barrel files (`index.ts`) observed
- Each component imported directly from its file
- Example: `import { Dashboard } from './components/Dashboard'` not `from './components'`

## HTML & CSS

**Tailwind CSS:**
- Inline class strings with Tailwind utilities
- No CSS modules or separate CSS files
- Responsive classes used (e.g., `grid grid-cols-2 md:grid-cols-4`)
- Hover and active states with Tailwind transitions: `hover:scale-[1.02]`, `active:scale-[0.98]`
- Custom CSS variables for dynamic styling: `style={{ background: card.bg, borderColor: card.borderColor }}`
- Custom Tailwind classes defined in CSS files (referenced as `icon-btn-compact`)

---

*Convention analysis: 2026-04-28*
