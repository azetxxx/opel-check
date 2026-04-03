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
import { acceptVehicleInvite, createVehicleInvite, listVehicleInvites, listVehicleMembers, removeVehicleMember, revokeVehicleInvite, updateVehicleMemberRole } from '../services/storage/inviteService';
import { BUILT_IN_MAINTENANCE_TASKS, createBuiltInTaskForVehicle } from '../constants/builtInMaintenanceTasks';
import type { VehicleProfile } from '../types/maintenance';
import type { AppPreferences } from '../types/preferences';
import type { VehicleInviteRow, VehicleMemberListItem, VehicleMemberRole } from '../types/supabase';
import { createBackupPayload, downloadBackup, validateBackupPayload } from '../utils/backup';

const { maintenanceTasks, replaceTasks, restoreTask, archiveTask, saveTask, ensureBuiltInTasksForVehicle } = useMaintenanceData();
const { logs, replaceLogs } = useMaintenanceLogs();
const { vehicles, activeVehicle, activeVehicleId, setActiveVehicle, createVehicle, updateVehicle, deleteVehicle, replaceVehicles, reloadVehicles } = useVehicleProfile();
const { user, isAuthenticated, isConfigured, isLoading: isAuthLoading, signInWithMagicLink, signOut } = useAuth();
const editingVehicleId = ref<string | null>(null);
const viewingVehicleId = ref<string | null>(null);
const creatingVehicle = ref(false);
const joiningVehicle = ref(false);
const joinInviteCode = ref('');
const { preferences, updatePreferences } = useAppPreferences();
const vehicleInvites = ref<VehicleInviteRow[]>([]);
const vehicleMembers = ref<VehicleMemberListItem[]>([]);
const isInviteLoading = ref(false);
const authFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const sharingFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const vehicleFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const isCloudEnabled = computed(() => storageProvider === 'supabase' && isConfigured.value && isAuthenticated.value);
const isLocalOnlyMode = computed(() => !isAuthenticated.value);

const selectedVehicleForModal = computed(() => {
  if (creatingVehicle.value) {
    return {
      id: crypto.randomUUID(),
      name: '',
      brand: '',
      model: '',
      plate: '',
      year: undefined,
      vin: undefined,
      notes: '',
      currentMileage: null,
      symbol: 'car',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as VehicleProfile;
  }

  return vehicles.value.find((vehicle) => vehicle.id === (editingVehicleId.value ?? viewingVehicleId.value)) ?? activeVehicle.value;
});

const isImportingBackup = ref(false);
const builtInTasks = computed(() => {
  return BUILT_IN_MAINTENANCE_TASKS.map((definition) => {
    const existingTask = maintenanceTasks.value.find((task) => {
      return task.vehicleId === activeVehicle.value.id && !task.isCustom && task.description === definition.description;
    });

    return existingTask ?? createBuiltInTaskForVehicle(definition, activeVehicle.value.id);
  });
});

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

const getMemberManagementErrorMessage = (error: unknown) => {
  const message = getErrorMessage(error);

  if (message.includes('Last owner cannot be removed')) {
    return 'Der letzte Owner eines Fahrzeugs kann nicht entfernt werden. Übertrage zuerst die Owner-Rolle an eine andere Person.';
  }

  if (message.includes('Last owner cannot be downgraded')) {
    return 'Der letzte Owner eines Fahrzeugs kann nicht herabgestuft werden. Lege zuerst einen weiteren Owner fest.';
  }

  if (message.includes('Access denied')) {
    return 'Diese Aktion ist nur für Owner des Fahrzeugs erlaubt.';
  }

  return message;
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
    if (creatingVehicle.value) {
      const createdVehicle = await createVehicle({
        name: vehicle.name,
        brand: vehicle.brand,
        model: vehicle.model,
        plate: vehicle.plate,
        year: vehicle.year,
        vin: vehicle.vin,
        notes: vehicle.notes,
        currentMileage: vehicle.currentMileage,
        symbol: vehicle.symbol
      });
      await ensureBuiltInTasksForVehicle(createdVehicle.id);
      setTimedFeedback(vehicleFeedback, 'success', 'Fahrzeug erstellt.');
      closeVehicleModal();
      return;
    }

    await updateVehicle(vehicle);
    setTimedFeedback(vehicleFeedback, 'success', 'Fahrzeug gespeichert.');
    closeVehicleModal();
  } catch (error) {
    console.error('Error saving vehicle profile:', error);
    setTimedFeedback(vehicleFeedback, 'error', `Fahrzeug konnte nicht gespeichert werden: ${getErrorMessage(error)}`);
  }
};

