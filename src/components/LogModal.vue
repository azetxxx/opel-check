<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Wartungsprotokolle</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <div class="log-controls">
          <button class="clear-button" @click="clearLogs">
            Protokolle löschen
          </button>
        </div>

        <div class="logs-container">
          <div v-if="logs.length === 0" class="no-logs">
            Keine Wartungsprotokolle vorhanden.
          </div>
          <div v-else class="log-entries">
            <div v-for="log in logs" :key="log.checkedAt + log.taskId" class="log-entry">
              <div class="log-header">
                <span class="log-category">{{ log.category }}</span>
                <span class="log-date">{{ formatDate(log.checkedAt) }}</span>
              </div>
              <div class="log-description">
                {{ log.taskDescription }}
              </div>
              <div class="log-footer">
                <span class="log-next-due">Nächste Prüfung: {{ formatDate(log.nextDueDate) }}</span>
                <span class="log-frequency">{{ formatFrequency(log.frequency) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MaintenanceLog, Frequency } from '../types/maintenance';

interface Props {
  isOpen: boolean;
  logs: MaintenanceLog[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'clear'): void;
}>();

const closeModal = () => {
  emit('close');
};

const clearLogs = () => {
  emit('clear');
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('de-DE');
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
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--modal-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--surface-color);
  border-radius: 0.5rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
}

.log-controls {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
}

.clear-button {
  padding: 0.5rem 1rem;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: var(--danger-hover);
}

.logs-container {
  max-height: 60vh;
  overflow-y: auto;
}

.no-logs {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-entry {
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 1rem;
}

.log-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.log-category {
  font-weight: 600;
  color: var(--primary-color);
}

.log-date {
  color: var(--text-secondary);
}

.log-description {
  margin-bottom: 0.5rem;
}

.log-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .log-footer {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
