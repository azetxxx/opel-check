<script setup lang="ts">
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/20/solid';
import { ref } from 'vue';

defineProps<{
  isImporting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'export'): void;
  (e: 'import-file', file: File): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const openFilePicker = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  emit('import-file', file);
  target.value = '';
};
</script>

<template>
  <section class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
    <div class="mb-2">
      <p class="text-sm text-gray-500">Backup exportieren oder importieren.</p>
    </div>

    <div class="space-y-3">
      <button
        @click="emit('export')"
        class="flex w-full items-center justify-between rounded-[22px] px-4 py-4 text-left hover:bg-gray-50"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white">
            <ArrowDownTrayIcon class="h-5 w-5" />
          </div>
          <div>
            <p class="font-medium text-gray-900">Daten exportieren</p>
            <p class="text-sm text-gray-500">Backup als JSON-Datei</p>
          </div>
        </div>
        <span class="text-gray-400">›</span>
      </button>

      <button
        @click="openFilePicker"
        :disabled="isImporting"
        class="flex w-full items-center justify-between rounded-[22px] px-4 py-4 text-left hover:bg-gray-50 disabled:opacity-50"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <ArrowUpTrayIcon class="h-5 w-5" />
          </div>
          <div>
            <p class="font-medium text-gray-900">Daten importieren</p>
            <p class="text-sm text-gray-500">Backup wiederherstellen</p>
          </div>
        </div>
        <span class="text-gray-400">›</span>
      </button>

      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="hidden"
        @change="handleFileChange"
      >
    </div>
  </section>
</template>