const loadVehicleSharingData = async () => {
  if (!isCloudEnabled.value) {
    vehicleInvites.value = [];
    vehicleMembers.value = [];
    return;
  }

  try {
    isInviteLoading.value = true;
    const [invites, members] = await Promise.all([
      listVehicleInvites(activeVehicle.value.id),
      listVehicleMembers(activeVehicle.value.id)
    ]);
    vehicleInvites.value = invites;
    vehicleMembers.value = members;
  } catch (error) {
    console.error('Error loading vehicle sharing data:', error);
    vehicleInvites.value = [];
    vehicleMembers.value = [];
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
    await loadVehicleSharingData();
    setTimedFeedback(sharingFeedback, 'success', 'Fahrzeug erfolgreich hinzugefügt.');
    joiningVehicle.value = false;
    joinInviteCode.value = '';
  } catch (error) {
    console.error('Error accepting invite:', error);
    setTimedFeedback(sharingFeedback, 'error', `Invite-Code konnte nicht eingelöst werden: ${getErrorMessage(error)}`);
  } finally {
    isInviteLoading.value = false;
  }
};

const handleUpdateMemberRole = async (payload: { memberId: string; role: VehicleMemberRole }) => {
  try {
    isInviteLoading.value = true;
    await updateVehicleMemberRole(payload.memberId, payload.role);
    await loadVehicleSharingData();
    setTimedFeedback(sharingFeedback, 'success', 'Rolle aktualisiert.');
  } catch (error) {
    console.error('Error updating member role:', error);
    setTimedFeedback(sharingFeedback, 'error', `Rolle konnte nicht geändert werden: ${getMemberManagementErrorMessage(error)}`);
  } finally {
    isInviteLoading.value = false;
  }
};

const handleRemoveMember = async (memberId: string) => {
  try {
    isInviteLoading.value = true;
    await removeVehicleMember(memberId);
    await loadVehicleSharingData();
    setTimedFeedback(sharingFeedback, 'success', 'Mitglied entfernt.');
  } catch (error) {
    console.error('Error removing member:', error);
    setTimedFeedback(sharingFeedback, 'error', `Mitglied konnte nicht entfernt werden: ${getMemberManagementErrorMessage(error)}`);
  } finally {
    isInviteLoading.value = false;
  }
};

const handleRevokeInvite = async (inviteId: string) => {
  try {
    isInviteLoading.value = true;
    await revokeVehicleInvite(inviteId);
    await loadVehicleSharingData();
    setTimedFeedback(sharingFeedback, 'success', 'Einladung widerrufen.');
  } catch (error) {
    console.error('Error revoking invite:', error);
    setTimedFeedback(sharingFeedback, 'error', `Einladung konnte nicht widerrufen werden: ${getErrorMessage(error)}`);
  } finally {
    isInviteLoading.value = false;
  }
};

const submitJoinVehicle = async () => {
  if (!joinInviteCode.value.trim()) {
    setTimedFeedback(vehicleFeedback, 'error', 'Bitte Einladungscode eingeben.');
    return;
  }

  await handleAcceptInvite(joinInviteCode.value);
};

