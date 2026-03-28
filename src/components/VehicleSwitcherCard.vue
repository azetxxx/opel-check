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
  <section class="overflow-hidden rounded-[28px] border border-blue-200 bg-white shadow-sm">
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 text-white">
      <div class="flex items-center gap-3">
        <span class="text-lg">🚗</span>
        <div>
          <h3 class="text-lg font-semibold">Aktives Fahrzeug</h3>
        </div>
      </div>
    </div>

    <div class="space-y-3 p-4">
      <button
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        @click="emit('change', vehicle.id)"
        class="w-full rounded-[24px] border px-4 py-4 text-left transition-colors"
        :class="vehicle.id === activeVehicleId ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span :class="['h-4 w-4 rounded-full border-2', vehicle.id === activeVehicleId ? 'border-blue-600' : 'border-gray-400']"></span>
            <div>
              <p class="font-medium text-gray-900">{{ vehicle.name }}</p>
              <p class="mt-1 text-sm text-gray-600">{{ [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Kein Modell gepflegt' }}</p>
            </div>
          </div>
          <span v-if="vehicle.id === activeVehicleId" class="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
        </div>
      </button>

      <button
        @click="emit('create')"
        class="flex min-h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
      >
        <PlusIcon class="h-5 w-5" />
        Neues Fahrzeug hinzufügen
      </button>
    </div>
  </section>
</template>
