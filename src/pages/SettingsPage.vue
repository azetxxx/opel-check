<script setup lang="ts">
import { computed, ref } from 'vue';
import AppPreferencesCard from '../components/AppPreferencesCard.vue';
import BackupPanel from '../components/BackupPanel.vue';
import HiddenTasksCard from '../components/HiddenTasksCard.vue';
import HomePreferencesCard from '../components/HomePreferencesCard.vue';
import VehicleProfileCard from '../components/VehicleProfileCard.vue';
import VehicleSwitcherCard from '../components/VehicleSwitcherCard.vue';
import { useMaintenanceData } from '../composables/useMaintenanceData';
import { useMaintenanceLogs } from '../composables/useMaintenanceLogs';
import { usePlaylistShortcuts } from '../composables/usePlaylistShortcuts';
import { useSavedPlaces } from '../composables/useSavedPlaces';
import { useVehicleProfile } from '../composables/useVehicleProfile';
import { useAppPreferences } from '../composables/useAppPreferences';
import type { VehicleProfile } from '../types/maintenance';
import type { AppPreferences } from '../types/preferences';
import { createBackupPayload, downloadBackup, validateBackupPayload } from '../utils/backup';

const { maintenanceTasks, replaceTasks, restoreTask } = useMaintenanceData();
const { logs, replaceLogs } = useMaintenanceLogs();
const { vehicles, activeVehicle, activeVehicleId, setActiveVehicle, createVehicle, updateVehicle, replaceVehicles } = useVehicleProfile();
const { places } = useSavedPlaces();
const { shortcuts } = usePlaylistShortcuts();
const { preferences, updatePreferences } = useAppPreferences();

const isImportingBackup = ref(false);
const hiddenTasks = computed(() => maintenanceTasks.value.filter((task) => task.isArchived));

const saveVehicleProfile = (vehicle: VehicleProfile) => {
  updateVehicle(vehicle);
};

const addVehicle = () => {
  createVehicle({
    name: `Fahrzeug ${vehicles.value.length + 1}`,
    brand: 'Opel',
    notes: 'Neues Fahrzeug'
  });
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
</script>

<template>
  <section class="space-y-5 sm:space-y-6 pb-4">
    <AppPreferencesCard
      :preferences="preferences"
      @update:preferred-map-provider="updatePreferences({ preferredMapProvider: $event })"
      @update:preferred-music-provider="updatePreferences({ preferredMusicProvider: $event })"
      @update:preferred-startup-module="updatePreferences({ preferredStartupModule: $event })"
      @toggle-car-mode="toggleCarMode"
    />

    <HomePreferencesCard
      :preferences="preferences"
      :places="places"
      :playlists="shortcuts"
      @update:favorite-place-id="updatePreferences({ favoritePlaceId: $event })"
      @update:favorite-playlist-id="updatePreferences({ favoritePlaylistId: $event })"
      @update:preferred-startup-module="updatePreferences({ preferredStartupModule: $event })"
      @toggle-widget="toggleWidget"
    />

    <VehicleSwitcherCard
      :vehicles="vehicles"
      :active-vehicle-id="activeVehicleId"
      @change="setActiveVehicle"
      @create="addVehicle"
    />

    <VehicleProfileCard :vehicle="activeVehicle" @save="saveVehicleProfile" />
    <HiddenTasksCard :tasks="hiddenTasks" @restore="restoreTask" />
    <BackupPanel :is-importing="isImportingBackup" @export="exportBackup" @import-file="importBackup" />
  </section>
</template>