watch(
  [() => activeVehicle.value.id, () => isCloudEnabled.value],
  () => {
    void loadVehicleSharingData();
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
  creatingVehicle.value = false;
  joiningVehicle.value = false;
  joinInviteCode.value = '';
};

const openJoinVehicleModal = () => {
  joiningVehicle.value = true;
  editingVehicleId.value = null;
  viewingVehicleId.value = null;
};

const addVehicle = () => {
  creatingVehicle.value = true;
  editingVehicleId.value = null;
  viewingVehicleId.value = null;
};

const removeVehicle = async (vehicleId: string) => {
  const vehicle = vehicles.value.find((item) => item.id === vehicleId);
  if (!vehicle) return;

  const confirmed = window.confirm(`Fahrzeug „${vehicle.name}“ wirklich löschen?`);
  if (!confirmed) return;

  const deleted = await deleteVehicle(vehicleId);
  if (!deleted) {
    setTimedFeedback(vehicleFeedback, 'error', 'Fahrzeug konnte nicht gelöscht werden.');
    return;
  }

  closeVehicleModal();
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

const toggleDeveloperSetting = (key: keyof AppPreferences['developer'], value: boolean) => {
  updatePreferences({
    developer: {
      ...preferences.value.developer,
      [key]: value
    }
  });
};

const ensureBuiltInTasksForActiveVehicle = async () => {
  await ensureBuiltInTasksForVehicle(activeVehicle.value.id);
};

watch(
  () => activeVehicle.value.id,
  () => {
    void ensureBuiltInTasksForActiveVehicle();
  },
  { immediate: true }
);

const toggleBuiltInTask = async (taskId: string, enabled: boolean) => {
  const existingTask = maintenanceTasks.value.find((task) => task.id === taskId);
  const displayedTask = builtInTasks.value.find((task) => task.id === taskId);

  if (enabled) {
    if (existingTask) {
      await restoreTask(taskId);
      return;
    }

    const definition = BUILT_IN_MAINTENANCE_TASKS.find((item) => item.description === displayedTask?.description);
    if (definition) {
      const builtInTask = createBuiltInTaskForVehicle(definition, activeVehicle.value.id);
      await saveTask({
        vehicleId: builtInTask.vehicleId,
        description: builtInTask.description,
        category: builtInTask.category,
        scheduleType: builtInTask.scheduleType,
        frequency: builtInTask.frequency,
        lastCheck: builtInTask.lastCheck,
        nextCheck: builtInTask.nextCheck,
        dueDate: builtInTask.dueDate,
        notes: builtInTask.notes,
        dueMileage: builtInTask.dueMileage,
        lastMileage: builtInTask.lastMileage,
        isCustom: false,
        isArchived: false
      });
    }
    return;
  }

  if (existingTask) {
    await archiveTask(taskId);
  }
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
        :local-only-notice="isLocalOnlyMode"
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
        :local-only-notice="isLocalOnlyMode"
        @change="setActiveVehicle"
        @create="addVehicle"
        @join="openJoinVehicleModal"
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
        :members="vehicleMembers"
        :loading="isInviteLoading"
        :success-message="sharingFeedback?.type === 'success' ? sharingFeedback.message : null"
        :error-message="sharingFeedback?.type === 'error' ? sharingFeedback.message : null"
        @refresh="loadVehicleSharingData"
        @create-invite="handleCreateInvite"
        @accept-invite="handleAcceptInvite"
        @update-member-role="handleUpdateMemberRole"
        @remove-member="handleRemoveMember"
        @revoke-invite="handleRevokeInvite"
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
        @toggle-developer="toggleDeveloperSetting"
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

    <div v-if="editingVehicleId || viewingVehicleId || creatingVehicle" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
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

    <div v-if="joiningVehicle" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div class="w-full max-w-md rounded-[28px] border border-gray-100 bg-white p-5 shadow-2xl">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Mit Fahrzeug verbinden</h3>
            <p class="mt-1 text-sm text-gray-600">Gib einen Einladungscode ein, um einem vorhandenen Fahrzeug beizutreten.</p>
          </div>
        </div>

        <div class="mt-4 space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Einladungscode</label>
            <input
              v-model="joinInviteCode"
              type="text"
              class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABCD2345"
            >
          </div>
        </div>

        <div class="mt-5 flex gap-3">
          <button
            @click="closeVehicleModal"
            type="button"
            class="flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            @click="submitJoinVehicle"
            :disabled="isInviteLoading || !joinInviteCode.trim()"
            type="button"
            class="flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Verbinden
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
