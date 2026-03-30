<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AppBehaviorCard from '../components/AppBehaviorCard.vue';
import AppPreferencesCard from '../components/AppPreferencesCard.vue';
import AuthCard from '../components/AuthCard.vue';
import BackupPanel from '../components/BackupPanel.vue';
import StatusToast from '../components/StatusToast.vue';
import HiddenTasksCard from '../components/HiddenTasksCard.vue';
import HomePreferencesCard from '../components/HomePreferencesCard.vue';
import VehicleProfileCard from '../components/VehicleProfileCard.vue';
import VehicleSharingCard from '../components/VehicleSharingCard.vue';
import VehicleSwitcherCard from '../components/VehicleSwitcherCard.vue';
import { useAuth } from '../composables/useAuth';
import { useMaintenanceData } from '../composables/useMaintenanceData';
import { useMaintenanceLogs } from '../composables/useMaintenanceLogs';
import { useVehicleProfile } from '../composables/useVehicleProfile';
import { useAppPreferences } from '../composables/useAppPreferences';
import { storageProvider } from '../services/storage';
import { acceptVehicleInvite, createVehicleInvite, listVehicleInvites } from '../services/storage/inviteService';
import type { VehicleProfile } from '../types/maintenance';
import type { AppPreferences } from '../types/preferences';
import type { VehicleInviteRow, VehicleMemberRole } from '../types/supabase';
import { createBackupPayload, downloadBackup, validateBackupPayload } from '../utils/backup';

const { maintenanceTasks, replaceTasks, restoreTask, archiveTask } = useMaintenanceData();
const { logs, replaceLogs } = useMaintenanceLogs();
const { vehicles, activeVehicle, activeVehicleId, setActiveVehicle, createVehicle, updateVehicle, deleteVehicle, replaceVehicles, reloadVehicles } = useVehicleProfile();
const { user, isAuthenticated, isConfigured, isLoading: isAuthLoading, signInWithMagicLink, signOut } = useAuth();
const editingVehicleId = ref<string | null>(null);
const viewingVehicleId = ref<string | null>(null);
const { preferences, updatePreferences } = useAppPreferences();
const vehicleInvites = ref<VehicleInviteRow[]>([]);
const isInviteLoading = ref(false);
const authFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const sharingFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const vehicleFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const isCloudEnabled = computed(() => storageProvider === 'supabase' && isConfigured.value && isAuthenticated.value);

const selectedVehicleForModal = computed(() => {
  return vehicles.value.find((vehicle) => vehicle.id === (editingVehicleId.value ?? viewingVehicleId.value)) ?? activeVehicle.value;
});

const isImportingBackup = ref(false);
const builtInTasks = computed(() => maintenanceTasks.value.filter((task) => !task.isCustom));

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null) {
    const maybeMessage = 'message' in error ? error.message : null;
    if (typeof maybeMessage === 'string' && maybeMessage) return maybeMessage;

    const maybeDetails = 'details' in error ? error.details : null;
    if (typeof maybeDetails === 'string' && maybeDetails) return maybeDetails;

    const maybeHint = 'hint' in error ? error.hint : null;
    if (typeof maybeHint === 'string' && maybeHint) return maybeHint;
  }

  return 'Unbekannter Fehler';
};

const setTimedFeedback = (
  target: typeof authFeedback,
  type: 'success' | 'error',
  message: string,
  timeoutMs = 3500
) => {
  target.value = { type, message };
  window.setTimeout(() => {
    if (target.value?.message === message) {
      target.value = null;
    }
  }, timeoutMs);
};

const saveVehicleProfile = async (vehicle: VehicleProfile) => {
  try {
    await updateVehicle(vehicle);
    setTimedFeedback(vehicleFeedback, 'success', 'Fahrzeug gespeichert.');
    closeVehicleModal();
  } catch (error) {
    console.error('Error saving vehicle profile:', error);
    setTimedFeedback(vehicleFeedback, 'error', `Fahrzeug konnte nicht gespeichert werden: ${getErrorMessage(error)}`);
  }
};

const loadVehicleInvites = async () => {
  if (!isCloudEnabled.value) {
    vehicleInvites.value = [];
    return;
  }

  try {
    isInviteLoading.value = true;
    vehicleInvites.value = await listVehicleInvites(activeVehicle.value.id);
  } catch (error) {
    console.error('Error loading vehicle invites:', error);
    vehicleInvites.value = [];
  } finally {
    isInviteLoading.value = false;
  }
};

const handleSignIn = async (email: string) => {
  try {
    const { error } = await signInWithMagicLink(email);
    if (error) throw error;
    setTimedFeedback(authFeedback, 'success', 'Magic Link gesendet. Bitte prüfe dein E-Mail-Postfach.');
  } catch (error) {
    console.error('Error signing in:', error);
    setTimedFeedback(authFeedback, 'error', `Anmeldung fehlgeschlagen: ${getErrorMessage(error)}`);
  }
};

