<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { computed, reactive, watch } from 'vue';
import { CATEGORY_OPTIONS, FREQUENCY_LABELS, FREQUENCY_ORDER } from '../constants/maintenance';
import type { MaintenanceTask } from '../types/maintenance';

const props = defineProps<{
  open: boolean;
  task: MaintenanceTask | null;
  vehicleId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', task: Omit<MaintenanceTask, 'createdAt' | 'updatedAt'> & Partial<Pick<MaintenanceTask, 'createdAt' | 'updatedAt'>>): void;
}>();

const emptyForm = () => ({
  id: '',
  description: '',
  category: 'Allgemein',
  frequency: 'monthly' as MaintenanceTask['frequency'],
  notes: '',
  dueMileage: '',
  lastMileage: '',
  lastCheck: null as string | null,
  nextCheck: null as string | null,
  isCustom: true,
  isArchived: false
});

const form = reactive(emptyForm());

const isEditing = computed(() => Boolean(props.task));

const syncForm = (task: MaintenanceTask | null) => {
  if (!task) {
    Object.assign(form, emptyForm());
    return;
  }

  Object.assign(form, {
    id: task.id,
    description: task.description,
    category: task.category,
    frequency: task.frequency,
    notes: task.notes ?? '',
    dueMileage: task.dueMileage != null ? String(task.dueMileage) : '',
    lastMileage: task.lastMileage != null ? String(task.lastMileage) : '',
    lastCheck: task.lastCheck,
    nextCheck: task.nextCheck,
    isCustom: task.isCustom,
    isArchived: task.isArchived
  });
};

watch(
  () => props.task,
  (task) => syncForm(task),
  { immediate: true }
);

watch(
  () => props.open,
  (open) => {
    if (open && !props.task) {
      syncForm(null);
    }
  }
);

const submit = () => {
  if (!form.description.trim()) return;

  emit('save', {
    id: form.id,
    vehicleId: props.vehicleId,
    description: form.description.trim(),
    category: form.category,
    frequency: form.frequency,
    lastCheck: form.lastCheck,
    nextCheck: form.nextCheck,
    notes: form.notes.trim(),
    dueMileage: form.dueMileage ? Number(form.dueMileage) : null,
    lastMileage: form.lastMileage ? Number(form.lastMileage) : null,
    isCustom: form.isCustom,
    isArchived: form.isArchived
  });
};
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ isEditing ? 'Aufgabe bearbeiten' : 'Neue Aufgabe' }}
            </h2>
            <p class="text-gray-600 text-sm mt-1">Wartungsaufgabe für das aktuelle Fahrzeug konfigurieren</p>
          </div>
          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <input v-model="form.description" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="z. B. Ölwechsel durchführen">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
            <select v-model="form.category" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option v-for="category in CATEGORY_OPTIONS" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Frequenz</label>
            <select v-model="form.frequency" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option v-for="frequency in FREQUENCY_ORDER" :key="frequency" :value="frequency">{{ FREQUENCY_LABELS[frequency] }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fällig bei km (optional)</label>
            <input v-model="form.dueMileage" type="number" min="0" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="15000">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Letzter km-Stand (optional)</label>
            <input v-model="form.lastMileage" type="number" min="0" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="132000">
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
            <textarea v-model="form.notes" rows="4" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="z. B. Teilenummern, Werkstatt, Hinweise"></textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="emit('close')" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200">
            Abbrechen
          </button>
          <button @click="submit" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow text-sm font-medium">
            {{ isEditing ? 'Änderungen speichern' : 'Aufgabe erstellen' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
