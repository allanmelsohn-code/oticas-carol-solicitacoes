# Codebase Concerns

**Analysis Date:** 2026-04-28

## Tech Debt

**Loose TypeScript typing in critical components:**
- Issue: Multiple `any` type casts and loose typing in data parsing, especially in `MonthlyReportPage.tsx` and `Setup.tsx`
- Files: `src/app/components/reports/MonthlyReportPage.tsx`, `src/app/components/Setup.tsx`, `src/lib/notifications.ts`, `src/lib/pushNotifications.ts`
- Impact: Type safety errors go undetected at compile time. Runtime crashes possible when unexpected data shapes are received from API
- Fix approach: Strict type definitions for API responses, remove `any` casts, use explicit interface definitions. Example in `MonthlyReportPage.tsx` line 244: `(doc as any).lastAutoTable.finalY` should be properly typed

**Legacy UserAdmin component still in codebase:**
- Issue: `src/app/components/UserAdmin.tsx` contains deprecated `UserAdminLegacy` function that's no longer used
- Files: `src/app/components/UserAdmin.tsx` (deprecated implementation at lines 28-251), replaced by `src/app/components/admin/UserAdminPage.tsx`
- Impact: Code duplication, maintenance burden, confusion about which implementation to modify
- Fix approach: Remove legacy function entirely from `UserAdmin.tsx`, keep only the re-export of `UserAdminPage`

**Complex boolean logic in form handling:**
- Issue: Awkward boolean-to-string conversion in `NewRequest.tsx` line 375
- Files: `src/app/components/NewRequest.tsx` (line 375)
- Impact: Hard to maintain, error-prone when modifying boolean field handling
- Fix approach: Use React Hook Form or standardize form state management. Replace `formData.chargedToClient === true ? 'sim' : formData.chargedToClient === false && formData.chargedToClient !== ('' as unknown as boolean) ? 'nao' : ''` with helper function

**Request number generation not guaranteed unique:**
- Issue: Format `SOL-YYYYMMDD-XXXXX` where XXXXX is first 5 chars of UUID has collision potential
- Files: `src/app/components/NewRequest.tsx` (lines 98-103)
- Impact: Two requests created on same day with IDs starting same 5 chars would have identical request numbers
- Fix approach: Use sequence/counter instead of ID substring, or persist request numbers in database with uniqueness constraint

## Missing Error Handling

**Silent error suppression in dashboard:**
- Issue: Errors fetching pending count are caught but completely silenced
- Files: `src/app/App.tsx` (lines 40-42)
- Impact: Silent failures mask API issues, users don't know why pending count is missing
- Fix approach: At minimum log to console or show subtle indicator when fetch fails. Could implement retry logic with exponential backoff

**Generic API error messages:**
- Issue: API errors show generic "HTTP 401" or "Falha na requisição" instead of meaningful messages
- Files: `src/lib/api.ts` (lines 53-54)
- Impact: Users and support can't understand what went wrong
- Fix approach: Parse error response bodies for detailed error codes/messages, provide human-readable text based on error type

**Unhandled promise rejections in notification setup:**
- Issue: `initializePushNotifications` has hardcoded 10-second timeout that resolves even on actual errors
- Files: `src/lib/pushNotifications.ts` (lines 84-87)
- Impact: App may think notifications are configured when they actually failed silently
- Fix approach: Distinguish between timeout and actual errors, implement proper retry logic

## Security Considerations

**Session ID stored in localStorage without protection:**
- Risk: Session IDs persisted in localStorage can be stolen via XSS attack
- Files: `src/lib/api.ts` (lines 11, 23), `src/app/components/UserAdmin.tsx` (line 58)
- Current mitigation: None - relies on HTTPS only
- Recommendations: Use httpOnly cookies instead of localStorage for session storage. If localStorage required, implement token rotation and expiration. Add CSRF token to all state-changing requests

**Hardcoded master password for setup:**
- Risk: `setup123` is visible in frontend code
- Files: `src/lib/api.ts` (line 225)
- Current mitigation: None
- Recommendations: Setup should only be accessible to admin accounts via secure backend endpoint. Remove hardcoded password, use proper authentication

**Firebase config files missing from repo:**
- Risk: Config files `google-services.json` and `GoogleService-Info.plist` required for mobile builds but not in version control
- Files: Referenced in `IMPORTANTE-FIREBASE.txt`, required in `android/app/` and `ios/App/`
- Current mitigation: Documented in `IMPORTANTE-FIREBASE.txt`, but easy to miss
- Recommendations: Implement build process that fails clearly if required config files missing. Consider automated Firebase config retrieval from Firebase Console API

