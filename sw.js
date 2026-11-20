const CACHE = 'voice-dashboard-v8';
const BESTANDEN = [
  './', './index.html', './manifest.json', './icon.svg', './overzetten.html', './qrcode.js',
  './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BESTANDEN)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(namen =>
    Promise.all(namen.filter(n => n !== CACHE).map(n => caches.delete(n)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Aanroepen naar ElevenLabs, Twilio en Make nooit cachen
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request)
        .then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});

// Tik op een melding: open het dashboard
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: 'window', includeUncontrolled: true}).then(lijst => {
    for (const c of lijst) { if ('focus' in c) return c.focus(); }
    return clients.openWindow('./index.html');
  }));
});
