/// <reference lib="webworker" />
// Minimal service worker — no caching, no precaching.
// The app requires a live network connection at all times.
declare const self: ServiceWorkerGlobalScope

// Required placeholder: workbox-build injects the precache manifest here.
// globPatterns:[] + globIgnores:['**/*'] ensures the manifest is always [].
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ignored = (self as any).__WB_MANIFEST
void ignored

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