**Supabase public anon key exposed in frontend:**
- Risk: Public key is in frontend code but still sensitive
- Files: `src/lib/api.ts` (line 32), imported from `/utils/supabase/info`
- Current mitigation: Intended to be public, but combined with session ID it could be exploited
- Recommendations: Ensure Supabase RLS policies are strict. Consider backend API gateway to avoid exposing edge functions directly

**No input validation before API submission:**
- Risk: Form values sent directly to API without client-side validation
- Files: `src/app/components/NewRequest.tsx` (lines 87-122), especially numeric value parsing (line 95)
- Current mitigation: HTML5 required attributes, but easily bypassed
- Recommendations: Add Zod/Yup validation schemas. Validate numeric ranges, string length, date formats client-side before submission

## Performance Bottlenecks

**Large sidebar component (726 lines):**
- Problem: `src/app/components/ui/sidebar.tsx` at 726 lines is very large, likely contains multiple concerns
- Files: `src/app/components/ui/sidebar.tsx`
- Cause: Sidebar probably handles navigation, user menu, and other features in one component
- Improvement path: Break into smaller composable components (NavMenu, UserProfile, etc). Use composition to manage state

**Unoptimized bulk approval operation:**
- Problem: Bulk actions trigger Promise.all() which sends requests in parallel to API without rate limiting
- Files: `src/app/components/ApprovalPanel.tsx` (lines 111-113)
- Cause: No batching or throttling mechanism
- Improvement path: Implement request batching (multiple approvals in single API call), or use queue with concurrency limits

**All requests re-fetched on every state change:**
- Problem: ApprovalPanel and RequestsList both call `getAll()` which retrieves entire request list
- Files: `src/app/components/ApprovalPanel.tsx` (line 32), `src/app/components/requests/RequestsList.tsx`
- Cause: No client-side caching or partial update strategy
- Improvement path: Implement request caching with TTL, use WebSocket for real-time updates, or add pagination with lazy loading

**No pagination on reports:**
- Problem: Monthly report loads all requests, then renders all rows
- Files: `src/app/components/reports/MonthlyReportPage.tsx`
- Cause: No server-side pagination implemented
- Improvement path: Implement server-side pagination with limit/offset parameters. Add virtual scrolling for large lists

## Fragile Areas

