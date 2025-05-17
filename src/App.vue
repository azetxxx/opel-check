<script setup lang="ts">
import { useMaintenanceData } from './composables/useMaintenanceData';
import { useMaintenanceLogs } from './composables/useMaintenanceLogs';
import { ClipboardDocumentListIcon, CheckIcon, ArrowPathIcon, ChevronDownIcon } from '@heroicons/vue/20/solid';
import LogModal from './components/LogModal.vue';
import type { MaintenanceTask, Frequency } from './types/maintenance';
import { ref, computed, watch, onErrorCaptured, onMounted, onUnmounted } from 'vue';

const { maintenanceTasks, updateTask, resetTasks } = useMaintenanceData();
const { addLog, isLoading, openLogModal } = useMaintenanceLogs();

// Add debug mode functionality
const showDebug = ref(false);

// Add keyboard shortcut for debug mode
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault();
    showDebug.value = !showDebug.value;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Add debug computed property
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
  currentSimulatedDate: simulatedDate.value
}));

// Add simulated date functionality
const simulatedDate = ref<string>(new Date().toISOString().split('T')[0]);
const useSimulatedDate = ref(false);

const getCurrentDate = (): Date => {
  if (useSimulatedDate.value && simulatedDate.value) {
    return new Date(simulatedDate.value);
  }
  return new Date();
};

const isOverdue = (task: MaintenanceTask): boolean => {
  if (!task.nextCheck) return false;
  return new Date(task.nextCheck) < getCurrentDate();
};

const getStatusText = (task: MaintenanceTask): string => {
  if (!task.lastCheck) return 'Ausstehend';
  if (isOverdue(task)) return 'Überfällig';
  return 'Aktuell';
};

// Add sorted tasks computed property
const sortedTasks = computed(() => {
  return [...maintenanceTasks.value].sort((a, b) => {
    // First priority: Tasks that are overdue
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Second priority: Tasks that have never been checked
    const aUnchecked = !a.lastCheck;
    const bUnchecked = !b.lastCheck;
    if (aUnchecked && !bUnchecked) return -1;
    if (!aUnchecked && bUnchecked) return 1;

    // Third priority: Sort by next check date
    if (a.nextCheck && b.nextCheck) {
      return new Date(a.nextCheck).getTime() - new Date(b.nextCheck).getTime();
    }

    // Keep original order for tasks without next check date
    return 0;
  });
});

// Add grouped tasks computed property
const groupedTasks = computed(() => {
  const groups: Record<Frequency, MaintenanceTask[]> = {
    daily: [],
    weekly: [],
    monthly: [],
    quarterly: [],
    biannual: [],
    annual: []
  };

  // Sort tasks within each frequency group by urgency
  sortedTasks.value.forEach(task => {
    groups[task.frequency].push(task);
  });

  return groups;
});

const getGroupStatus = (tasks: MaintenanceTask[]) => {
  const hasOverdue = tasks.some(task => isOverdue(task));
  const hasPending = tasks.some(task => !task.lastCheck);
  const allCurrent = tasks.every(task => task.lastCheck && !isOverdue(task));

  if (hasOverdue) return 'overdue';
  if (hasPending) return 'pending';
  if (allCurrent) return 'current';
  return 'pending';
};

// Add frequency order for display
const frequencyOrder: Frequency[] = ['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual'];

// Add collapsed state management
const collapsedGroups = ref<Record<Frequency, boolean>>({
  daily: false,
  weekly: false,
  monthly: false,
  quarterly: false,
  biannual: false,
  annual: false
});

// Initialize collapsed state based on group status
const initializeCollapsedState = () => {
  frequencyOrder.forEach(frequency => {
    if (groupedTasks.value[frequency].length > 0) {
      collapsedGroups.value[frequency] = getGroupStatus(groupedTasks.value[frequency]) === 'current';
    }
  });
};

// Watch for changes in grouped tasks and update collapsed state
watch(groupedTasks, () => {
  initializeCollapsedState();
}, { immediate: true });

