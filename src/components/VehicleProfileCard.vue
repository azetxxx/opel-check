<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCar, faCarBurst, faCarRear, faCarSide, faGasPump, faGaugeHigh, faOilCan, faTruck, faVanShuttle } from '@fortawesome/free-solid-svg-icons';
import { TrashIcon } from '@heroicons/vue/24/outline';
import { computed, reactive, watch } from 'vue';
import type { VehicleProfile, VehicleSymbol } from '../types/maintenance';

const props = defineProps<{
  vehicle: VehicleProfile;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', vehicle: VehicleProfile): void;
  (e: 'delete', vehicleId: string): void;
  (e: 'close'): void;
}>();

const vehicleSymbolOptions: Array<{ value: VehicleSymbol; label: string; icon: any; hint: string }> = [
  { value: 'car', label: 'Klassischer PKW', hint: 'Für normale Autos', icon: faCar },
  { value: 'car-side', label: 'Auto Seitenansicht', hint: 'Modern und klar', icon: faCarSide },
  { value: 'car-rear', label: 'Auto Heckansicht', hint: 'Alternative Fahrzeugansicht', icon: faCarRear },
  { value: 'van-shuttle', label: 'Van / Familienauto', hint: 'Für größere Fahrzeuge', icon: faVanShuttle },
  { value: 'truck', label: 'Transporter / Nutzfahrzeug', hint: 'Für Pickup oder Nutzfahrzeug', icon: faTruck },
  { value: 'gas-pump', label: 'Tanken', hint: 'Für Fokus auf Kraftstoff', icon: faGasPump },
  { value: 'oil-can', label: 'Wartung', hint: 'Für service-orientierte Nutzung', icon: faOilCan },
  { value: 'gauge-high', label: 'Cockpit', hint: 'Für Fahrdaten und Performance', icon: faGaugeHigh },
  { value: 'car-burst', label: 'Warnung', hint: 'Für Unfall- oder Alarmbezug', icon: faCarBurst }
];

const form = reactive({
  name: '',
  brand: '',
  model: '',
  plate: '',
  year: '',
  currentMileage: '',
  notes: '',
  symbol: 'car' as VehicleSymbol
});

const syncForm = (vehicle: VehicleProfile) => {
  form.name = vehicle.name ?? '';
  form.brand = vehicle.brand ?? '';
  form.model = vehicle.model ?? '';
  form.plate = vehicle.plate ?? '';
  form.year = vehicle.year ? String(vehicle.year) : '';
  form.currentMileage = vehicle.currentMileage != null ? String(vehicle.currentMileage) : '';
  form.notes = vehicle.notes ?? '';
  form.symbol = vehicle.symbol ?? 'car';
};

watch(
  () => props.vehicle,
  (vehicle) => syncForm(vehicle),
  { immediate: true }
);

const vehicleSummary = computed(() => {
  return [props.vehicle.brand, props.vehicle.model].filter(Boolean).join(' ');
});

const isCreateMode = computed(() => !props.vehicle.name && !props.vehicle.brand && !props.vehicle.model && !props.vehicle.plate);

const submit = () => {
  emit('save', {
    ...props.vehicle,
    name: form.name.trim() || 'Mein Fahrzeug',
    brand: form.brand.trim() || undefined,
    model: form.model.trim() || undefined,
    plate: form.plate.trim() || undefined,
    year: form.year ? Number(form.year) : undefined,
    currentMileage: form.currentMileage ? Number(form.currentMileage) : null,
    notes: form.notes.trim() || undefined,
    symbol: form.symbol
  });
};
</script>

<template>
  <section class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
    <div class="mb-4 flex items-start gap-3">
      <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-600">
        <FontAwesomeIcon :icon="vehicleSymbolOptions.find((option) => option.value === (form.symbol || 'car'))?.icon ?? faCar" class="h-5 w-5" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-900">{{ isCreateMode ? 'Neues Fahrzeug' : 'Fahrzeugprofil' }}</h2>
        <p class="text-sm text-gray-600 mt-1">
          <template v-if="isCreateMode">Fülle die Fahrzeugdaten aus und speichere dann das Fahrzeug.</template>
          <template v-else>{{ vehicle.name }}<span v-if="vehicleSummary"> · {{ vehicleSummary }}</span></template>
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input v-model="form.name" :readonly="readonly" type="text" class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50" placeholder="Mein Fahrzeug">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kennzeichen</label>
        <input v-model="form.plate" :readonly="readonly" type="text" class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50" placeholder="M-AB 1234">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Marke</label>
        <input v-model="form.brand" :readonly="readonly" type="text" class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50" placeholder="Opel">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Modell</label>
        <input v-model="form.model" :readonly="readonly" type="text" class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50" placeholder="Corsa">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Baujahr</label>
        <input v-model="form.year" :readonly="readonly" type="number" min="1900" max="2100" class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50" placeholder="2018">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kilometerstand</label>
        <input v-model="form.currentMileage" :readonly="readonly" type="number" min="0" class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50" placeholder="125000">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Symbol für dieses Fahrzeug</label>
        <select v-model="form.symbol" :disabled="readonly" class="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
          <option v-for="option in vehicleSymbolOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <p class="mt-2 text-xs text-gray-500">
          {{ vehicleSymbolOptions.find((option) => option.value === form.symbol)?.hint }}
        </p>
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
        <textarea v-model="form.notes" :readonly="readonly" rows="3" class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50" placeholder="z. B. letzter Service, Besonderheiten, Reifenhinweise"></textarea>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-3 sm:flex-row">
      <button
        v-if="!readonly"
        @click="submit"
        class="flex min-h-12 w-full items-center justify-center rounded-[20px] bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
      >
        Fahrzeug speichern
      </button>
      <button
        v-else
        @click="emit('close')"
        class="flex min-h-12 w-full items-center justify-center rounded-[20px] bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
      >
        Schließen
      </button>
      <button
        v-if="!readonly"
        @click="emit('delete', vehicle.id)"
        class="flex min-h-12 w-full items-center justify-center gap-2 rounded-[20px] border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <TrashIcon class="h-5 w-5" />
        Fahrzeug löschen
      </button>
    </div>
  </section>
</template>
