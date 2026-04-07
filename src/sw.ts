/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const TASK_CACHE = 'overdue-check-data';
const TASK_CACHE_KEY = '/task-snapshot.json';

interface TaskSnapshot {
  description: string;
  scheduleType: 'recurring' | 'scheduled';
  nextCheck: string | null;
  dueDate: string | null;
  isArchived: boolean;
  vehicleId: string;
}

interface CachePayload {
  tasks: TaskSnapshot[];
  updatedAt: string;
}

async function checkOverdueTasks(): Promise<void> {
  try {
    const cache = await caches.open(TASK_CACHE);
    const response = await cache.match(TASK_CACHE_KEY);
    if (!response) return;

    const { tasks } = (await response.json()) as CachePayload;
    const now = Date.now();

    const overdue = tasks.filter((task) => {
      if (task.isArchived) return false;
      if (task.scheduleType === 'scheduled' && task.dueDate) {
        return new Date(task.dueDate).getTime() < now;
      }
      if (task.nextCheck) {
        return new Date(task.nextCheck).getTime() < now;
      }
      return false;
    });

    if (overdue.length === 0) return;

    const body =
      overdue.length === 1
        ? overdue[0].description
        : `${overdue.length} Aufgaben sind überfällig`;

    await self.registration.showNotification('Omiigo Car – Wartung fällig', {
      body,
      icon: '/pwa-192.svg',
      badge: '/pwa-192.svg',
      tag: 'overdue-tasks',
      data: { url: '/maintenance' }
    } as NotificationOptions);
  } catch (error) {
    console.error('[SW] Overdue check failed:', error);
  }
}

self.addEventListener('periodicsync' as any, ((event: ExtendableEvent & { tag: string }) => {
  if (event.tag === 'check-overdue-tasks') {
    event.waitUntil(checkOverdueTasks());
  }
}) as EventListener);

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data?.url as string) || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin)) {
            return client.focus().then((c) => c.navigate(targetUrl));
          }
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});
