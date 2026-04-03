<script setup lang="ts">
import { ArrowRightIcon, ChevronDownIcon, EllipsisVerticalIcon, EyeIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { computed, ref } from 'vue';
import type { VehicleProfile } from '../types/maintenance';

const props = defineProps<{
  vehicles: VehicleProfile[];
  activeVehicleId: string;
}>();

const emit = defineEmits<{
  (e: 'change', vehicleId: string): void;
  (e: 'create'): void;
  (e: 'join'): void;
  (e: 'view', vehicleId: string): void;
  (e: 'edit', vehicleId: string): void;
  (e: 'delete', vehicleId: string): void;
}>();

const activeMenuOpen = ref(false);

const activeVehicle = computed(() => {
  return props.vehicles.find((vehicle) => vehicle.id === props.activeVehicleId) ?? props.vehicles[0] ?? null;
});

const hasMultipleVehicles = computed(() => props.vehicles.length > 1);
</script>

<template>
  <section v-if="activeVehicle" class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <div class="mt-1 flex h-11 w-11 items-center justify-center rounded-[20px] bg-blue-50 text-blue-600 shadow-sm">
          <span class="text-lg">🚗</span>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900">{{ [activeVehicle.brand, activeVehicle.model].filter(Boolean).join(' ') || activeVehicle.name }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ activeVehicle.plate || 'Kein Kennzeichen gepflegt' }}</p>
        </div>
      </div>
      <button
        @click="activeMenuOpen = !activeMenuOpen"
        class="flex h-10 w-10 items-center justify-center text-gray-400 hover:text-gray-600"
      >
        <EllipsisVerticalIcon class="h-5 w-5" />
      </button>
    </div>

    <div v-if="activeMenuOpen" class="mt-4 flex flex-col gap-2">
      <button
        @click="emit('view', activeVehicle.id); activeMenuOpen = false"
        class="min-h-11 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <EyeIcon class="h-4 w-4" />
        Fahrzeug ansehen
      </button>
      <button
        @click="emit('edit', activeVehicle.id); activeMenuOpen = false"
        class="min-h-11 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <PencilSquareIcon class="h-4 w-4" />
        Fahrzeug bearbeiten
      </button>
      <button
        @click="emit('create'); activeMenuOpen = false"
        class="min-h-11 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <PlusIcon class="h-4 w-4" />
        Neues Fahrzeug hinzufügen
      </button>
      <button
        v-if="hasMultipleVehicles"
        @click="emit('delete', activeVehicle.id); activeMenuOpen = false"
        class="min-h-11 rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 flex items-center justify-center gap-2"
      >
        <TrashIcon class="h-4 w-4" />
        Fahrzeug löschen
      </button>
    </div>

    <div class="mt-4 relative">
      <select
        :value="activeVehicle.id"
        @change="emit('change', ($event.target as HTMLSelectElement).value)"
        class="w-full appearance-none rounded-[20px] bg-blue-600 px-4 py-3 pr-11 text-sm font-medium text-white outline-none"
      >
        <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">{{ vehicle.name }}</option>
      </select>
      <ChevronDownIcon class="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/85" />
    </div>
  </section>

  <section v-else class="rounded-[28px] border border-dashed border-gray-200 bg-white p-6 shadow-sm text-center">
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-blue-50 text-blue-600 shadow-sm">
      <span class="text-2xl">🚗</span>
    </div>
    <h3 class="mt-4 text-xl font-semibold text-gray-900">Noch kein Fahrzeug vorhanden</h3>
    <p class="mt-2 text-sm text-gray-600">
      Lege dein erstes Fahrzeug an oder verbinde dich per Einladungscode mit einem vorhandenen Fahrzeug.
    </p>
    <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        @click="emit('create')"
        class="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
      >
        <PlusIcon class="h-4 w-4" />
        Fahrzeug anlegen
      </button>
      <button
        @click="emit('join')"
        class="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <ArrowRightIcon class="h-4 w-4" />
        Mit Fahrzeug verbinden
      </button>
    </div>
  </section>
</template>
