<script setup lang="ts">
import { CheckIcon } from '@heroicons/vue/20/solid';
import { CATEGORY_CLASSES, DEFAULT_CATEGORY_CLASS } from '../constants/maintenance';
import { formatDisplayDate } from '../utils/maintenanceDates';
import type { MaintenanceTask } from '../types/maintenance';
import type { EnrichedMaintenanceTask } from '../utils/maintenanceTasks';

defineProps<{
  task: EnrichedMaintenanceTask;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'mark-checked', task: MaintenanceTask): void;
}>();

const getCategoryClass = (category: string) => CATEGORY_CLASSES[category] || DEFAULT_CATEGORY_CLASS;
const getStatusText = (status: EnrichedMaintenanceTask['status']) => {
  if (status === 'overdue') return 'Überfällig';
  if (status === 'current') return 'Aktuell';
  return 'Ausstehend';
};
</script>

<template>
  <div class="p-4 hover:bg-gray-50 transition-colors duration-200">
    <div class="flex flex-col gap-3">
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">{{ task.description }}</h3>
          <div class="mt-1 flex flex-wrap gap-2">
            <span class="px-2 py-1 text-xs rounded-full" :class="getCategoryClass(task.category)">
              {{ task.category }}
            </span>
          </div>
        </div>
        <div class="flex items-center">
          <div :class="[
            'h-3 w-3 rounded-full mr-2',
            {
              'bg-red-500': task.status === 'overdue',
              'bg-green-500': task.status === 'current',
              'bg-yellow-400': task.status === 'pending'
            }
          ]"></div>
          <span :class="[
            'text-sm font-medium',
            {
              'text-red-600': task.status === 'overdue',
              'text-green-600': task.status === 'current',
              'text-yellow-600': task.status === 'pending'
            }
          ]">
            {{ getStatusText(task.status) }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div class="text-gray-500 mb-1">Letzte Prüfung</div>
          <div :class="{'text-gray-400': !task.lastCheck, 'text-gray-900': task.lastCheck}">
            {{ formatDisplayDate(task.lastCheck) ?? 'Nie' }}
          </div>
        </div>
        <div>
          <div class="text-gray-500 mb-1">Nächste Prüfung</div>
          <div :class="{'text-gray-400': !task.nextCheck, 'text-gray-900': task.nextCheck}">
            {{ formatDisplayDate(task.nextCheck) ?? 'Nicht geplant' }}
          </div>
        </div>
      </div>

      <button
        @click="emit('mark-checked', task)"
        :class="[
          'w-full px-4 py-2 text-white rounded-lg transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2',
          {
            'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700': task.status === 'overdue',
            'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700': task.status === 'current',
            'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600': task.status === 'pending'
          }
        ]"
        :disabled="isLoading"
      >
        <CheckIcon class="h-4 w-4" />
        Als erledigt markieren
      </button>
    </div>
  </div>
</template>
