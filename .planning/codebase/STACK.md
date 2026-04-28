# Technology Stack

**Analysis Date:** 2026-04-28

## Languages

**Primary:**
- TypeScript 5.9.3 - Frontend UI components, types, React app
- TSX - React components with TypeScript (`src/app/components/*.tsx`)
- Deno - Backend runtime for Supabase Edge Functions (`supabase/functions/server/`)

**Secondary:**
- JavaScript - Configuration files (vite.config.ts, capacitor.config.ts)
- PowerShell - Build scripts (`build-apk.ps1`, `setup-windows.ps1`)

## Runtime

**Environment:**
- Node.js / npm - Primary runtime for development and frontend build
- Deno - Backend runtime for Edge Functions (via Supabase)
- Capacitor - Native mobile app runtime (iOS and Android)

**Package Manager:**
- npm (pnpm overrides configured for Vite 6.3.5)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3.1 - UI framework
- Vite 6.4.2 - Build tool and dev server
- Hono 4.0.2 (npm package via Deno) - Backend web framework for Edge Functions

**Mobile:**
- Capacitor 8.x - Bridge between web and native mobile (iOS/Android)
  - `@capacitor/core` 8.0.2
  - `@capacitor/android` 8.0.2
  - `@capacitor/ios` 8.0.2
  - `@capacitor/push-notifications` 8.0.0 - Push notification support
  - `@capacitor/splash-screen` 8.0.0 - Native splash screen
  - `@capacitor/app` 8.0.0 - App lifecycle management

**UI Libraries:**
- Radix UI (multiple components) - Accessible component primitives
- Material-UI (`@mui/material` 7.3.5, `@mui/icons-material` 7.3.5) - Material design components
- Tailwind CSS 4.1.12 - Utility-first CSS framework via `@tailwindcss/vite` 4.1.12
- Emotion (`@emotion/react` 11.14.0, `@emotion/styled` 11.14.1) - CSS-in-JS

**Styling & Animation:**
- PostCSS (`@tailwindcss/postcss` 4.2.2, `autoprefixer` 10.4.27) - CSS processing
- Motion 12.23.24 - Animation library
- tailwind-merge 3.2.0 - Merge Tailwind classes
- tw-animate-css 1.3.8 - Tailwind animations

**Form & Data:**
- react-hook-form 7.55.0 - Form state management
- recharts 2.15.2 - Charting library
- xlsx 0.18.5 - Excel file handling
- jspdf 4.1.0, jspdf-autotable 5.0.7 - PDF generation

**UI Components:**
- cmdk 1.1.1 - Command menu
- date-fns 3.6.0 - Date manipulation
- lucide-react 0.487.0 - Icon library
- react-day-picker 8.10.1 - Date picker
- react-slick 0.31.0 - Carousel
- embla-carousel-react 8.6.0 - Carousel library
- react-resizable-panels 2.1.7 - Resizable panel layout
- react-responsive-masonry 2.7.1 - Masonry layout
- vaul 1.1.2 - Drawer component
- sonner 2.0.3 - Toast notifications
- clsx 2.1.1 - Utility for conditional CSS classes
- class-variance-authority 0.7.1 - Component variants

**Drag & Drop:**
- react-dnd 16.0.1 - Drag and drop library
- react-dnd-html5-backend 16.0.1 - HTML5 backend for DnD

**Utility:**
- next-themes 0.4.6 - Theme management
- input-otp 1.4.2 - OTP input component
- react-popper 2.3.0, @popperjs/core 2.11.8 - Popover positioning

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.95.3 - Supabase client SDK for database and auth
- Resend (via Deno npm: `resend`) - Email service for sending notifications
- Firebase Cloud Messaging - Push notifications (referenced in FCM integration)

**Infrastructure:**
- `jsr:@supabase/supabase-js@2.49.8` - Backend Supabase client in Edge Functions

## Configuration

**Environment:**
- Supabase Project ID: `bfkgnnnxyooretgrxedo`
- Public Anon Key: Configured in `utils/supabase/info.tsx`
- App URL: Defaults to `https://oticas-carol-solicitacoes.vercel.app`
- Environment variables required:
  - `SUPABASE_URL` - Supabase project URL
  - `SUPABASE_SERVICE_ROLE_KEY` - Service role key for backend
  - `RESEND_API_KEY` - Email service API key
  - `RESEND_FROM` - Email sender address (defaults to Resend onboarding domain)
  - `FIREBASE_SERVER_KEY` - Firebase Cloud Messaging server key
  - `APP_URL` - Frontend application URL for email links

**Build:**
- `vite.config.ts` - Vite configuration with React and Tailwind plugins
- `postcss.config.mjs` - PostCSS configuration (Tailwind v4 via plugin)
- `tsconfig.json` - TypeScript configuration (if present)
- `capacitor.config.ts` - Capacitor mobile app configuration
  - App ID: `com.oticascarol.app`
  - App Name: `Óticas Carol`

## Platform Requirements

**Development:**
- Node.js (version not specified in package.json)
- npm with pnpm overrides
- TypeScript 5.9.3
- Deno (for backend development)
- Android SDK (for Android builds)
- Xcode (for iOS builds)
- Firebase project configured (for push notifications)

**Production:**
- Vercel - Frontend hosting (`https://oticas-carol-solicitacoes.vercel.app`)
- Supabase - Backend platform (Edge Functions, database, authentication)
- Firebase Cloud Messaging - Push notification service
- Resend - Email service provider

**Mobile Platforms:**
- iOS 13+ (Capacitor support)
- Android 5.0+ (via Capacitor and Firebase)

---

*Stack analysis: 2026-04-28*
