<script setup lang="ts">
import { useMaintenanceData } from './composables/useMaintenanceData';
import { useMaintenanceLogs } from './composables/useMaintenanceLogs';
import { ClipboardDocumentListIcon, CheckIcon } from '@heroicons/vue/20/solid';
import LogModal from './components/LogModal.vue';
import type { MaintenanceTask, Frequency } from './types/maintenance';

const { maintenanceTasks, updateTask } = useMaintenanceData();
const { addLog, isLoading, openLogModal } = useMaintenanceLogs();

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

const isOverdue = (task: MaintenanceTask): boolean => {
  if (!task.nextCheck) return false;
  return new Date(task.nextCheck) < new Date();
};

const getStatusText = (task: MaintenanceTask): string => {
  if (!task.lastCheck) return 'Ausstehend';
  if (isOverdue(task)) return 'Überfällig';
  return 'Aktuell';
};

const markChecked = async (task: MaintenanceTask) => {
  const now = new Date();
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
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
    <!-- Header -->
    <header class="sticky top-0 bg-white shadow-md z-10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Opel Wartungscheckliste
          </h1>
          <div class="flex justify-between items-center">
            <p class="text-sm text-gray-600">Fahrzeugwartung im Überblick</p>
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
    </header>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="space-y-4">
        <div v-for="task in maintenanceTasks" :key="task.id"
             class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                  <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {{ formatFrequency(task.frequency) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center">
                <div :class="[
                  'h-2.5 w-2.5 rounded-full mr-2',
                  isOverdue(task) ? 'bg-red-400' : (task.lastCheck ? 'bg-green-400' : 'bg-gray-300')
                ]"></div>
                <span class="text-sm text-gray-500">
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
              class="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg
                     hover:from-emerald-600 hover:to-green-600 transform hover:scale-105
                     transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50
                     text-sm font-medium flex items-center justify-center gap-2"
              :disabled="isLoading"
            >
              <CheckIcon class="h-4 w-4" />
              Als erledigt markieren
            </button>
          </div>
        </div>
      </div>
    </div>

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
