const CACHE = 'todo-cache-v3';
const URLS = [
  './', './index.html', './manifest.json',
  './icon-180.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(URLS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // الصفحة نفسها: network-first حتى تصل التحديثات فوراً
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // باقي الملفات: cache-first
  e.respondWith(caches.match(e.request).then((c) => c || fetch(e.request)));
});
