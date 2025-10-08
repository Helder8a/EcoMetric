const CACHE_NAME = 'portugalapoia-cache-v5'; // Actualizamos la versión para forzar la actualización en los navegadores
// Lista de archivos esenciales para la app (la "App Shell")
const urlsToCache = [
  '/',
  '/index.html',
  '/empregos.html',
  '/doações.html',
  '/serviços.html',
  '/blog.html',
  '/offline.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/images_pta/logocuadrado.jpg'
];

// 1. Evento de Instalación: Se guarda el "App Shell" en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Error al abrir la cache o añadir archivos:', error);
      })
  );
});

// 2. Evento de Activación: Limpia cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Evento Fetch: Decide cómo responder a las peticiones (Cache-First, luego Network)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en la caché, la devolvemos
        if (response) {
          return response;
        }

        // Si no, la buscamos en la red
        return fetch(event.request).then(
          networkResponse => {
            // Y si la respuesta es válida, la guardamos en caché para el futuro
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
      .catch(() => {
        // Si todo falla (sin caché y sin red), mostramos la página offline
        return caches.match('/offline.html');
      })
  );
});