<script setup lang="ts">
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { ref } from 'vue';
import { usePwaInstall } from '../composables/usePwaInstall';

const hidden = ref(false);
const { canInstall, installApp } = usePwaInstall();

const handleInstall = async () => {
  await installApp();
};
</script>

<template>
  <div v-if="canInstall && !hidden" class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex items-start justify-between gap-3">
    <div class="flex items-start gap-3">
      <ArrowDownTrayIcon class="h-5 w-5 text-blue-600 mt-0.5" />
      <div>
        <p class="text-sm font-semibold text-blue-900">App installieren</p>
        <p class="text-sm text-blue-700">Installiere Omiigo Car auf deinem Startbildschirm für schnelleren Zugriff im Auto.</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button @click="handleInstall" class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Installieren</button>
      <button @click="hidden = true" class="p-2 rounded-lg text-blue-600 hover:bg-blue-100">
        <XMarkIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
