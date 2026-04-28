# Architecture

**Analysis Date:** 2026-04-28

## Pattern Overview

**Overall:** Multi-tier web application with Vite SPA frontend (React) communicating with Supabase Edge Functions backend via REST API

**Key Characteristics:**
- Session-based authentication (custom session tokens in KV store)
- Role-based access control (store, approver, approver_store, viewer)
- Reactive state management with React hooks (no Redux/Zustand)
- Client-side caching with localStorage for session management
- Backend state stored in Supabase KV (key-value store) for users, stores, requests, approvals
- Synchronous email dispatch from Edge Function (not fire-and-forget)
- Push notifications via Firebase Cloud Messaging (FCM) for mobile app

## Layers

**Presentation (View):**
- Purpose: Render UI, handle user interactions, manage local component state
- Location: `src/app/components/**/*.tsx`
- Contains: React functional components using Radix UI primitives and custom UI components
- Depends on: API client (`src/lib/api.ts`), types (`src/types.ts`), utilities (`src/utils/currency.ts`)
- Used by: `src/app/App.tsx` (router component)

**Business Logic & State (Controller):**
- Purpose: Orchestrate data fetching, navigation, session validation, push notification initialization
- Location: `src/app/App.tsx` (main orchestrator)
- Contains: Global app state (user, currentView, statusFilter, highlightId), auth/logout handlers, navigation handlers
- Depends on: API layer, types
- Used by: All components via props (observer pattern via layout shell)

**Data Access (API Client):**
- Purpose: HTTP client for communication with Supabase Edge Functions backend
- Location: `src/lib/api.ts`
- Contains: Named exports (auth, stores, requests, approvals, reports, dashboard, users, setup) as API facades
- Depends on: Supabase credentials (`/utils/supabase/info.ts`), types
- Used by: Components and App.tsx for all backend communication

**Backend Services (Edge Functions):**
- Purpose: Handle business logic, data persistence, authentication, email/push notifications
- Location: `supabase/functions/server/index.tsx` (Hono framework)
- Contains: REST endpoints for auth, users, stores, requests, approvals, reports, stats, setup
- Depends on: Supabase SDK, KV store (`kv_store.tsx`), email service, FCM
- Data storage: Supabase KV with key patterns: `user:{id}`, `password:{id}`, `store:{id}`, `request:{id}`, `approval:{id}`, `session:{id}`

**Supporting Services:**
- **Email**: `supabase/functions/server/email.ts` - Send newRequest, approved, rejected emails via Sendgrid
- **Notifications**: `supabase/functions/server/fcm.ts` - Push notifications to mobile app via Firebase Cloud Messaging
- **KV Store**: `supabase/functions/server/kv_store.tsx` - Wrapper around Supabase KV for CRUD operations
- **Push Notifications (Client)**: `src/lib/pushNotifications.ts` - Initialize, manage FCM tokens, setup listeners for incoming notifications
- **Utilities**: `src/lib/utils.ts` - Currency/date formatting, helper functions for console-based store/user creation

## Data Flow

**User Authentication Flow:**

1. User enters email/password on `Login.tsx`
2. `auth.signin()` (api.ts) POSTs to `/signin` endpoint
3. Backend validates credentials against KV store (`user:*`, `password:*` keys)
4. Backend returns sessionId + user object
5. Frontend stores sessionId in localStorage via `setSessionId()`
6. Session ID is sent in all subsequent requests via `X-Session-ID` header
7. `App.tsx` validates session on mount via `auth.getMe()` → retrieves user from KV
8. On logout: `clearSessionId()` removes from localStorage and KV

**Request Creation Flow:**

1. User fills form in `NewRequest.tsx`
2. Form data POSTed to `/requests` endpoint via `requests.create()`
3. Backend creates request with UUID, stores in KV as `request:{id}`
4. Backend finds all approvers from KV (`user:*` filtered by role)
5. Emails sent synchronously to all approvers via Sendgrid
6. FCM push notification sent asynchronously (best-effort)
7. Response returned with request object

**Request Approval Flow:**

1. Approvers view pending requests in `ApprovalPanel.tsx`
2. Fetches all requests via `requests.getAll()` → filtered by role-based access
3. User selects approve/reject with optional observation
4. POST to `/approvals` endpoint via `approvals.process()`
5. Backend stores approval in KV as `approval:{requestId}`
6. Request status updated to 'approved' or 'rejected'
7. Email sent to request originator notifying outcome
8. State refreshed in component

**Dashboard Stats Flow:**

1. `Dashboard.tsx` loads on app startup
2. Calls `requests.getAll()` to fetch all accessible requests
3. Filters in-memory: pending count, approved count, rejected count, this-month total
4. Computes stats by filtering array (no aggregation on backend)
5. Displays stat cards (clickable to filter requests list)
6. Shows recent 5 requests as preview

