// ==============================================================================
// SAFRO TRAVEL APP — SERVICE WORKER & NATIVE PUSH NOTIFICATION ENGINE
// Supports: Background Notifications, FCM Push, Deep Linking, Sound & Vibration
// ==============================================================================

const CACHE_NAME = 'safro-sw-v1';
const SAFRO_ICON = '/safro-icon.jpeg';

// 1. Service Worker Installation & Activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 2. Incoming Push Notification (FCM / Web Push Protocol)
self.addEventListener('push', (event) => {
  let payload = {};

  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (err) {
    payload = {
      title: 'SAFRO Alert',
      body: event.data ? event.data.text() : 'You have a new update from SAFRO.',
    };
  }

  const title = payload.title || payload.notification?.title || 'SAFRO Travel Companion';
  const body = payload.body || payload.message || payload.notification?.body || 'Important trip update available.';
  const category = payload.category || payload.data?.category || 'general';
  const priority = payload.priority || payload.data?.priority || 'normal';
  const destination = payload.destination || payload.data?.destination || payload.data?.url || '/home';
  const tag = payload.tag || payload.data?.tag || `safro-${category}-${Date.now()}`;
  const image = payload.image || payload.notification?.image || null;

  // Determine vibration based on category & priority
  let vibratePattern = [150, 75, 150];
  if (category === 'safety' || priority === 'urgent' || priority === 'high') {
    vibratePattern = [300, 100, 300, 100, 400];
  } else if (category === 'navigation') {
    vibratePattern = [200, 100, 200];
  }

  // Determine interactive action buttons
  let actions = [];
  if (payload.actions && Array.isArray(payload.actions)) {
    actions = payload.actions;
  } else if (category === 'navigation') {
    actions = [
      { action: 'view_route', title: '📍 View Route' },
      { action: 'dismiss', title: 'Dismiss' },
    ];
  } else if (category === 'safety') {
    actions = [
      { action: 'open_safro', title: '🚨 Open Alert' },
      { action: 'dismiss', title: 'Dismiss' },
    ];
  } else {
    actions = [
      { action: 'open_safro', title: 'Open SAFRO' },
    ];
  }

  const notificationOptions = {
    body,
    icon: payload.icon || SAFRO_ICON,
    badge: payload.badge || SAFRO_ICON,
    image: image || undefined,
    tag,
    renotify: true,
    vibrate: vibratePattern,
    requireInteraction: category === 'safety' || priority === 'urgent',
    data: {
      url: destination,
      category,
      priority,
      notificationId: payload.notificationId || `push_${Date.now()}`,
      timestamp: Date.now(),
      ...payload.data,
    },
    actions,
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

// 3. Notification Tap & Action Button Handling (Deep Linking)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  // If user tapped dismiss, do nothing further
  if (action === 'dismiss') {
    return;
  }

  let targetUrl = data.url || '/home';

  // Handle custom scheme "safro://"
  if (targetUrl.startsWith('safro://')) {
    const route = targetUrl.replace('safro://', '/');
    targetUrl = route.startsWith('/') ? route : `/${route}`;
  }

  // Ensure absolute URL matching the app origin
  const destinationUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. If an existing SAFRO tab/window is open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          client.postMessage({
            type: 'SAFRO_NOTIFICATION_CLICK',
            url: targetUrl,
            data,
            action,
          });

          if (client.url !== destinationUrl && 'navigate' in client) {
            client.navigate(destinationUrl);
          }
          return client.focus();
        }
      }

      // 2. If app is closed or minimized without active window, open fresh window
      if (self.clients.openWindow) {
        return self.clients.openWindow(destinationUrl);
      }
    })
  );
});

// 4. Notification Dismissal Handler
self.addEventListener('notificationclose', (event) => {
  // Optional: log dismissal analytics
});

// 5. Message Event for client-driven background triggers & schedules
self.addEventListener('message', (event) => {
  if (!event.data) return;

  const { type, payload, delayMs } = event.data;

  if (type === 'TRIGGER_NOTIFICATION') {
    const { title, options } = payload;
    self.registration.showNotification(title, options);
  }

  if (type === 'SCHEDULE_NOTIFICATION') {
    const { title, options } = payload;
    setTimeout(() => {
      self.registration.showNotification(title, options);
    }, delayMs || 5000);
  }
});