const handleSignOut = async () => {
  try {
    const { error } = await signOut();
    if (error) throw error;
    vehicleInvites.value = [];
    setTimedFeedback(authFeedback, 'success', 'Erfolgreich abgemeldet.');
  } catch (error) {
    console.error('Error signing out:', error);
    setTimedFeedback(authFeedback, 'error', `Abmeldung fehlgeschlagen: ${getErrorMessage(error)}`);
  }
};

const handleCreateInvite = async (payload: { vehicleId: string; role: Exclude<VehicleMemberRole, 'owner'> }) => {
  try {
    isInviteLoading.value = true;
    const invite = await createVehicleInvite(payload.vehicleId, payload.role);
    vehicleInvites.value = [invite, ...vehicleInvites.value.filter((item) => item.id !== invite.id)];
    setTimedFeedback(sharingFeedback, 'success', `Einladungs-Code erstellt: ${invite.code}`);
  } catch (error) {
    console.error('Error creating invite:', error);
    setTimedFeedback(sharingFeedback, 'error', `Einladungs-Code konnte nicht erstellt werden: ${getErrorMessage(error)}`);
  } finally {
    isInviteLoading.value = false;
  }
};

const handleAcceptInvite = async (code: string) => {
  try {
    isInviteLoading.value = true;
    await acceptVehicleInvite(code);
    await reloadVehicles();
    await loadVehicleInvites();
    setTimedFeedback(sharingFeedback, 'success', 'Fahrzeug erfolgreich hinzugefügt.');
  } catch (error) {
    console.error('Error accepting invite:', error);
    setTimedFeedback(sharingFeedback, 'error', `Invite-Code konnte nicht eingelöst werden: ${getErrorMessage(error)}`);
  } finally {
    isInviteLoading.value = false;
  }
};

watch(
  [() => activeVehicle.value.id, () => isCloudEnabled.value],
  () => {
    void loadVehicleInvites();
  },
  { immediate: true }
);

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

const addVehicle = async () => {
  try {
    await createVehicle({
      name: `Fahrzeug ${vehicles.value.length + 1}`,
      brand: 'Opel',
      notes: 'Neues Fahrzeug'
    });
    setTimedFeedback(vehicleFeedback, 'success', 'Neues Fahrzeug erstellt.');
  } catch (error) {
    console.error('Error creating vehicle:', error);
    setTimedFeedback(vehicleFeedback, 'error', `Fahrzeug konnte nicht erstellt werden: ${getErrorMessage(error)}`);
  }
};

const removeVehicle = async (vehicleId: string) => {
  if (vehicles.value.length <= 1) {
    alert('Mindestens ein Fahrzeug muss erhalten bleiben.');
    return;
  }

  const vehicle = vehicles.value.find((item) => item.id === vehicleId);
  if (!vehicle) return;

  const confirmed = window.confirm(`Fahrzeug „${vehicle.name}“ wirklich löschen?`);
  if (!confirmed) return;

  const deleted = await deleteVehicle(vehicleId);
  if (!deleted) {
    setTimedFeedback(vehicleFeedback, 'error', 'Fahrzeug konnte nicht gelöscht werden.');
    return;
  }

  setTimedFeedback(vehicleFeedback, 'success', 'Fahrzeug gelöscht.');
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
    <StatusToast v-if="vehicleFeedback" :message="vehicleFeedback.message" :tone="vehicleFeedback.type" />
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
        <h3 class="text-xl font-semibold text-gray-900">Cloud & Konto</h3>
      </div>
      <AuthCard
        :email="user?.email ?? null"
        :configured="isConfigured"
        :authenticated="isAuthenticated"
        :loading="isAuthLoading"
        :success-message="authFeedback?.type === 'success' ? authFeedback.message : null"
        :error-message="authFeedback?.type === 'error' ? authFeedback.message : null"
        @sign-in="handleSignIn"
        @sign-out="handleSignOut"
      />
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
        <h3 class="text-xl font-semibold text-gray-900">Teilen</h3>
      </div>
      <VehicleSharingCard
        :vehicle="activeVehicle"
        :enabled="isCloudEnabled"
        :invites="vehicleInvites"
        :loading="isInviteLoading"
        :success-message="sharingFeedback?.type === 'success' ? sharingFeedback.message : null"
        :error-message="sharingFeedback?.type === 'error' ? sharingFeedback.message : null"
        @refresh="loadVehicleInvites"
        @create-invite="handleCreateInvite"
        @accept-invite="handleAcceptInvite"
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