**State Management:**
- Global app state (user, currentView, statusFilter, highlightId, pendingCount) lives in `App.tsx`
- Component state managed via `useState` hooks (no global store)
- Session token persisted in localStorage
- Request data fetched on-demand (not cached, refetched each view)
- KV store on backend acts as single source of truth

## Key Abstractions

**Request Entity:**
- Purpose: Core business object representing a service request (montagem, motoboy, sedex)
- Examples: `src/types.ts` (interface), `supabase/functions/server/types.ts` (backend types)
- Pattern: Interfaces defined in both frontend and backend with matching fields (id, storeId, status, value, etc.)
- Lifetime: Created with 'pending' status → transitions to 'approved' or 'rejected' → stored in KV

**User with Role-Based Access:**
- Purpose: Represent authenticated user with role determining visible features and data access
- Examples: `src/types.ts::User`, `supabase/functions/server/types.ts::User`
- Roles: 'store' (create requests), 'approver' (approve requests, admin), 'approver_store' (hybrid), 'viewer' (read-only)
- Pattern: Stored in KV with metadata (storeId, storeName); role checked in backend before each sensitive operation

**API Facades:**
- Purpose: Encapsulate HTTP communication into named modules
- Examples: `auth`, `stores`, `requests`, `approvals`, `reports`, `dashboard`, `users` in `src/lib/api.ts`
- Pattern: Each facade is an object with async methods returning promise-wrapped API responses
- Benefits: Testable, consistent error handling, centralized endpoint management

**Component Props Pattern:**
- Purpose: Pass state and callbacks from App/AppShell to child components
- Pattern: Each component receives `onNavigate` callback to update global view state
- Examples: Dashboard buttons call `onNavigate('requests', 'pending')` to filter requests list

## Entry Points

**Browser:**
- Location: `index.html` (root HTML)
- Triggers: Browser loads app
- Responsibilities: Mounts React app to `#root` div, loads `src/main.tsx`

**Application Root:**
- Location: `src/main.tsx`
- Triggers: Page load
- Responsibilities: Create React root, render `<ErrorBoundary><App /></ErrorBoundary>`

**Main App Component:**
- Location: `src/app/App.tsx`
- Triggers: After error boundary initialization
- Responsibilities:
  - Validate session on mount via `auth.getMe()`
  - Manage global state: user, currentView, statusFilter, highlightId, pendingCount
  - Initialize push notifications for mobile (if native platform)
  - Render conditional views (Login → Setup → AppShell → [Dashboard|NewRequest|ApprovalPanel|...])
  - Handle logout and navigation

**Mobile App:**
- Location: Built with Capacitor (Android/iOS)
- Config: `capacitor.config.ts`
- Entry: Same React app, wraps in Capacitor runtime
- Additional: Native code can call JS via Capacitor plugins (push notifications, splash screen, notifications)

## Error Handling

**Strategy:** Try-catch blocks with user-facing error messages

**Patterns:**
- API errors caught in `apiCall()` (src/lib/api.ts) → throw new Error()
- Components wrap API calls in try-catch with `.finally(() => setLoading(false))`
- 401 responses trigger session clear via `clearSessionId()`
- Backend errors returned as JSON: `{ error: 'Human-readable message' }`
- Error Boundary component (`src/app/components/ErrorBoundary.tsx`) catches React render errors
- Notifications library (Sonner) used for toast notifications on errors

**Example:** Request approval failure in ApprovalPanel shows alert, state rolls back

## Cross-Cutting Concerns

**Logging:**
- Approach: Console.log with emoji prefixes for visual distinction
- Pattern: `✅ Success`, `❌ Error`, `📡 API call`, `🔐 Auth`, `📧 Email`, `🔔 Notification`
- No structured logging framework; directly logged to browser console and Edge Function logs

**Validation:**
- Client-side: React form handling (react-hook-form for complex forms)
- Server-side: Manual field checks in Edge Function endpoints
- Example: Required fields checked before creating user; email uniqueness verified

**Authentication:**
- Session tokens stored in KV (`session:{sessionId}` → `userId`)
- Session ID sent in `X-Session-ID` header on all requests
- Public endpoints (signin, setup) use Supabase anon key for auth
- Protected endpoints extract session from header, validate user exists in KV

**Authorization:**
- Backend checks user role before allowing sensitive operations
- Store users can only see their own requests (filtered in `requests.getAll()`)
- Approvers can see all requests and access admin endpoints
- Frontend conditionally renders views based on `user.role` via NavItems configuration

**Data Persistence:**
- All data in Supabase KV (not PostgreSQL)
- KV is ephemeral for development; production needs durable KV provider
- No migrations or schema management (flat KV structure)
