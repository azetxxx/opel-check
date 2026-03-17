<script setup lang="ts">
import { ClipboardDocumentListIcon, CheckIcon, ArrowPathIcon, ChevronDownIcon } from '@heroicons/vue/20/solid';
import { computed, onErrorCaptured, onMounted, onUnmounted, ref, watch } from 'vue';
import LogModal from './components/LogModal.vue';
import {
  CATEGORY_CLASSES,
  DEFAULT_CATEGORY_CLASS,
  FREQUENCY_LABELS,
  FREQUENCY_ORDER
} from './constants/maintenance';
import { useMaintenanceData } from './composables/useMaintenanceData';
import { useMaintenanceLogs } from './composables/useMaintenanceLogs';
import type { Frequency, MaintenanceTask } from './types/maintenance';
import {
  formatDisplayDate,
  getCurrentDate,
  getNextCheckDate,
  toDateInputValue
} from './utils/maintenanceDates';
import {
  buildDefaultCollapsedGroups,
  enrichTasks,
  getAutoCollapsedGroups,
  getGroupStatus,
  groupTasksByFrequency,
  type EnrichedMaintenanceTask
} from './utils/maintenanceTasks';

const { maintenanceTasks, updateTask, resetTasks } = useMaintenanceData();
const { addLog, isLoading, openLogModal } = useMaintenanceLogs();

const showDebug = ref(false);
const simulatedDate = ref<string>(toDateInputValue(new Date()));
const useSimulatedDate = ref(false);
const collapsedGroups = ref<Record<Frequency, boolean>>(buildDefaultCollapsedGroups());

const currentDate = computed(() => getCurrentDate(simulatedDate.value, useSimulatedDate.value));
const enrichedTasks = computed(() => enrichTasks(maintenanceTasks.value, currentDate.value));
const groupedTasks = computed(() => groupTasksByFrequency(enrichedTasks.value));

const debug = computed(() => ({
  tasksLoaded: maintenanceTasks.value.length,
  groupedTasksCount: Object.values(groupedTasks.value).reduce((acc, tasks) => acc + tasks.length, 0),
  groups: Object.fromEntries(
    Object.entries(groupedTasks.value).map(([key, tasks]) => [key, tasks.length])
  ),
  rawTasks: maintenanceTasks.value,
  rawGroupedTasks: groupedTasks.value,
  collapsedState: collapsedGroups.value,
  simulatedDateEnabled: useSimulatedDate.value,
  currentSimulatedDate: simulatedDate.value,
  currentDate: currentDate.value.toISOString()
}));

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault();
    showDebug.value = !showDebug.value;
  }
};

watch(
  groupedTasks,
  (groups) => {
    collapsedGroups.value = getAutoCollapsedGroups(groups);
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const toggleGroup = (frequency: Frequency) => {
  collapsedGroups.value[frequency] = !collapsedGroups.value[frequency];
};

const formatFrequency = (frequency: Frequency) => FREQUENCY_LABELS[frequency];
const getCategoryClass = (category: string) => CATEGORY_CLASSES[category] || DEFAULT_CATEGORY_CLASS;
const getStatusText = (task: EnrichedMaintenanceTask) => {
  if (task.status === 'overdue') return 'Überfällig';
  if (task.status === 'current') return 'Aktuell';
  return 'Ausstehend';
};

const markChecked = async (task: MaintenanceTask) => {
  const now = currentDate.value;
  const nextCheck = getNextCheckDate(task.frequency, now);

  const updatedTask = {
    ...task,
    lastCheck: now.toISOString(),
    nextCheck: nextCheck.toISOString()
  };

  await addLog({
    taskId: task.id,
    taskDescription: task.description,
    category: task.category,
    frequency: task.frequency,
    checkedAt: now.toISOString(),
    nextDueDate: nextCheck.toISOString()
  });

  updateTask(updatedTask);
};

onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', err);
  console.log('Component:', instance);
  console.log('Error Info:', info);
  return false;
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
    <header class="sticky top-0 bg-white shadow-md z-10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-4 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-4 opacity-0"
        >
          <div v-if="showDebug" class="mb-4 p-4 bg-gray-800 text-gray-200 rounded-lg shadow text-sm font-mono overflow-auto">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs text-gray-400">Debug Info (Ctrl/Cmd + D to toggle)</span>
              <button
                @click="showDebug = false"
                class="text-gray-400 hover:text-gray-200 transition-colors"
              >
                ESC
              </button>
            </div>
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-4 p-2 bg-gray-700 rounded">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="useSimulatedDate" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span class="ms-3 text-sm font-medium text-gray-200">Datum simulieren</span>
                </label>
                <input
                  type="date"
                  v-model="simulatedDate"
                  :disabled="!useSimulatedDate"
                  class="px-3 py-1.5 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg text-sm disabled:opacity-50"
                >
              </div>
              <div class="flex items-center gap-4 p-2 bg-gray-700 rounded">
                <button
                  @click="resetTasks"
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

        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Opel Wartungscheckliste
          </h1>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <p class="text-sm text-gray-600">Fahrzeugwartung im Überblick</p>
              <div class="flex gap-2">
                <button
                  @click="openLogModal"
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

    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="space-y-6">
        <template v-for="frequency in FREQUENCY_ORDER" :key="frequency">
          <div v-if="groupedTasks[frequency].length > 0" class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div
              @click="toggleGroup(frequency)"
              class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            >
              <div class="flex items-center gap-3">
                <div :class="[
                  'h-3 w-3 rounded-full',
                  {
                    'bg-red-500': getGroupStatus(groupedTasks[frequency]) === 'overdue',
                    'bg-green-500': getGroupStatus(groupedTasks[frequency]) === 'current',
                    'bg-yellow-400': getGroupStatus(groupedTasks[frequency]) === 'pending'
                  }
                ]"></div>
                <h2 class="text-lg font-semibold">{{ formatFrequency(frequency) }}</h2>
              </div>
              <ChevronDownIcon
                class="h-5 w-5 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': !collapsedGroups[frequency] }"
              />
            </div>

            <div
              v-show="!collapsedGroups[frequency]"
              class="border-t border-gray-100"
            >
              <div class="divide-y divide-gray-100">
                <div v-for="task in groupedTasks[frequency]" :key="task.id"
                     class="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-start gap-4">
                      <div class="flex-1">
                        <h3 class="font-medium text-gray-900">{{ task.description }}</h3>
                        <div class="mt-1 flex flex-wrap gap-2">
                          <span class="px-2 py-1 text-xs rounded-full"
                                :class="getCategoryClass(task.category)">
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
                          {{ getStatusText(task) }}
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
                      @click="markChecked(task)"
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
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <LogModal />
  </div>
</template>
