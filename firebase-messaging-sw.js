importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ============ SAME FIREBASE CONFIG AS index.html ============
firebase.initializeApp({
  apiKey: "AIzaSyBJCHgFjwPgF0xGxmjkgxwnex09pwTKar8",
  authDomain: "sparq-52efd.firebaseapp.com",
  projectId: "sparq-52efd",
  storageBucket: "sparq-52efd.firebasestorage.app",
  messagingSenderId: "785016952899",
  appId: "1:785016952899:web:b51ce870f06e52b3c59cf6"
});
// ============================================================

const messaging = firebase.messaging();

// FCM SDK displays notification payloads automatically (single notification).
// onBackgroundMessage intentionally omitted to avoid duplicate display.

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});

// Offline caching
const CACHE = 'sharq-v36';
const PRECACHE = ['./', 'index.html', 'jobs.json', 'manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // fetch fresh from network, bypassing HTTP cache, so a new version
      // never bakes a stale copy of the app into its own cache
      Promise.all(PRECACHE.map(u =>
        fetch(u + '?sw=' + CACHE, { cache: 'no-cache' })
          .then(r => c.put(u, r))
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    // delete every old cache so stale versions are truly gone
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (e.request.mode === 'navigate') {
    // network-first for the app shell: fresh code whenever online,
    // cached copy only as an offline fallback
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put('index.html', copy));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
    );
  } else if (url.includes('jobs.json')) {
    // network-first for job data
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else if (e.request.destination === 'image' || url.includes('manifest.json')) {
    // icons and manifest: cache-first is fine, they rarely change
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
  // everything else (Firebase, Firestore, Google auth) goes straight to network
});
