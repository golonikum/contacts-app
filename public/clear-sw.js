// This script will help update the service worker and clear old caches
// Run this in the browser console to fix PWA loading issues

// 1. Unregister all service workers
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    console.log('Unregistering service worker:', registration);
    registration.unregister();
  }
}).then(function() {
  console.log('All service workers unregistered');

  // 2. Clear all caches
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  });
}).then(function() {
  console.log('All caches cleared');

  // 3. Reload the page
  window.location.reload();
});
