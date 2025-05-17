<template>
  <Teleport to="body">
    <div v-if="isLogModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Wartungsprotokoll</h2>
          <button @click="closeLogModal" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="isLoading" class="flex-1 flex items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <div v-else class="flex-1 overflow-auto">
          <div v-if="logs.length === 0" class="text-center text-gray-500 py-8">
            Keine Wartungsprotokolle vorhanden
          </div>
          <div v-else class="space-y-4">
            <div v-for="log in logs" :key="log.checkedAt" class="border rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold">{{ log.taskDescription }}</h3>
                  <p class="text-sm text-gray-600">Kategorie: {{ log.category }}</p>
                  <p class="text-sm text-gray-600">Häufigkeit: {{ formatFrequency(log.frequency) }}</p>
                </div>
                <div class="text-right text-sm">
                  <p>Geprüft am: {{ formatDate(log.checkedAt) }}</p>
                  <p>Nächste Prüfung: {{ formatDate(log.nextDueDate) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-end space-x-2">
          <button
            @click="clearLogs"
            class="px-4 py-2 text-red-600 hover:text-red-800 disabled:opacity-50"
            :disabled="isLoading"
          >
            Protokolle löschen
          </button>
          <button
            @click="closeLogModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            :disabled="isLoading"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useMaintenanceLogs } from '../composables/useMaintenanceLogs';
import type { Frequency } from '../types/maintenance';

const { logs, isLogModalOpen, isLoading, clearLogs, closeLogModal } = useMaintenanceLogs();

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
