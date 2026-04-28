# External Integrations

**Analysis Date:** 2026-04-28

## APIs & External Services

**Email Service:**
- Resend - Email notifications for new requests, approvals, rejections
  - SDK/Client: `resend` npm package (via JSR in Deno)
  - API Key: `RESEND_API_KEY` environment variable
  - From Address: `RESEND_FROM` environment variable (defaults to `Óticas Carol <onboarding@resend.dev>`)
  - Implementation: `supabase/functions/server/email.ts`
  - Sends emails for: new requests, approved requests, rejected requests

**Push Notifications:**
- Firebase Cloud Messaging (FCM) - Native push notifications for iOS and Android
  - Server Key: `FIREBASE_SERVER_KEY` environment variable
  - Implementation: `supabase/functions/server/fcm.ts`
  - Client integration: `src/lib/pushNotifications.ts`
  - Token storage: KV store (`fcm_token:${userId}`)
  - Platforms: iOS (GoogleService-Info.plist) and Android (google-services.json)

## Data Storage

**Databases:**
- Supabase PostgreSQL
  - Connection: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - Key Value Store Table: `kv_store_b2c42f95`
    - Stores: Users, sessions, stores, requests, approvals, FCM tokens
    - Located: `supabase/functions/server/kv_store.tsx`
  - Client: `@supabase/supabase-js` 2.95.3 (frontend), JSR version 2.49.8 (backend)

**File Storage:**
- Local filesystem only - No cloud storage integration detected
- Attachments referenced in `Request` type but not implemented in current codebase

**Caching:**
- localStorage (browser) - Session ID, FCM token storage
- KV Store (Supabase) - Server-side caching of users, sessions, stores

## Authentication & Identity

**Auth Provider:**
- Custom implementation (no third-party OAuth)
  - Email + password authentication
  - Session-based (session ID stored in KV store)
  - Implementation: `src/lib/api.ts` (client), `supabase/functions/server/index.tsx` (backend)

**Session Management:**
- Session ID stored in localStorage on client
- Session validated via `X-Session-ID` header
- Session endpoint: `/me` - validates session and returns user info
- Sign-in endpoint: `/signin` - authenticates with email/password
- Sign-out: Clears localStorage session ID

**User Roles:**
- `store` - Store staff (submits requests)
- `approver` - Approves/rejects requests
- `approver_store` - Approver tied to specific store
- `viewer` - Read-only access

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, Rollbar, or similar integration

**Logs:**
- Console logging with emoji prefixes for visual indication
  - `console.log()` for info messages
  - `console.error()` for errors
  - Examples: `✅ Session valid`, `❌ Session invalid`, `📡 API request`
- CloudFunction logs via Supabase dashboard

## CI/CD & Deployment

**Hosting:**
- Vercel - Frontend hosting
  - Deployed at: `https://oticas-carol-solicitacoes.vercel.app`
  - Build command: `npm run build` (Vite)
  - Output directory: `dist/`

**Backend:**
- Supabase Edge Functions
  - Function name: `make-server-b2c42f95`
  - Base URL: `https://${projectId}.supabase.co/functions/v1/make-server-b2c42f95`
  - Endpoints exposed:
    - `/health` - Health check
    - `/signin` - Authentication
    - `/me` - Get current user
    - `/stores` - Store management
    - `/users` - User management
    - `/requests` - Request CRUD operations
    - `/approvals` - Process request approvals
    - `/stats` - Dashboard statistics
    - `/reports/monthly` - Monthly reports
    - `/setup` - Initial setup (admin only)
    - `/save-fcm-token` - Save FCM token
    - `/remove-fcm-token` - Remove FCM token

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or similar configured

**Mobile Builds:**
- Capacitor Android/iOS build scripts
  - `cap:init` - Initialize Capacitor project
  - `cap:add:android` - Add Android platform
  - `cap:add:ios` - Add iOS platform
  - `cap:sync` - Sync and build
  - `cap:open:android` - Open Android Studio
  - `cap:open:ios` - Open Xcode
  - Build script: `build-apk.ps1` (PowerShell for Windows)

## Environment Configuration

**Required env vars:**
- `SUPABASE_URL` - Supabase project URL (https://bfkgnnnxyooretgrxedo.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role for backend operations
- `RESEND_API_KEY` - Email service API key
- `FIREBASE_SERVER_KEY` - Firebase Cloud Messaging server key
- `RESEND_FROM` - Sender email address
- `APP_URL` - Frontend application URL (defaults to Vercel URL)

**Secrets location:**
- Supabase project settings - Environment variables for Edge Functions
- Frontend: Public Anon Key in `utils/supabase/info.tsx` (safe to commit)

**Firebase Configuration:**
- Mobile-specific config files (NOT in repository for security):
  - Android: `android/app/google-services.json`
  - iOS: `ios/App/GoogleService-Info.plist`
  - Obtain from Firebase Console: `https://console.firebase.google.com/`
  - Project ID: `30569876119`

## Webhooks & Callbacks

**Incoming:**
- None detected - No webhook endpoints exposed for external services

**Outgoing:**
- Email notifications (via Resend)
  - Triggered on request creation, approval, rejection
  - Recipients: Store users, approvers
- Push notifications (via Firebase)
  - Triggered on request status changes
  - Sent to Capacitor-enabled mobile apps
- Deep linking from push notifications
  - Implementation: `src/lib/pushNotifications.ts` `setupDeepLinkFromNotification()`
  - Navigates to request details or requests list on notification tap

## API Contracts

**Frontend → Supabase Edge Functions:**
- Base URL: `https://bfkgnnnxyooretgrxedo.supabase.co/functions/v1/make-server-b2c42f95`
- Headers:
  - `Authorization: Bearer ${publicAnonKey}` (always)
  - `X-Session-ID: ${sessionId}` (if authenticated)
  - `Content-Type: application/json`
- Auth flow:
  1. POST `/signin` with email/password → returns sessionId
  2. Store sessionId in localStorage
  3. Send sessionId in `X-Session-ID` header for subsequent requests
  4. 401 response → clear sessionId and redirect to login

**Mobile App → Firebase:**
- Capacitor PushNotifications plugin
  - Handles registration and token management
  - Sends FCM token to backend via `/save-fcm-token` endpoint
  - Listens for push notifications in foreground/background

**Backend → Email Service:**
- Resend API (via JSR npm package in Deno)
- POST request with email content and recipient
- Response: Email sent confirmation

---

*Integration audit: 2026-04-28*
