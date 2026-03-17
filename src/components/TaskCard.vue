<script setup lang="ts">
import { CheckIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/20/solid';
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
  (e: 'edit', task: MaintenanceTask): void;
  (e: 'delete', taskId: string): void;
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
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="font-medium text-gray-900">{{ task.description }}</h3>
            <span v-if="task.isCustom" class="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
              Benutzerdefiniert
            </span>
          </div>
          <div class="mt-1 flex flex-wrap gap-2">
            <span class="px-2 py-1 text-xs rounded-full" :class="getCategoryClass(task.category)">
              {{ task.category }}
            </span>
            <span v-if="task.notes" class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
              Notiz vorhanden
            </span>
            <span v-if="task.dueMileage" class="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
              {{ task.dueMileage.toLocaleString('de-DE') }} km
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

      <div v-if="task.notes || task.lastMileage" class="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
        <div v-if="task.notes">{{ task.notes }}</div>
        <div v-if="task.lastMileage != null" class="mt-1">Letzter km-Stand: {{ task.lastMileage.toLocaleString('de-DE') }} km</div>
      </div>

      <div class="flex flex-col sm:flex-row gap-2">
        <button
          @click="emit('mark-checked', task)"
          :class="[
            'flex-1 px-4 py-2 text-white rounded-lg transform hover:scale-[1.01] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2',
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

        <button
          @click="emit('edit', task)"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          :disabled="isLoading"
        >
          <PencilSquareIcon class="h-4 w-4" />
          Bearbeiten
        </button>

        <button
          v-if="task.isCustom"
          @click="emit('delete', task.id)"
          class="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          :disabled="isLoading"
        >
          <TrashIcon class="h-4 w-4" />
          Löschen
        </button>
      </div>
    </div>
  </div>
</template>
