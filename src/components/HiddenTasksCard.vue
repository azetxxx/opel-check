<script setup lang="ts">
import type { MaintenanceTask } from '../types/maintenance';

defineProps<{
  tasks: MaintenanceTask[];
}>();

const emit = defineEmits<{
  (e: 'toggle', taskId: string, enabled: boolean): void;
}>();
</script>

<template>
  <section class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6 space-y-4">
    <div>
      <p class="mt-1 text-sm text-gray-600">Hardcoded Aufgaben ein- oder ausblenden.</p>
    </div>

    <div v-if="tasks.length > 0" class="space-y-2">
      <div v-for="task in tasks" :key="task.id" class="flex items-center justify-between gap-3 rounded-[18px] px-3 py-3 hover:bg-gray-50">
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 leading-5 break-words">{{ task.description }}</p>
        </div>
        <label class="relative inline-flex shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            :checked="!task.isArchived"
            @change="emit('toggle', task.id, ($event.target as HTMLInputElement).checked)"
            class="peer sr-only"
          >
          <span class="h-7 w-12 rounded-full bg-gray-300 transition-colors peer-checked:bg-orange-500"></span>
          <span class="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span>
        </label>
      </div>
    </div>

    <div v-else class="rounded-[28px] border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
      Keine vordefinierten Aufgaben vorhanden.
    </div>
  </section>
</template>
