<script setup lang="ts">
import { ArrowPathIcon } from '@heroicons/vue/24/outline';
import type { MaintenanceTask } from '../types/maintenance';

defineProps<{
  tasks: MaintenanceTask[];
}>();

const emit = defineEmits<{
  (e: 'restore', taskId: string): void;
}>();
</script>

<template>
  <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-4">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">Ausgeblendete Aufgaben</h3>
      <p class="text-sm text-gray-600 mt-1">Blende ausgeblendete Wartungsaufgaben wieder ein.</p>
    </div>

    <div v-if="tasks.length > 0" class="space-y-3">
      <div v-for="task in tasks" :key="task.id" class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-medium text-gray-900">{{ task.description }}</p>
          <p class="mt-1 text-sm text-gray-600">{{ task.category }} · {{ task.scheduleType === 'scheduled' ? 'Geplant' : 'Wiederholend' }}</p>
        </div>
        <button
          @click="emit('restore', task.id)"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
        >
          <ArrowPathIcon class="h-4 w-4" />
          Wiederherstellen
        </button>
      </div>
    </div>

    <div v-else class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
      Aktuell sind keine Aufgaben ausgeblendet.
    </div>
  </section>
</template>
