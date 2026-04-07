<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCar, faCarBurst, faCarRear, faCarSide, faGasPump, faGaugeHigh, faOilCan, faTruck, faVanShuttle } from '@fortawesome/free-solid-svg-icons';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  MusicalNoteIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useMaintenanceData } from '../composables/useMaintenanceData';
import { useMaintenanceLogs } from '../composables/useMaintenanceLogs';
import { usePlaylistShortcuts } from '../composables/usePlaylistShortcuts';
import { useSavedPlaces } from '../composables/useSavedPlaces';
import { useVehicleProfile } from '../composables/useVehicleProfile';
import { useAppPreferences } from '../composables/useAppPreferences';
import PwaInstallBanner from '../components/PwaInstallBanner.vue';
import type { NavigationProvider, SavedPlace } from '../types/map';
import type { MaintenanceTask, VehicleSymbol } from '../types/maintenance';
import { formatDisplayDate } from '../utils/maintenanceDates';
import { enrichTasks } from '../utils/maintenanceTasks';
import { applyRootDeepLinkRedirect } from '../utils/deepLinks';

const route = useRoute();
const router = useRouter();

const { maintenanceTasks } = useMaintenanceData();
const { logs } = useMaintenanceLogs();
const { shortcuts, markShortcutOpened } = usePlaylistShortcuts();
const { places } = useSavedPlaces();
const { vehicles, activeVehicle, activeVehicleId, setActiveVehicle, updateVehicle } = useVehicleProfile();
const { preferences, updatePreferences } = useAppPreferences();

const currentDate = computed(() => new Date());
const filteredTasks = computed(() => maintenanceTasks.value.filter((task) => task.vehicleId === activeVehicle.value.id && !task.isArchived));
const enrichedTasks = computed(() => enrichTasks(filteredTasks.value, currentDate.value));
const filteredLogs = computed(() => logs.value.filter((log) => log.vehicleId === activeVehicle.value.id));
const currentTaskHighlightConfig = computed(() => {
  return preferences.value.homeTaskHighlights[activeVehicle.value.id] ?? { taskId: null, alias: null };
});
const highlightedTask = computed<MaintenanceTask | null>(() => {
  const taskId = currentTaskHighlightConfig.value.taskId;
  if (!taskId) return null;
  return filteredTasks.value.find((task) => task.id === taskId) ?? null;
});
const highlightedTaskTitle = computed(() => {
  return currentTaskHighlightConfig.value.alias?.trim() || highlightedTask.value?.description || 'Aufgabe wählen';
});
const highlightedTaskValue = computed(() => {
  if (!highlightedTask.value) return 'Eintragen';

  if (highlightedTask.value.scheduleType === 'scheduled') {
    return formatDisplayDate(highlightedTask.value.dueDate ?? null) ?? 'Eintragen';
  }

  return formatDisplayDate(highlightedTask.value.nextCheck) ?? 'Eintragen';
});

const isCarMode = computed(() => preferences.value.carMode.enabled);
const isSimplifiedCarMode = computed(() => isCarMode.value && preferences.value.carMode.simplifiedHome);

const urgentTasks = computed(() => enrichedTasks.value.filter((task) => task.status === 'overdue' || task.status === 'dueNow'));
const urgentTaskSummary = computed(() => {
  if (urgentTasks.value.length === 0) return null;
  if (urgentTasks.value.length === 1) return urgentTasks.value[0];
  return null;
});
const recentCompletions = computed(() => filteredLogs.value.slice(0, 3));
const favoritePlace = computed(() => places.value.find((place) => place.id === preferences.value.pinnedStartPlaceId) ?? null);
const favoritePlaylist = computed(() => shortcuts.value.find((item) => item.id === preferences.value.pinnedStartPlaylistId) ?? null);
const isMileageModalOpen = ref(false);
const isSavingMileage = ref(false);
const isTaskHighlightModalOpen = ref(false);
const isVehicleSwitchModalOpen = ref(false);
const mileageForm = reactive({
  currentMileage: ''
});
const taskHighlightForm = reactive({
  taskId: '',
  alias: ''
});
const vehicleSwitchForm = reactive({
  vehicleId: ''
});

watch(
  () => activeVehicle.value.currentMileage,
  (value) => {
    mileageForm.currentMileage = value != null ? String(value) : '';
  },
  { immediate: true }
);

watch(
  () => activeVehicleId.value,
  (value) => {
    vehicleSwitchForm.vehicleId = value;
  },
  { immediate: true }
);

