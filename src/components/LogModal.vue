<template>
  <Teleport to="body">
    <div v-if="isLogModalOpen" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Wartungsprotokoll
            </h2>
            <p class="text-gray-600 text-sm mt-1">Übersicht aller durchgeführten Wartungen</p>
          </div>
          <button @click="closeLogModal" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="isLoading" class="flex-1 flex items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600"></div>
        </div>

        <div v-else class="flex-1 overflow-auto">
          <div v-if="logs.length === 0" class="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Keine Wartungsprotokolle vorhanden
          </div>
          <div v-else class="space-y-4">
            <div v-for="log in logs" :key="log.checkedAt" class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ log.taskDescription }}</h3>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span class="px-3 py-1 text-sm rounded-full" :class="getCategoryClass(log.category)">
                      {{ log.category }}
                    </span>
                    <span class="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                      {{ formatFrequency(log.frequency) }}
                    </span>
                  </div>
                </div>
                <div class="text-right text-sm space-y-1">
                  <div class="flex items-center gap-2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Geprüft am: {{ formatDate(log.checkedAt) }}
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Nächste Prüfung: {{ formatDate(log.nextDueDate) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="clearLogs"
            class="px-4 py-2 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
            :disabled="isLoading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Protokolle löschen
          </button>
          <button
            @click="closeLogModal"
            class="px-6 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 font-medium flex items-center gap-2"
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
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
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
    'Beleuchtung': 'bg-green-100 text-green-800'
  };
  return categoryClasses[category] || 'bg-gray-100 text-gray-800';
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
