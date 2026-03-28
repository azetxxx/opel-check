<script setup lang="ts">
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
        <div class="flex justify-end">
          <button
            @click="emit('reset')"
            class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
