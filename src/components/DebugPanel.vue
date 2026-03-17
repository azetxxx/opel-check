<script setup lang="ts">
import { ArrowPathIcon } from '@heroicons/vue/20/solid';

interface DebugData {
  [key: string]: unknown;
}

defineProps<{
  visible: boolean;
  simulatedDate: string;
  useSimulatedDate: boolean;
  isLoading: boolean;
  debug: DebugData;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:simulatedDate', value: string): void;
  (e: 'update:useSimulatedDate', value: boolean): void;
  (e: 'reset'): void;
}>();
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform -translate-y-4 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-4 opacity-0"
  >
    <div v-if="visible" class="mb-4 p-4 bg-gray-800 text-gray-200 rounded-lg shadow text-sm font-mono overflow-auto">
      <div class="flex justify-between items-center mb-2">
        <span class="text-xs text-gray-400">Debug Info (Ctrl/Cmd + D to toggle)</span>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-200 transition-colors"
        >
          ESC
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4 p-2 bg-gray-700 rounded">
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="useSimulatedDate"
              @change="emit('update:useSimulatedDate', ($event.target as HTMLInputElement).checked)"
              class="sr-only peer"
            >
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span class="ms-3 text-sm font-medium text-gray-200">Datum simulieren</span>
          </label>
          <input
            type="date"
            :value="simulatedDate"
            @input="emit('update:simulatedDate', ($event.target as HTMLInputElement).value)"
            :disabled="!useSimulatedDate"
            class="px-3 py-1.5 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg text-sm disabled:opacity-50"
          >
        </div>
        <div class="flex items-center gap-4 p-2 bg-gray-700 rounded">
          <button
            @click="emit('reset')"
            class="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg
                   hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all
                   duration-200 shadow-sm hover:shadow disabled:opacity-50 text-sm flex items-center gap-2"
            :disabled="isLoading"
          >
            <ArrowPathIcon class="h-4 w-4" />
            Zurücksetzen
          </button>
        </div>
        <pre class="whitespace-pre-wrap">{{ JSON.stringify(debug, null, 2) }}</pre>
      </div>
    </div>
  </Transition>
</template>
