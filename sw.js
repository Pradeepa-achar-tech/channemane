/* Channemane service worker — network-first so code updates propagate,
   with cache fallback for offline play.
   Bump CACHE when you ship a breaking change. */
const CACHE = 'channemane-v3';
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/game.js',
  './manifest.webmanifest',
  './icons/icon.svg'
];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(APP_SHELL).catch(()=>{}))
  );
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  if(req.method !== 'GET') return;

  // Network-first for same-origin — always prefer fresh code, fall back
  // to cache when offline. This keeps dev iterations from getting stuck
  // behind stale cached JS/CSS.
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if(sameOrigin){
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=> caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Cross-origin assets (CDN fonts/Bootstrap/jQuery): cache-first.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(()=> hit))
  );
});