watch(
  [() => activeVehicle.value.id, () => preferences.value.homeTaskHighlights],
  () => {
    const config = preferences.value.homeTaskHighlights[activeVehicle.value.id];
    taskHighlightForm.taskId = config?.taskId ?? '';
    taskHighlightForm.alias = config?.alias ?? '';
  },
  { immediate: true, deep: true }
);

const onboardingSteps = computed(() => {
  const vehicleConfigured = vehicles.value.length > 1 || Boolean(activeVehicle.value.model || activeVehicle.value.plate || activeVehicle.value.currentMileage);
  const destinationConfigured = places.value.length > 0;
  const playlistConfigured = shortcuts.value.length > 0;
  const taskConfigured = filteredTasks.value.length > 0;

  return [
    { key: 'vehicle', label: 'Fahrzeug einrichten', done: vehicleConfigured, to: '/settings' },
    { key: 'destination', label: 'Erstes Ziel speichern', done: destinationConfigured, to: '/map?action=create-task' },
    { key: 'playlist', label: 'Erste Playlist speichern', done: playlistConfigured, to: '/music?action=create-task' },
    { key: 'task', label: 'Erste Aufgabe anlegen', done: taskConfigured, to: '/maintenance?action=create-task' }
  ];
});

const onboardingComplete = computed(() => onboardingSteps.value.every((step) => step.done));

const vehicleSymbolIcons: Record<VehicleSymbol, any> = {
  car: faCar,
  'car-side': faCarSide,
  'gauge-high': faGaugeHigh,
  'oil-can': faOilCan,
  'gas-pump': faGasPump,
  truck: faTruck,
  'van-shuttle': faVanShuttle,
  'car-rear': faCarRear,
  'car-burst': faCarBurst
};

const getPreferredPlaceProvider = (place: SavedPlace) => {
  return place.providers.includes(preferences.value.preferredMapProvider)
    ? preferences.value.preferredMapProvider
    : (place.defaultProvider ?? place.providers[0] ?? 'google');
};

const openPlace = (place: SavedPlace) => {
  const provider = getPreferredPlaceProvider(place);
  const encoded = encodeURIComponent(place.address);
  const urls: Record<NavigationProvider, string> = {
    google: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    apple: `https://maps.apple.com/?q=${encoded}`,
    waze: `https://waze.com/ul?q=${encoded}&navigate=yes`
  };

  window.open(urls[provider], '_blank', 'noopener,noreferrer');
};

const openPlaylist = (id: string, url: string) => {
  markShortcutOpened(id);
  window.open(url, '_blank', 'noopener,noreferrer');
};

const openMileageModal = () => {
  mileageForm.currentMileage = activeVehicle.value.currentMileage != null ? String(activeVehicle.value.currentMileage) : '';
  isMileageModalOpen.value = true;
};

const closeMileageModal = () => {
  isMileageModalOpen.value = false;
};

const openVehicleSwitchModal = () => {
  vehicleSwitchForm.vehicleId = activeVehicleId.value;
  isVehicleSwitchModalOpen.value = true;
};

const closeVehicleSwitchModal = () => {
  isVehicleSwitchModalOpen.value = false;
};

const saveVehicleSwitch = () => {
  if (vehicleSwitchForm.vehicleId) {
    setActiveVehicle(vehicleSwitchForm.vehicleId);
  }
  closeVehicleSwitchModal();
};

const openTaskHighlightModal = () => {
  const config = preferences.value.homeTaskHighlights[activeVehicle.value.id];
  taskHighlightForm.taskId = config?.taskId ?? '';
  taskHighlightForm.alias = config?.alias ?? '';
  isTaskHighlightModalOpen.value = true;
};

const closeTaskHighlightModal = () => {
  isTaskHighlightModalOpen.value = false;
};

const saveTaskHighlight = () => {
  updatePreferences({
    homeTaskHighlights: {
      ...preferences.value.homeTaskHighlights,
      [activeVehicle.value.id]: {
        taskId: taskHighlightForm.taskId || null,
        alias: taskHighlightForm.alias.trim() || null
      }
    }
  });
  closeTaskHighlightModal();
};

const adjustMileage = (delta: number) => {
  const currentValue = Number(mileageForm.currentMileage || 0);
  const safeValue = Number.isFinite(currentValue) ? currentValue : 0;
  mileageForm.currentMileage = String(Math.max(0, safeValue + delta));
};

