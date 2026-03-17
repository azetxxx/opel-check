<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/20/solid';
import { FREQUENCY_LABELS } from '../constants/maintenance';
import type { Frequency, MaintenanceTask } from '../types/maintenance';
import { getGroupStatus, type EnrichedMaintenanceTask } from '../utils/maintenanceTasks';
import TaskCard from './TaskCard.vue';

const props = defineProps<{
  frequency: Frequency;
  tasks: EnrichedMaintenanceTask[];
  collapsed: boolean;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle', frequency: Frequency): void;
  (e: 'mark-checked', task: MaintenanceTask): void;
  (e: 'edit', task: MaintenanceTask): void;
  (e: 'delete', taskId: string): void;
}>();

const groupStatus = () => getGroupStatus(props.tasks);
</script>

<template>
  <div v-if="tasks.length > 0" class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div
      @click="emit('toggle', frequency)"
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
    >
      <div class="flex items-center gap-3">
        <div :class="[
          'h-3 w-3 rounded-full',
          {
            'bg-red-500': groupStatus() === 'overdue',
            'bg-green-500': groupStatus() === 'current',
            'bg-yellow-400': groupStatus() === 'pending'
          }
        ]"></div>
        <h2 class="text-lg font-semibold">{{ FREQUENCY_LABELS[frequency] }}</h2>
      </div>
      <ChevronDownIcon
        class="h-5 w-5 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': !collapsed }"
      />
    </div>

    <div v-show="!collapsed" class="border-t border-gray-100">
      <div class="divide-y divide-gray-100">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :is-loading="isLoading"
          @mark-checked="emit('mark-checked', $event)"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>
