<template>
  <Teleport to="body">
    <div v-if="isLogModalOpen"
         class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
        <div class="sticky top-0 flex justify-between items-center gap-3 border-b border-gray-100 bg-white px-5 py-4 rounded-t-2xl sm:px-6">
          <div>
            <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Wartungsprotokoll
            </h2>
            <p class="text-gray-600 text-sm mt-1">Übersicht aller durchgeführten Wartungen</p>
          </div>
          <button @click="closeLogModal" class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-200">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div v-if="isLoading" class="flex-1 flex items-center justify-center px-5 py-5 sm:px-6">
          <div class="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600"></div>
        </div>

        <div v-else class="flex-1 overflow-auto px-5 py-5 sm:px-6">
          <div v-if="logs.length === 0" class="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <ClipboardDocumentListIcon class="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>Keine Wartungsprotokolle vorhanden</p>
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
                    <CalendarIcon class="h-4 w-4" />
                    Geprüft am: {{ formatDate(log.checkedAt) }}
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <ClockIcon class="h-4 w-4" />
                    Nächste Prüfung: {{ formatDate(log.nextDueDate) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-5 py-4 rounded-b-2xl sm:px-6">
          <button
            @click="clearLogs"
            class="px-4 py-2 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
            :disabled="isLoading || logs.length === 0"
          >
            <TrashIcon class="h-5 w-5" />
            Protokolle löschen
          </button>
          <button
            @click="closeLogModal"
            class="min-h-11 px-6 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 font-medium flex items-center gap-2"
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
import { XMarkIcon, ClipboardDocumentListIcon, TrashIcon, CalendarIcon, ClockIcon } from '@heroicons/vue/24/outline';
import { CATEGORY_CLASSES, DEFAULT_CATEGORY_CLASS, FREQUENCY_LABELS } from '../constants/maintenance';
import { useMaintenanceLogs } from '../composables/useMaintenanceLogs';
import type { Frequency } from '../types/maintenance';
import { formatDisplayDate } from '../utils/maintenanceDates';

const { logs, isLogModalOpen, isLoading, clearLogs, closeLogModal } = useMaintenanceLogs();

const formatDate = (dateString: string | null): string => formatDisplayDate(dateString) ?? '—';
const formatFrequency = (frequency: Frequency | null): string => {
  if (!frequency) return 'Geplant';
  return FREQUENCY_LABELS[frequency];
};
const getCategoryClass = (category: string): string => CATEGORY_CLASSES[category] || DEFAULT_CATEGORY_CLASS;
</script>

