const CACHE_NAME = 'hospital-app-v7';
const ASSETS = [
  './',
  './index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 外部APIへのリクエスト（Overpass / Nominatim / タイル等）は
  // サービスワーカーが一切介入しない → ブラウザが直接通信
  if (url.origin !== self.location.origin) {
    return;
  }

  // 同一オリジン（アプリ本体）のみキャッシュ戦略を適用
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
