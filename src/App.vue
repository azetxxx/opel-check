<script setup lang="ts">
import { useMaintenanceData } from './composables/useMaintenanceData';
import { useMaintenanceLogs } from './composables/useMaintenanceLogs';
import LogModal from './components/LogModal.vue';
import type { MaintenanceTask } from './types/maintenance';

const { maintenanceSchedule, markTaskChecked } = useMaintenanceData();
const { logs, isLogModalOpen, openLogModal, closeLogModal, addLog, clearLogs } = useMaintenanceLogs();

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('de-DE');
};

const isOverdue = (task: MaintenanceTask): boolean => {
  if (!task.nextDueDate) return false;
  const today = new Date();
  const dueDate = new Date(task.nextDueDate);
  return today > dueDate;
};

const handleTaskCheck = (task: MaintenanceTask, categoryTitle: string) => {
  markTaskChecked(task.id);
  addLog({
    taskId: task.id,
    taskDescription: task.description,
    category: categoryTitle,
    frequency: task.frequency,
    checkedAt: new Date().toISOString(),
    nextDueDate: task.nextDueDate || ''
  });
};
</script>

<template>
  <div class="container">
    <header>
      <h1>Auto Wartungs-Checkliste</h1>
      <button class="view-logs-button" @click="openLogModal">
        Wartungsprotokolle anzeigen
      </button>
    </header>

    <main>
      <div class="categories">
        <div v-for="category in maintenanceSchedule"
             :key="category.title"
             class="category">
          <div class="category-header">
            <h2>{{ category.title }}</h2>
          </div>

          <div class="task-table">
            <template v-if="category.frequency === 'daily'">
              <div class="daily-tasks-header">
                <div class="task-description-header">Tägliche Sichtprüfung</div>
              </div>
              <div v-for="task in category.tasks"
                   :key="task.id"
                   class="daily-task-row">
                <div class="daily-task-description">
                  <span class="check-icon">✓</span>
                  {{ task.description }}
                </div>
              </div>
            </template>
            <template v-else>
              <div class="task-table-header">
                <div class="task-description-header">Wartungsaufgabe</div>
                <div class="task-date-header">Letzte Prüfung</div>
                <div class="task-date-header">Nächste Prüfung</div>
                <div class="task-action-header">Aktion</div>
              </div>
              <div v-for="task in category.tasks"
                   :key="task.id"
                   class="task-row"
                   :class="{ 'task-overdue': isOverdue(task) }">
                <div class="task-description">
                  {{ task.description }}
                </div>
                <div class="task-date" :class="{ 'no-date': !task.lastChecked }" data-label="Letzte Prüfung:">
                  {{ formatDate(task.lastChecked) }}
                </div>
                <div class="task-date" :class="{ 'no-date': !task.nextDueDate, 'overdue': isOverdue(task) }" data-label="Nächste Prüfung:">
                  {{ formatDate(task.nextDueDate) }}
                </div>
                <div class="task-action">
                  <button @click="handleTaskCheck(task, category.title)"
                          class="check-button"
                          :class="{ 'checked': task.lastChecked }">
                    {{ task.lastChecked ? 'Erneut prüfen' : 'Als geprüft markieren' }}
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </main>

    <LogModal
      :is-open="isLogModalOpen"
      :logs="logs"
      @close="closeLogModal"
      @clear="clearLogs"
    />
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
