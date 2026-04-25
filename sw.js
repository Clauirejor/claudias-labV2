// Service Worker — Claudia's Lab
// Versión de caché — cambiar este número al actualizar la app
var CACHE_NAME = 'claudias-lab-v1';

// Archivos que se guardan para funcionar sin internet
var ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  // Fuentes de Google (se intentan cachear, si no hay internet usa fuentes del sistema)
  'https://fonts.googleapis.com/css2?family=Creepster&family=Nunito:wght@400;700;900&family=Share+Tech+Mono&display=swap'
];

// Instalación: guardar archivos en caché
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Añadir archivos locales (críticos)
      return cache.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png']);
    }).catch(function(err) {
      console.log('Cache install error:', err);
    })
  );
  self.skipWaiting();
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones: primero caché, luego red
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Guardar en caché si es una petición válida
        if (response && response.status === 200 && response.type !== 'opaque') {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function() {
        // Sin red y sin caché: devolver index.html como fallback
        return caches.match('./index.html');
      });
    })
  );
});
