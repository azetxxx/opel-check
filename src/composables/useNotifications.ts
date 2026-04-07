import { computed, ref } from 'vue';

const PERIODIC_SYNC_TAG = 'check-overdue-tasks';
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

const permission = ref<NotificationPermission>(
  typeof Notification !== 'undefined' ? Notification.permission : 'default'
);

const isSupported = typeof Notification !== 'undefined' && 'serviceWorker' in navigator;

const registerPeriodicSync = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    if ('periodicSync' in registration) {
      await (registration as any).periodicSync.register(PERIODIC_SYNC_TAG, {
        minInterval: SYNC_INTERVAL_MS
      });
    }
  } catch {
    // Periodic sync not available or permission denied — expected on most browsers
  }
};

export function useNotifications() {
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied';

    const result = await Notification.requestPermission();
    permission.value = result;

    if (result === 'granted') {
      await registerPeriodicSync();
    }

    return result;
  };

  const disableNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      if ('periodicSync' in registration) {
        await (registration as any).periodicSync.unregister(PERIODIC_SYNC_TAG);
      }
    } catch {
      // Unregister silently fails if not registered
    }
  };

  return {
    permission: computed(() => permission.value),
    isSupported,
    isGranted: computed(() => permission.value === 'granted'),
    isDenied: computed(() => permission.value === 'denied'),
    requestPermission,
    disableNotifications,
    registerPeriodicSync
  };
}
