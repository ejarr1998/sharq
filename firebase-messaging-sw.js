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
const CACHE = 'sharq-v11';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'index.html', 'jobs.json', 'manifest.json'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', e => {
  if (e.request.url.includes('jobs.json')) {
    // network-first for job data
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else if (e.request.mode === 'navigate' || e.request.destination) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