const toggleGroup = (frequency: Frequency) => {
  collapsedGroups.value[frequency] = !collapsedGroups.value[frequency];
};

const formatFrequency = (frequency: Frequency): string => {
  const frequencyMap: Record<Frequency, string> = {
    daily: 'Täglich',
    weekly: 'Wöchentlich',
    monthly: 'Monatlich',
    quarterly: 'Vierteljährlich',
    biannual: 'Halbjährlich',
    annual: 'Jährlich'
  };
  return frequencyMap[frequency];
};

const getCategoryClass = (category: string): string => {
  const categoryClasses: Record<string, string> = {
    'Motor': 'bg-red-100 text-red-800',
    'Reifen': 'bg-blue-100 text-blue-800',
    'Bremsen': 'bg-yellow-100 text-yellow-800',
    'Karosserie': 'bg-purple-100 text-purple-800',
    'Beleuchtung': 'bg-green-100 text-green-800',
    'Elektrik': 'bg-orange-100 text-orange-800',
    'Dokumente': 'bg-slate-100 text-slate-800',
    'Service': 'bg-emerald-100 text-emerald-800',
    'Klimaanlage': 'bg-cyan-100 text-cyan-800'
  };
  return categoryClasses[category] || 'bg-gray-100 text-gray-800';
};

const markChecked = async (task: MaintenanceTask) => {
  const now = getCurrentDate();
  const nextCheck = new Date(now);

  // Calculate next check date based on frequency
  switch (task.frequency) {
    case 'daily':
      nextCheck.setDate(nextCheck.getDate() + 1);
      break;
    case 'weekly':
      nextCheck.setDate(nextCheck.getDate() + 7);
      break;
    case 'monthly':
      nextCheck.setMonth(nextCheck.getMonth() + 1);
      break;
    case 'quarterly':
      nextCheck.setMonth(nextCheck.getMonth() + 3);
      break;
    case 'biannual':
      nextCheck.setMonth(nextCheck.getMonth() + 6);
      break;
    case 'annual':
      nextCheck.setFullYear(nextCheck.getFullYear() + 1);
      break;
  }

  // Update task
  const updatedTask = {
    ...task,
    lastCheck: now.toISOString(),
    nextCheck: nextCheck.toISOString()
  };

  // Add log
  await addLog({
    taskId: task.id,
    taskDescription: task.description,
    category: task.category,
    frequency: task.frequency,
    checkedAt: now.toISOString(),
    nextDueDate: nextCheck.toISOString()
  });

  // Update task state
  updateTask(updatedTask);
};