**Browser-specific notification handling is brittle:**
- Files: `src/lib/notifications.ts` (lines 9-44)
- Why fragile: User agent string parsing is fragile and incomplete (doesn't handle all browser variants). iOS/Safari detection based on regex could fail with new browser versions
- Safe modification: Use feature detection instead of user agent parsing. Check for `Notification` API support directly. For iOS, detect lack of Web Notification support
- Test coverage: Only hardcoded UA strings tested, not actual browser environment variations

**Push notification listener registration stacking:**
- Files: `src/lib/pushNotifications.ts` (lines 96-118)
- Why fragile: Comment mentions "listener stacking" guard (line 29) but implementation is incomplete. Calling setupPushListeners() multiple times registers duplicate listeners
- Safe modification: Use a proper event emitter pattern with automatic deduplication. Track registered listeners, prevent duplicates
- Test coverage: No tests for multiple initialization scenarios

**Form state mutation pattern:**
- Files: `src/app/components/NewRequest.tsx` (lines 49-58, 124-126)
- Why fragile: Direct object spread mutation in state setter: `setFormData(prev => ({ ...prev, [field]: value }))`. Works but brittle if form structure changes or nested fields added
- Safe modification: Use React Hook Form library which handles complex form state correctly. Or implement immutable update helper function
- Test coverage: No tests for form state transitions

**API session management relies on global variable:**
- Files: `src/lib/api.ts` (line 7)
- Why fragile: Global `sessionId` variable can be stale if multiple tabs open. localStorage is source of truth but global var could diverge
- Safe modification: Remove global variable, always read from localStorage. Better: use Context API to sync session across app
- Test coverage: No tests for multi-tab scenarios

## Scaling Limits

**No request pagination in API calls:**
- Current capacity: All API calls (`requests.getAll()`, `users.getAll()`) load entire dataset
- Limit: Will break when dataset exceeds ~10MB (browser memory)
- Scaling path: Add pagination parameters to all `getAll()` methods. Implement infinite scroll or pagination UI

**No caching strategy for frequently accessed data:**
- Current capacity: Stores list loaded fresh every component mount
- Limit: Noticeably slow on slow connections after dozens of requests
- Scaling path: Implement React Query or SWR for data caching. Add 5-minute TTL for stable data (stores, users)

**WebSocket support missing for real-time updates:**
- Current capacity: Polling-based, RefreshPending interval not shown but likely 5-30 seconds
- Limit: Stale data for up to polling interval, poor UX for active users
- Scaling path: Implement Supabase realtime subscriptions for request/approval changes

**No database connection pooling or caching mentioned:**
- Current capacity: Unknown - backend edge function may be handling this
- Limit: Edge function cold starts could cause 1-5 second delays
- Scaling path: Verify edge function concurrency limits. Consider dedicated backend service if > 100 concurrent users

## Dependencies at Risk

**Capacitor version mismatch risk:**
- Risk: `@capacitor/android` 8.0.2 is pinned, but `@capacitor/cli` also 8.0.2 - versions should match to prevent CLI/runtime conflicts
- Impact: Build could fail or native code could be incompatible if CLI generates code for different version
- Migration plan: Use exact version matching across all Capacitor packages. Implement pre-commit hook to validate version consistency

**Radix UI and Shadcn/ui duplication:**
- Risk: Project uses both Radix UI (raw components) and Shadcn/ui (wrapper layer). Both maintain duplicate component definitions
- Impact: Maintenance burden, bundle size bloat, inconsistent component APIs across codebase
- Migration plan: Commit fully to Shadcn/ui. Remove raw Radix imports from `src/app/components/ui/*` files, import from Shadcn instead. Or vice versa if preferring raw Radix

**TypeScript version drift:**
- Risk: `^5.9.3` allows minor version updates. Language features vary between 5.9, 5.10+
- Impact: Type definitions could fail to build if TypeScript updated and syntax changes
- Migration plan: Consider pinning to exact version `5.9.3` for stability. Document required version in README

## Missing Critical Features

**No offline support:**
- Problem: App doesn't work without network. No service worker or offline queue
- Blocks: Field staff at remote stores can't use app without network access
- Fix approach: Implement service worker with offline request queue. Cache recent requests locally. Sync when reconnected

**No audit trail for approvals:**
- Problem: Who changed status, when, why - not fully logged or queryable
- Blocks: Cannot analyze approval patterns or investigate disputes
- Fix approach: Store all approval events with timestamp, user ID, IP address. Add audit log viewer in admin panel

**No role-based permissions enforced consistently:**
- Problem: Some features check `user.role === 'store'` but many don't. No permission matrix
- Blocks: Can't safely add new features without review all permission checks
- Fix approach: Centralize permission checks in middleware/guard function. Create role-permission matrix in constants

**No bulk import for requests:**
- Problem: Each request entered manually, no CSV/Excel import
- Blocks: Can't easily migrate historical data or batch-create requests
- Fix approach: Add Excel upload component with progress tracking. Parse and validate rows before bulk insert

**No request search or filtering:**
- Problem: No way to find requests by requestedBy, date range, or store except in reports
- Blocks: Hard to track individual requests or investigate issues
- Fix approach: Add search bar with filters on RequestsList. Implement backend search endpoint with indexing

## Test Coverage Gaps

**No unit tests at all:**
- What's not tested: All utility functions (`src/utils/currency.ts`), API client (`src/lib/api.ts`), notification logic (`src/lib/notifications.ts`)
- Files: `src/lib/*.ts`, `src/utils/*.ts`
- Risk: Currency formatting bugs undetected, API error handling not verified, notification permission bugs go unnoticed
- Priority: High - lib/api.ts should be 100% covered given it's critical path

**No integration tests:**
- What's not tested: Login flow end-to-end, request creation + approval workflow, report generation
- Files: N/A (no test files exist)
- Risk: Breaking changes only caught in manual testing or production
- Priority: High - critical user workflows untested

**No component rendering tests:**
- What's not tested: Form submission, error display, modal interactions
- Files: `src/app/components/NewRequest.tsx`, `src/app/components/ApprovalPanel.tsx`, `src/app/components/Login.tsx`
- Risk: UI regressions undetected, accessibility issues missed
- Priority: Medium - visual/interaction bugs less critical than logic bugs

**No browser compatibility tests:**
- What's not tested: Notification behavior across Chrome/Firefox/Safari, mobile rendering
- Files: All files, especially `src/lib/notifications.ts`, `src/app/components/ui/*`
- Risk: iOS users can't see notifications (known issue), Safari CSS bugs
- Priority: Medium - affects specific user groups

**No error scenario tests:**
- What's not tested: API timeouts, network failures, invalid responses, permission denied on notifications
- Files: `src/lib/api.ts`, `src/lib/notifications.ts`, `src/lib/pushNotifications.ts`
- Risk: Silent failures, unhandled rejections, bad error messages in production
- Priority: High - error cases are common in real usage

---

*Concerns audit: 2026-04-28*
