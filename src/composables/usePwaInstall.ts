import { computed, ref } from 'vue';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(false);
let initialized = false;

export function usePwaInstall() {
  const onBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    deferredPrompt.value = event as BeforeInstallPromptEvent;
  };

  const onInstalled = () => {
    isInstalled.value = true;
    deferredPrompt.value = null;
  };

  const installApp = async () => {
    if (!deferredPrompt.value) return false;

    await deferredPrompt.value.prompt();
    const choice = await deferredPrompt.value.userChoice;
    deferredPrompt.value = null;
    return choice.outcome === 'accepted';
  };

  if (!initialized && typeof window !== 'undefined') {
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches;
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    initialized = true;
  }

  return {
    canInstall: computed(() => !!deferredPrompt.value && !isInstalled.value),
    isInstalled: computed(() => isInstalled.value),
    installApp
  };
}
