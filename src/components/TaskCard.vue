<script setup lang="ts">
import { CheckIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/20/solid';
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline';
import { computed, ref } from 'vue';
import { CATEGORY_CLASSES, DEFAULT_CATEGORY_CLASS } from '../constants/maintenance';
import { formatDisplayDate } from '../utils/maintenanceDates';
import type { MaintenanceTask } from '../types/maintenance';
import type { EnrichedMaintenanceTask } from '../utils/maintenanceTasks';

const props = defineProps<{
  task: EnrichedMaintenanceTask;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'mark-checked', task: MaintenanceTask): void;
  (e: 'edit', task: MaintenanceTask): void;
  (e: 'delete', taskId: string): void;
}>();

const getCategoryClass = (category: string) => CATEGORY_CLASSES[category] || DEFAULT_CATEGORY_CLASS;

const getFrequencyLabel = (task: EnrichedMaintenanceTask) => {
  if (task.scheduleType !== 'recurring' || !task.frequency) return null;

  switch (task.frequency) {
    case 'daily':
      return 'Täglich';
    case 'weekly':
      return 'Wöchentlich';
    case 'monthly':
      return 'Monatlich';
    case 'quarterly':
      return 'Vierteljährlich';
    case 'biannual':
      return 'Halbjährlich';
    case 'annual':
      return 'Jährlich';
  }
};

const getButtonText = (task: EnrichedMaintenanceTask) => {
  switch (task.status) {
    case 'pending':
      return task.scheduleType === 'scheduled' ? 'Jetzt erledigen' : 'Zum ersten Mal erledigen';
    case 'planned':
      return 'Jetzt erledigen';
    case 'done':
      return 'Erledigt';
    case 'dueSoon':
      return 'Jetzt erledigen';
    case 'dueNow':
      return 'Jetzt erledigen';
    case 'overdue':
      return 'Jetzt erledigen';
  }
};

const getDeleteLabel = (task: EnrichedMaintenanceTask) => {
  return task.isCustom ? 'Löschen' : 'Archivieren';
};

const statusAccentClass = computed(() => {
  switch (props.task.status) {
    case 'overdue':
      return 'bg-red-500';
    case 'dueNow':
    case 'dueSoon':
      return 'bg-amber-400';
    case 'planned':
      return 'bg-blue-500';
    case 'done':
      return 'bg-emerald-500';
    case 'pending':
    default:
      return props.task.scheduleType === 'scheduled' ? 'bg-blue-500' : 'bg-slate-400';
  }
});

const isUrgentCard = computed(() => props.task.status === 'overdue');

const actionButtonClass = computed(() => {
  switch (props.task.status) {
    case 'overdue':
      return 'bg-white text-red-600 hover:bg-red-50';
    case 'dueNow':
    case 'dueSoon':
      return 'bg-orange-500 text-white hover:bg-orange-600';
    case 'planned':
      return 'bg-blue-600 text-white hover:bg-blue-700';
    case 'done':
      return 'bg-emerald-500 text-white hover:bg-emerald-600';
    case 'pending':
    default:
      return props.task.scheduleType === 'scheduled' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800';
  }
});

const showActions = ref(false);
const toggleActions = () => {
  showActions.value = !showActions.value;
};
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[28px] p-5 shadow-sm"
    :class="isUrgentCard ? 'border border-red-300 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white shadow-lg' : 'border border-gray-100 bg-white'"
  >
    <div
      v-if="!isUrgentCard"
      :class="['absolute inset-y-4 left-0 w-1.5 rounded-r-full', statusAccentClass]"
    ></div>

    <div :class="isUrgentCard ? '' : 'pl-4'">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <h3 :class="['text-xl font-semibold', isUrgentCard ? 'text-white' : 'text-gray-900']">{{ task.description }}</h3>

          <div class="mt-2 flex flex-wrap gap-2">
            <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="isUrgentCard ? 'bg-white/15 text-white' : getCategoryClass(task.category)">{{ task.category }}</span>
            <span v-if="task.scheduleType === 'scheduled'" :class="['rounded-full px-2.5 py-1 text-xs font-medium', isUrgentCard ? 'bg-white/15 text-white' : 'bg-blue-50 text-blue-700']">Terminiert</span>
            <template v-else>
              <span :class="['rounded-full px-2.5 py-1 text-xs font-medium', isUrgentCard ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700']">Regelmäßig</span>
              <span v-if="getFrequencyLabel(task)" :class="['rounded-full px-2.5 py-1 text-xs font-medium', isUrgentCard ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700']">{{ getFrequencyLabel(task) }}</span>
            </template>
            <span v-if="task.isCustom" :class="['rounded-full px-2.5 py-1 text-xs font-medium', isUrgentCard ? 'bg-white/15 text-white' : 'bg-indigo-100 text-indigo-700']">Benutzerdefiniert</span>
          </div>

          <p v-if="task.notes" :class="['mt-3 text-sm', isUrgentCard ? 'text-white/90' : 'text-gray-600']">{{ task.notes }}</p>

          <div :class="['mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm', isUrgentCard ? 'text-white/85' : 'text-gray-500']">
            <span>
              {{ task.scheduleType === 'scheduled' ? 'Termin' : 'Nächste Fälligkeit' }}:
              {{ formatDisplayDate(task.scheduleType === 'scheduled' ? task.dueDate ?? null : task.nextCheck) ?? 'Nicht geplant' }}
            </span>
            <span v-if="task.lastCheck">• Letzte Prüfung: {{ formatDisplayDate(task.lastCheck) }}</span>
          </div>
        </div>

        <button
          @click="toggleActions"
          :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', isUrgentCard ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600']"
          :disabled="isLoading"
        >
          <EllipsisVerticalIcon class="h-5 w-5" />
        </button>
      </div>

      <div v-if="showActions" class="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          @click="emit('edit', task); showActions = false"
          :class="['inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium', isUrgentCard ? 'border border-white/20 text-white hover:bg-white/10' : 'border border-gray-200 text-gray-700 hover:bg-gray-50']"
          :disabled="isLoading"
        >
          <PencilSquareIcon class="h-4 w-4" />
          Bearbeiten
        </button>

        <button
          @click="emit('delete', task.id); showActions = false"
          :class="['inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium', isUrgentCard ? 'border border-white/20 text-white hover:bg-white/10' : 'border border-red-200 text-red-600 hover:bg-red-50']"
          :disabled="isLoading"
        >
          <TrashIcon class="h-4 w-4" />
          {{ getDeleteLabel(task) }}
        </button>
      </div>

      <div class="mt-4 flex items-center gap-2">
        <button
          @click="emit('mark-checked', task)"
          :class="['inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition-colors', actionButtonClass]"
          :disabled="isLoading"
        >
          <CheckIcon class="h-4 w-4" />
          {{ getButtonText(task) }}
        </button>
      </div>
    </div>
  </div>
</template>
