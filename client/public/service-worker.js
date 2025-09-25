self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon,
    vibrate: [100, 50, 100],
    data: {
      url: self.location.origin,
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});