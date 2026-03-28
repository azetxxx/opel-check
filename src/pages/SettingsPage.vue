<script setup lang="ts">
import { computed, ref } from 'vue';
import AppBehaviorCard from '../components/AppBehaviorCard.vue';
import AppPreferencesCard from '../components/AppPreferencesCard.vue';
import BackupPanel from '../components/BackupPanel.vue';
import HiddenTasksCard from '../components/HiddenTasksCard.vue';
import HomePreferencesCard from '../components/HomePreferencesCard.vue';
import VehicleProfileCard from '../components/VehicleProfileCard.vue';
import VehicleSwitcherCard from '../components/VehicleSwitcherCard.vue';
import { useMaintenanceData } from '../composables/useMaintenanceData';
import { useMaintenanceLogs } from '../composables/useMaintenanceLogs';
import { useVehicleProfile } from '../composables/useVehicleProfile';
import { useAppPreferences } from '../composables/useAppPreferences';
import type { VehicleProfile } from '../types/maintenance';
import type { AppPreferences } from '../types/preferences';
import { createBackupPayload, downloadBackup, validateBackupPayload } from '../utils/backup';

const { maintenanceTasks, replaceTasks, restoreTask, archiveTask } = useMaintenanceData();
const { logs, replaceLogs } = useMaintenanceLogs();
const { vehicles, activeVehicle, activeVehicleId, setActiveVehicle, createVehicle, updateVehicle, deleteVehicle, replaceVehicles } = useVehicleProfile();
const editingVehicleId = ref<string | null>(null);
const viewingVehicleId = ref<string | null>(null);
const { preferences, updatePreferences } = useAppPreferences();

const selectedVehicleForModal = computed(() => {
  return vehicles.value.find((vehicle) => vehicle.id === (editingVehicleId.value ?? viewingVehicleId.value)) ?? activeVehicle.value;
});

const isImportingBackup = ref(false);
const builtInTasks = computed(() => maintenanceTasks.value.filter((task) => !task.isCustom));

const saveVehicleProfile = (vehicle: VehicleProfile) => {
  updateVehicle(vehicle);
  closeVehicleModal();
};

const editVehicle = (vehicleId: string) => {
  setActiveVehicle(vehicleId);
  viewingVehicleId.value = null;
  editingVehicleId.value = vehicleId;
};

const viewVehicle = (vehicleId: string) => {
  setActiveVehicle(vehicleId);
  editingVehicleId.value = null;
  viewingVehicleId.value = vehicleId;
};

const closeVehicleModal = () => {
  editingVehicleId.value = null;
  viewingVehicleId.value = null;
};

const addVehicle = () => {
  createVehicle({
    name: `Fahrzeug ${vehicles.value.length + 1}`,
    brand: 'Opel',
    notes: 'Neues Fahrzeug'
  });
};

const removeVehicle = (vehicleId: string) => {
  if (vehicles.value.length <= 1) {
    alert('Mindestens ein Fahrzeug muss erhalten bleiben.');
    return;
  }

  const vehicle = vehicles.value.find((item) => item.id === vehicleId);
  if (!vehicle) return;

  const confirmed = window.confirm(`Fahrzeug „${vehicle.name}“ wirklich löschen?`);
  if (!confirmed) return;

  deleteVehicle(vehicleId);
};

const exportBackup = () => {
  downloadBackup(createBackupPayload(vehicles.value, maintenanceTasks.value, logs.value));
};

const importBackup = async (file: File) => {
  try {
    isImportingBackup.value = true;
    const parsed = JSON.parse(await file.text()) as unknown;

    if (!validateBackupPayload(parsed)) {
      alert('Ungültiges Backup-Format. Bitte eine gültige Omiigo-Car-JSON-Datei wählen.');
      return;
    }

    replaceVehicles(parsed.vehicles);
    replaceTasks(parsed.tasks);
    replaceLogs(parsed.logs);
    alert('Backup erfolgreich importiert.');
  } catch (error) {
    console.error('Error importing backup:', error);
    alert('Backup konnte nicht importiert werden. Bitte JSON-Datei prüfen.');
  } finally {
    isImportingBackup.value = false;
  }
};

const toggleWidget = (key: keyof AppPreferences['homeWidgets'], value: boolean) => {
  updatePreferences({
    homeWidgets: {
      ...preferences.value.homeWidgets,
      [key]: value
    }
  });
};

const toggleCarMode = (key: keyof AppPreferences['carMode'], value: boolean) => {
  updatePreferences({
    carMode: {
      ...preferences.value.carMode,
      [key]: value
    }
  });
};

const toggleBuiltInTask = (taskId: string, enabled: boolean) => {
  if (enabled) {
    restoreTask(taskId);
    return;
  }

  archiveTask(taskId);
};
</script>

<template>
  <section class="space-y-4 pb-6 sm:space-y-5">
    <section class="-mx-4 -mt-4 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-4 pb-6 pt-5 text-white shadow-lg sm:mx-0 sm:mt-0 sm:rounded-[28px] sm:px-5 sm:pt-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">Einstellungen</h2>
          <p class="mt-2 text-sm text-white/85">App, Startseite und Fahrzeuge anpassen</p>
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-xl font-semibold text-gray-900">Fahrzeuge</h3>
      </div>
      <VehicleSwitcherCard
        :vehicles="vehicles"
        :active-vehicle-id="activeVehicleId"
        @change="setActiveVehicle"
        @create="addVehicle"
        @view="viewVehicle"
        @edit="editVehicle"
        @delete="removeVehicle"
      />
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-xl font-semibold text-gray-900">Startseite</h3>
      </div>
      <HomePreferencesCard
        :preferences="preferences"
        @update:preferred-startup-module="updatePreferences({ preferredStartupModule: $event })"
        @toggle-widget="toggleWidget"
      />
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-xl font-semibold text-gray-900">Fahrmodus</h3>
      </div>
      <AppPreferencesCard
        :preferences="preferences"
        @update:preferred-map-provider="updatePreferences({ preferredMapProvider: $event })"
        @update:preferred-music-provider="updatePreferences({ preferredMusicProvider: $event })"
        @update:preferred-startup-module="updatePreferences({ preferredStartupModule: $event })"
        @toggle-car-mode="toggleCarMode"
      />
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-xl font-semibold text-gray-900">Standard-Apps</h3>
      </div>
      <AppBehaviorCard
        :preferred-map-provider="preferences.preferredMapProvider"
        :preferred-music-provider="preferences.preferredMusicProvider"
        @update:preferred-map-provider="updatePreferences({ preferredMapProvider: $event })"
        @update:preferred-music-provider="updatePreferences({ preferredMusicProvider: $event })"
      />
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-xl font-semibold text-gray-900">Wartung</h3>
      </div>
      <HiddenTasksCard :tasks="builtInTasks" @toggle="toggleBuiltInTask" />
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-xl font-semibold text-gray-900">Daten</h3>
      </div>
      <BackupPanel :is-importing="isImportingBackup" @export="exportBackup" @import-file="importBackup" />
    </section>

    <div v-if="editingVehicleId || viewingVehicleId" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <VehicleProfileCard
          :vehicle="selectedVehicleForModal"
          :readonly="Boolean(viewingVehicleId)"
          @save="saveVehicleProfile"
          @delete="removeVehicle"
          @close="closeVehicleModal"
        />
      </div>
    </div>
  </section>
</template>
