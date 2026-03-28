<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline';
import type { VehicleProfile } from '../types/maintenance';

defineProps<{
  vehicles: VehicleProfile[];
  activeVehicleId: string;
}>();

const emit = defineEmits<{
  (e: 'change', vehicleId: string): void;
  (e: 'create'): void;
}>();
</script>

<template>
  <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Fahrzeuge</h3>
        <p class="text-sm text-gray-600 mt-1">Wähle das aktive Fahrzeug für Startseite und Wartung.</p>
      </div>
      <button
        @click="emit('create')"
        class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
      >
        <PlusIcon class="h-4 w-4" />
        Neu
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        @click="emit('change', vehicle.id)"
        class="rounded-xl border px-4 py-4 text-left transition-colors"
        :class="vehicle.id === activeVehicleId ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-medium text-gray-900">{{ vehicle.name }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Kein Modell gepflegt' }}</p>
            <p v-if="vehicle.plate" class="mt-2 text-xs text-gray-500">{{ vehicle.plate }}</p>
          </div>
          <span
            v-if="vehicle.id === activeVehicleId"
            class="px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white"
          >
            Aktiv
          </span>
        </div>
      </button>
    </div>
  </section>
</template>