const saveMileage = async () => {
  try {
    isSavingMileage.value = true;
    await updateVehicle({
      ...activeVehicle.value,
      currentMileage: mileageForm.currentMileage ? Number(mileageForm.currentMileage) : null
    });
    closeMileageModal();
  } catch (error) {
    console.error('Error saving mileage:', error);
    alert('Kilometerstand konnte nicht gespeichert werden.');
  } finally {
    isSavingMileage.value = false;
  }
};

onMounted(() => {
  applyRootDeepLinkRedirect(route, router, preferences.value.preferredStartupModule === 'home' ? null : preferences.value.preferredStartupModule);
});
</script>

<template>
  <section class="space-y-4 pb-6 sm:space-y-5">
    <section class="-mx-4 -mt-4 bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-4 pb-6 pt-5 text-white shadow-lg sm:mx-0 sm:mt-0 sm:rounded-[28px] sm:px-5 sm:pt-5">
      <div>
        <h2 class="text-2xl font-semibold">Start</h2>
        <p class="mt-2 text-sm text-white/85">Dein persönlicher Begleiter</p>
      </div>
    </section>

    <section v-if="!onboardingComplete" class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Loslegen <span class="font-normal text-gray-400">({{ activeVehicle.name }})</span></h3>
          <p class="mt-1 text-sm text-gray-600">Richte Omiigo Car in wenigen Schritten ein.</p>
        </div>
        <span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          {{ onboardingSteps.filter((step) => step.done).length }}/{{ onboardingSteps.length }}
        </span>
      </div>

      <div class="space-y-3">
        <RouterLink
          v-for="step in onboardingSteps"
          :key="step.key"
          :to="step.to"
          class="flex items-center justify-between gap-3 rounded-2xl px-4 py-4 transition-colors"
          :class="step.done ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'"
        >
          <div class="flex items-center gap-3">
            <CheckCircleIcon class="h-5 w-5" :class="step.done ? 'text-emerald-600' : 'text-gray-300'" />
            <div>
              <p class="font-medium text-gray-900">{{ step.label }}</p>
              <p class="text-sm" :class="step.done ? 'text-emerald-700' : 'text-gray-500'">{{ step.done ? 'Erledigt' : 'Jetzt starten' }}</p>
            </div>
          </div>
          <ArrowRightIcon class="h-4 w-4 text-gray-400" />
        </RouterLink>
      </div>

      <PwaInstallBanner />
    </section>

    <button class="w-full rounded-[28px] bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-left text-white shadow-lg">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-blue-100">Aktives Fahrzeug</p>
          <h3 class="mt-2 text-3xl font-semibold">{{ activeVehicle.name }}</h3>
          <p class="mt-1 text-lg text-blue-100/90">{{ [activeVehicle.brand, activeVehicle.model].filter(Boolean).join(' ') || 'Fahrzeugprofil ergänzen' }}</p>
        </div>
        <button
          @click.stop="openVehicleSwitchModal"
          class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] bg-white/15 text-white transition-colors hover:bg-white/20"
        >
          <FontAwesomeIcon :icon="vehicleSymbolIcons[activeVehicle.symbol ?? 'car']" class="h-7 w-7" />
        </button>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <button
          @click.stop="openMileageModal"
          class="rounded-[22px] bg-white/10 px-4 py-4 text-center transition-colors hover:bg-white/15"
        >
          <p class="text-3xl font-semibold">{{ activeVehicle.currentMileage != null ? activeVehicle.currentMileage.toLocaleString('de-DE') : '—' }}</p>
          <p class="mt-1 text-sm text-blue-100/85">Kilometerstand</p>
        </button>
        <button
          @click.stop="openTaskHighlightModal"
          class="rounded-[22px] bg-white/10 px-4 py-4 text-center transition-colors hover:bg-white/15"
        >
          <p class="text-3xl font-semibold">{{ highlightedTaskValue }}</p>
          <p class="mt-1 text-sm text-blue-100/85">{{ highlightedTaskTitle }}</p>
        </button>
      </div>
    </button>

    <RouterLink
      v-if="urgentTasks.length > 0"
      to="/maintenance"
      class="block w-full rounded-[28px] bg-gradient-to-r from-red-500 to-orange-500 p-5 text-left text-white shadow-lg"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="mt-1 flex h-11 w-11 items-center justify-center rounded-[20px] bg-white/20 text-white">
            <ExclamationTriangleIcon class="h-5 w-5" />
          </div>
          <div>
            <p class="text-sm font-medium text-white/85">Dringende Wartung</p>
            <h3 class="mt-2 text-2xl font-semibold">
              {{ urgentTasks.length > 1 ? `${urgentTasks.length} Aufgaben` : urgentTaskSummary?.description }}
            </h3>
            <p class="mt-1 text-sm text-white/90">
              {{ urgentTasks.length > 1 ? 'Bitte in der Wartung prüfen' : (urgentTaskSummary ? formatDisplayDate(urgentTaskSummary.scheduleType === 'scheduled' ? urgentTaskSummary.dueDate ?? null : urgentTaskSummary.nextCheck) ?? urgentTaskSummary.category : '') }}
            </p>
          </div>
        </div>
      </div>
    </RouterLink>

    <button
      v-if="favoritePlace"
      @click="openPlace(favoritePlace)"
      class="w-full rounded-[28px] bg-gradient-to-r from-amber-400 to-orange-500 p-5 text-left text-white shadow-lg"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="mt-1 flex h-11 w-11 items-center justify-center rounded-[20px] bg-white/20 text-white">
            <MapPinIcon class="h-5 w-5" />
          </div>
          <div>
            <div class="flex items-center gap-2 text-sm text-yellow-50/90">
              <StarIcon class="h-4 w-4" />
              Lieblingsziel
            </div>
            <h3 class="mt-2 text-2xl font-semibold">{{ favoritePlace.label }}</h3>
            <p class="mt-1 text-sm text-yellow-50/90">{{ favoritePlace.address }}</p>
          </div>
        </div>
        <ChevronRightIcon class="h-8 w-8 text-white/55 stroke-[2]" />
      </div>
    </button>

    <button
      v-if="favoritePlaylist"
      @click="openPlaylist(favoritePlaylist.id, favoritePlaylist.url)"
      class="w-full rounded-[28px] bg-gradient-to-r from-violet-500 to-fuchsia-500 p-5 text-left text-white shadow-lg"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="mt-1 flex h-11 w-11 items-center justify-center rounded-[20px] bg-white/20 text-white">
            <MusicalNoteIcon class="h-5 w-5" />
          </div>
          <div>
            <div class="flex items-center gap-2 text-sm text-fuchsia-100/90">
              <StarIcon class="h-4 w-4" />
              Lieblingsplaylist
            </div>
            <h3 class="mt-2 text-2xl font-semibold">{{ favoritePlaylist.title }}</h3>
            <p class="mt-1 text-sm text-fuchsia-100/90">{{ favoritePlaylist.provider }}</p>
          </div>
        </div>
        <ChevronRightIcon class="h-8 w-8 text-white/55 stroke-[2]" />
      </div>
    </button>

    <RouterLink to="/maintenance" class="block rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm space-y-4 transition-colors hover:bg-gray-50">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-[20px] bg-orange-500 text-white shadow-sm">
            <WrenchScrewdriverIcon class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Wartungsaufgaben</h3>
            <p class="mt-1 text-sm text-gray-500">{{ filteredTasks.length }} Aufgaben insgesamt</p>
          </div>
        </div>
        <ChevronRightIcon class="h-7 w-7 text-gray-300 stroke-[2]" />
      </div>

      <div
        v-if="urgentTasks.length > 0"
        class="flex items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-red-700"
      >
        <div class="flex items-center gap-2">
          <ExclamationTriangleIcon class="h-5 w-5" />
          <span class="font-medium">{{ urgentTasks.length }} dringende Aufgabe<span v-if="urgentTasks.length !== 1">n</span></span>
        </div>
        <ChevronRightIcon class="h-5 w-5 text-red-300 stroke-[2]" />
      </div>

      <div v-else class="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-emerald-700">
        <div class="flex items-center gap-2">
          <CheckCircleIcon class="h-5 w-5" />
          <span class="font-medium">Keine dringenden Aufgaben</span>
        </div>
      </div>
    </RouterLink>

    <div class="grid grid-cols-2 gap-4">
      <RouterLink to="/map" class="rounded-[28px] border border-gray-100 bg-white p-5 text-center shadow-sm">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-sm">
          <MapPinIcon class="h-7 w-7" />
        </div>
        <h3 class="mt-4 text-xl font-semibold text-gray-900">Alle Ziele</h3>
        <p class="mt-1 text-sm text-gray-500">Navigation</p>
      </RouterLink>

      <RouterLink to="/music" class="rounded-[28px] border border-gray-100 bg-white p-5 text-center shadow-sm">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
          <MusicalNoteIcon class="h-7 w-7" />
        </div>
        <h3 class="mt-4 text-xl font-semibold text-gray-900">Alle Playlists</h3>
        <p class="mt-1 text-sm text-gray-500">Unterhaltung</p>
      </RouterLink>
    </div>

    <RouterLink
      v-if="recentCompletions.length > 0 && !isSimplifiedCarMode"
      to="/maintenance?action=open-logs"
      class="block rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm space-y-3 transition-colors hover:bg-gray-50"
    >
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Zuletzt erledigt</h3>
        <ChevronRightIcon class="h-7 w-7 text-gray-300 stroke-[2]" />
      </div>

      <div v-for="entry in recentCompletions" :key="entry.id" class="rounded-2xl bg-gray-50 px-4 py-3">
        <p class="font-medium text-gray-900">{{ entry.taskDescription }}</p>
        <p class="mt-1 text-sm text-gray-600">Erledigt am {{ formatDisplayDate(entry.checkedAt) }}</p>
      </div>
    </RouterLink>

    <Teleport to="body">
      <div v-if="isMileageModalOpen" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
        <div class="w-full max-w-md rounded-[28px] bg-white shadow-2xl border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Kilometerstand bearbeiten</h3>
              <p class="mt-1 text-sm text-gray-600">{{ activeVehicle.name }}</p>
            </div>
            <button @click="closeMileageModal" class="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-4 px-5 py-5">
            <label class="block text-sm font-medium text-gray-700">Kilometerstand</label>
            <div class="grid grid-cols-[64px_1fr_64px] gap-3 items-center">
              <button
                @click="adjustMileage(-100)"
                type="button"
                class="flex min-h-12 items-center justify-center rounded-2xl border border-gray-300 text-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                -100
              </button>

              <input
                v-model="mileageForm.currentMileage"
                type="number"
                min="0"
                inputmode="numeric"
                class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-center text-lg font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="125000"
              >

              <button
                @click="adjustMileage(100)"
                type="button"
                class="flex min-h-12 items-center justify-center rounded-2xl border border-gray-300 text-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                +100
              </button>
            </div>
          </div>

          <div class="flex gap-3 border-t border-gray-100 px-5 py-4">
            <button
              @click="closeMileageModal"
              type="button"
              class="flex min-h-12 flex-1 items-center justify-center rounded-[20px] border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              @click="saveMileage"
              type="button"
              :disabled="isSavingMileage"
              class="flex min-h-12 flex-1 items-center justify-center rounded-[20px] bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {{ isSavingMileage ? 'Speichert…' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="isTaskHighlightModalOpen" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
        <div class="w-full max-w-md rounded-[28px] bg-white shadow-2xl border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Startseiten-Karte wählen</h3>
              <p class="mt-1 text-sm text-gray-600">{{ activeVehicle.name }}</p>
            </div>
            <button @click="closeTaskHighlightModal" class="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-4 px-5 py-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Wartungsaufgabe</label>
              <select
                v-model="taskHighlightForm.taskId"
                class="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Keine Aufgabe gewählt</option>
                <option v-for="task in filteredTasks" :key="task.id" :value="task.id">
                  {{ task.description }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Alias für Startseite</label>
              <input
                v-model="taskHighlightForm.alias"
                type="text"
                class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z. B. Nächster TÜV"
              >
            </div>
          </div>

          <div class="flex gap-3 border-t border-gray-100 px-5 py-4">
            <button
              @click="closeTaskHighlightModal"
              type="button"
              class="flex min-h-12 flex-1 items-center justify-center rounded-[20px] border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              @click="saveTaskHighlight"
              type="button"
              class="flex min-h-12 flex-1 items-center justify-center rounded-[20px] bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="isVehicleSwitchModalOpen" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
        <div class="w-full max-w-md rounded-[28px] bg-white shadow-2xl border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Aktives Fahrzeug wechseln</h3>
              <p class="mt-1 text-sm text-gray-600">Wähle das Fahrzeug für die Startseite.</p>
            </div>
            <button @click="closeVehicleSwitchModal" class="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-4 px-5 py-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fahrzeug</label>
              <select
                v-model="vehicleSwitchForm.vehicleId"
                class="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                  {{ vehicle.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 border-t border-gray-100 px-5 py-4">
            <button
              @click="closeVehicleSwitchModal"
              type="button"
              class="flex min-h-12 flex-1 items-center justify-center rounded-[20px] border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              @click="saveVehicleSwitch"
              type="button"
              class="flex min-h-12 flex-1 items-center justify-center rounded-[20px] bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Auswählen
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
