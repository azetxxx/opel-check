<script setup lang="ts">
import { useMaintenanceData } from './composables/useMaintenanceData';
import { useMaintenanceLogs } from './composables/useMaintenanceLogs';
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
    'Beleuchtung': 'bg-green-100 text-green-800'
  };
  return categoryClasses[category] || 'bg-gray-100 text-gray-800';
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
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div class="p-8">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Opel Wartungscheckliste
              </h1>
              <p class="text-gray-600 mt-2">Behalten Sie Ihre Fahrzeugwartung im Überblick</p>
            </div>
            <button
              @click="openLogModal"
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl
                     hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all
                     duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              :disabled="isLoading"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
              </svg>
              Protokolle anzeigen
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr class="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aufgabe</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategorie</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Häufigkeit</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Letzte Prüfung</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nächste Prüfung</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktion</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="task in maintenanceTasks" :key="task.id"
                    class="hover:bg-blue-50 transition-colors duration-150">
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ task.description }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 text-sm rounded-full"
                          :class="getCategoryClass(task.category)">
                      {{ task.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600">{{ formatFrequency(task.frequency) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm" :class="{'text-gray-400': !task.lastCheck, 'text-gray-900': task.lastCheck}">
                      {{ task.lastCheck ? new Date(task.lastCheck).toLocaleDateString('de-DE') : 'Nie' }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm" :class="{'text-gray-400': !task.nextCheck, 'text-gray-900': task.nextCheck}">
                      {{ task.nextCheck ? new Date(task.nextCheck).toLocaleDateString('de-DE') : 'Nicht geplant' }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <button
                      @click="markChecked(task)"
                      class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg
                             hover:from-emerald-600 hover:to-green-600 transform hover:scale-105
                             transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50
                             text-sm font-medium"
                      :disabled="isLoading"
                    >
                      Erledigt
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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
