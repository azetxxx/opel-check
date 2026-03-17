<script setup lang="ts">
import { ClipboardDocumentListIcon } from '@heroicons/vue/20/solid';
import DebugPanel from './DebugPanel.vue';

interface DebugData {
  [key: string]: unknown;
}

defineProps<{
  showDebug: boolean;
  simulatedDate: string;
  useSimulatedDate: boolean;
  isLoading: boolean;
  debug: DebugData;
}>();

const emit = defineEmits<{
  (e: 'close-debug'): void;
  (e: 'update:simulatedDate', value: string): void;
  (e: 'update:useSimulatedDate', value: boolean): void;
  (e: 'reset'): void;
  (e: 'open-logs'): void;
}>();
</script>

<template>
  <header class="sticky top-0 bg-white shadow-md z-10">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <DebugPanel
        :visible="showDebug"
        :simulated-date="simulatedDate"
        :use-simulated-date="useSimulatedDate"
        :is-loading="isLoading"
        :debug="debug"
        @close="emit('close-debug')"
        @update:simulated-date="emit('update:simulatedDate', $event)"
        @update:use-simulated-date="emit('update:useSimulatedDate', $event)"
        @reset="emit('reset')"
      />

      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Opel Wartungscheckliste
        </h1>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-4">
            <p class="text-sm text-gray-600">Fahrzeugwartung im Überblick</p>
            <div class="flex gap-2">
              <button
                @click="emit('open-logs')"
                class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg
                       hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all
                       duration-200 shadow-md hover:shadow-lg disabled:opacity-50 text-sm flex items-center gap-2"
                :disabled="isLoading"
              >
                <ClipboardDocumentListIcon class="h-4 w-4" />
                Protokolle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
