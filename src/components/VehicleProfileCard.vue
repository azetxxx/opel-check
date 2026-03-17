<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { VehicleProfile } from '../types/maintenance';

const props = defineProps<{
  vehicle: VehicleProfile;
}>();

const emit = defineEmits<{
  (e: 'save', vehicle: VehicleProfile): void;
}>();

const form = reactive({
  name: '',
  brand: '',
  model: '',
  plate: '',
  year: '',
  currentMileage: '',
  notes: ''
});

const syncForm = (vehicle: VehicleProfile) => {
  form.name = vehicle.name ?? '';
  form.brand = vehicle.brand ?? '';
  form.model = vehicle.model ?? '';
  form.plate = vehicle.plate ?? '';
  form.year = vehicle.year ? String(vehicle.year) : '';
  form.currentMileage = vehicle.currentMileage != null ? String(vehicle.currentMileage) : '';
  form.notes = vehicle.notes ?? '';
};

watch(
  () => props.vehicle,
  (vehicle) => syncForm(vehicle),
  { immediate: true }
);

const vehicleSummary = computed(() => {
  return [props.vehicle.brand, props.vehicle.model].filter(Boolean).join(' ');
});

const submit = () => {
  emit('save', {
    ...props.vehicle,
    name: form.name.trim() || 'Mein Fahrzeug',
    brand: form.brand.trim() || undefined,
    model: form.model.trim() || undefined,
    plate: form.plate.trim() || undefined,
    year: form.year ? Number(form.year) : undefined,
    currentMileage: form.currentMileage ? Number(form.currentMileage) : null,
    notes: form.notes.trim() || undefined
  });
};
</script>

<template>
  <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div class="mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Fahrzeugprofil</h2>
      <p class="text-sm text-gray-600 mt-1">
        {{ vehicle.name }}<span v-if="vehicleSummary"> · {{ vehicleSummary }}</span>
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input v-model="form.name" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Mein Fahrzeug">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kennzeichen</label>
        <input v-model="form.plate" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="M-AB 1234">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Marke</label>
        <input v-model="form.brand" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Opel">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Modell</label>
        <input v-model="form.model" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Corsa">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Baujahr</label>
        <input v-model="form.year" type="number" min="1900" max="2100" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="2018">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kilometerstand</label>
        <input v-model="form.currentMileage" type="number" min="0" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="125000">
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
        <textarea v-model="form.notes" rows="3" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="z. B. letzter Service, Besonderheiten, Reifenhinweise"></textarea>
      </div>
    </div>

    <div class="mt-4 flex justify-end">
      <button
        @click="submit"
        class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow text-sm font-medium"
      >
        Fahrzeug speichern
      </button>
    </div>
  </section>
</template>
