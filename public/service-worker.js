// public/service-worker.js
self.addEventListener('push', function(event) {
  const data = event.data.json();
  const title = data.title || 'Notification';
  const options = {
    body: data.message,
    icon: '/img/logo.png', 
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
