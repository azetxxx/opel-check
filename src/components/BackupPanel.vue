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
  <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div class="mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Backup</h2>
      <p class="text-sm text-gray-600 mt-1">
        Exportiere oder importiere Fahrzeuge, Aufgaben und Protokolle als JSON-Datei.
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <button
        @click="emit('export')"
        class="min-h-11 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-black transition-all duration-200 shadow-sm hover:shadow text-sm font-medium flex items-center justify-center gap-2"
      >
        <ArrowDownTrayIcon class="h-4 w-4" />
        Backup exportieren
      </button>

      <button
        @click="openFilePicker"
        :disabled="isImporting"
        class="min-h-11 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <ArrowUpTrayIcon class="h-4 w-4" />
        Backup importieren
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