// Add error boundary
onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', err);
  console.log('Component:', instance);
  console.log('Error Info:', info);
  return false;
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
    <!-- Header -->
    <header class="sticky top-0 bg-white shadow-md z-10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <!-- Debug Panel -->
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
            <pre class="whitespace-pre-wrap">{{ JSON.stringify(debug, null, 2) }}</pre>
          </div>
        </Transition>

        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Opel Wartungscheckliste
          </h1>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <p class="text-sm text-gray-600">Fahrzeugwartung im Überblick</p>
              <div class="flex items-center gap-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="useSimulatedDate" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span class="ms-3 text-sm font-medium text-gray-600">Datum simulieren</span>
                </label>
                <input
                  type="date"
                  v-model="simulatedDate"
                  :disabled="!useSimulatedDate"
                  class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                >
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="resetTasks"
                class="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg
                       hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all
                       duration-200 shadow-md hover:shadow-lg disabled:opacity-50 text-sm flex items-center gap-2"
                :disabled="isLoading"
              >
                <ArrowPathIcon class="h-4 w-4" />
                Zurücksetzen
              </button>
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
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="space-y-6">
        <template v-for="frequency in frequencyOrder" :key="frequency">
          <div v-if="groupedTasks[frequency].length > 0" class="bg-white rounded-xl shadow-sm overflow-hidden">
            <!-- Group Header -->
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

            <!-- Group Content -->
            <div
              v-show="!collapsedGroups[frequency]"
              class="border-t border-gray-100"
            >
              <div class="divide-y divide-gray-100">
                <div v-for="task in groupedTasks[frequency]" :key="task.id"
                     class="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div class="flex flex-col gap-3">
                    <!-- Task Header -->
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
                            'bg-red-500': isOverdue(task),
                            'bg-green-500': task.lastCheck && !isOverdue(task),
                            'bg-yellow-400': !task.lastCheck
                          }
                        ]"></div>
                        <span :class="[
                          'text-sm font-medium',
                          {
                            'text-red-600': isOverdue(task),
                            'text-green-600': task.lastCheck && !isOverdue(task),
                            'text-yellow-600': !task.lastCheck
                          }
                        ]">
                          {{ getStatusText(task) }}
                        </span>
                      </div>
                    </div>

                    <!-- Task Dates -->
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div class="text-gray-500 mb-1">Letzte Prüfung</div>
                        <div :class="{'text-gray-400': !task.lastCheck, 'text-gray-900': task.lastCheck}">
                          {{ task.lastCheck ? new Date(task.lastCheck).toLocaleDateString('de-DE') : 'Nie' }}
                        </div>
                      </div>
                      <div>
                        <div class="text-gray-500 mb-1">Nächste Prüfung</div>
                        <div :class="{'text-gray-400': !task.nextCheck, 'text-gray-900': task.nextCheck}">
                          {{ task.nextCheck ? new Date(task.nextCheck).toLocaleDateString('de-DE') : 'Nicht geplant' }}
                        </div>
                      </div>
                    </div>

                    <!-- Action Button -->
                    <button
                      @click="markChecked(task)"
                      :class="[
                        'w-full px-4 py-2 text-white rounded-lg transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2',
                        {
                          'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700': isOverdue(task),
                          'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700': task.lastCheck && !isOverdue(task),
                          'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600': !task.lastCheck
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

<style>
:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --danger-color: #dc2626;
  --danger-hover: #b91c1c;
  --success-color: #059669;
  --background-color: #f3f4f6;
  --surface-color: #ffffff;
  --text-color: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --modal-overlay: rgba(0, 0, 0, 0.5);
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.categories {
  display: grid;
  gap: 1.5rem;
}

.category {
  background: var(--surface-color);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.category-header {
  background: var(--background-color);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.category-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
}

.task-table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-bottom: 2px solid var(--border-color);
  font-weight: 600;
  color: var(--text-secondary);
}

.task-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.task-row:last-child {
  border-bottom: none;
}

.task-description {
  font-size: 0.95rem;
}

.task-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.task-date.no-date {
  color: var(--text-secondary);
  font-style: italic;
}

.task-date.overdue {
  color: var(--danger-color);
  font-weight: 600;
}

.check-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  width: fit-content;
}

.check-button:hover {
  background-color: var(--primary-hover);
}

.check-button.checked {
  background-color: var(--success-color);
}

.task-overdue {
  background-color: #fee2e2;
}

.task-overdue .check-button {
  background-color: var(--danger-color);
}

.view-logs-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-logs-button:hover {
  background-color: var(--primary-hover);
}

.daily-tasks-header {
  padding: 1rem;
  background-color: #f8fafc;
  border-bottom: 2px solid var(--border-color);
  font-weight: 600;
  color: var(--text-secondary);
}

.daily-task-row {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.daily-task-row:last-child {
  border-bottom: none;
}

.daily-task-description {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--text-color);
}

.check-icon {
  color: var(--success-color);
  font-weight: bold;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .task-table-header {
    display: none;
  }

  .task-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }

  .task-description {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .task-date {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
  }

  .task-date::before {
    content: attr(data-label);
    font-weight: 500;
  }

  .check-button {
    width: 100%;
    margin-top: 0.5rem;
  }

  header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .view-logs-button {
    width: 100%;
  }

  .daily-task-description {
    padding: 0.25rem 0;
  }
}
</style>
