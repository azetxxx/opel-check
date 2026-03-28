<script setup lang="ts">
import { ArrowPathIcon } from '@heroicons/vue/24/outline';
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
      <h3 class="text-lg font-semibold text-gray-900">Vordefinierte Aufgaben</h3>
      <p class="mt-1 text-sm text-gray-600">Hardcoded Aufgaben ein- oder ausblenden.</p>
    </div>

    <div v-if="tasks.length > 0" class="space-y-3">
      <div v-for="task in tasks" :key="task.id" class="flex flex-col gap-3 rounded-[22px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
            <ArrowPathIcon class="h-5 w-5" />
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ task.description }}</p>
            <p class="mt-1 text-sm text-gray-500">{{ task.category }} · {{ task.scheduleType === 'scheduled' ? 'Geplant' : 'Wiederholend' }}</p>
          </div>
        </div>
        <label class="relative inline-flex cursor-pointer items-center">
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

    <div v-else class="rounded-[22px] border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
      Keine vordefinierten Aufgaben vorhanden.
    </div>
  </section>
</template>
