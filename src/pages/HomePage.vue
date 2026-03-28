<script setup lang="ts">
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  MusicalNoteIcon,
  StarIcon,
  TruckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline';
import { computed, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useMaintenanceData } from '../composables/useMaintenanceData';
import { useMaintenanceLogs } from '../composables/useMaintenanceLogs';
import { usePlaylistShortcuts } from '../composables/usePlaylistShortcuts';
import { useSavedPlaces } from '../composables/useSavedPlaces';
import { useVehicleProfile } from '../composables/useVehicleProfile';
import { useAppPreferences } from '../composables/useAppPreferences';
import PwaInstallBanner from '../components/PwaInstallBanner.vue';
import type { NavigationProvider, SavedPlace } from '../types/map';
import { formatDisplayDate } from '../utils/maintenanceDates';
import { enrichTasks } from '../utils/maintenanceTasks';
import { applyRootDeepLinkRedirect } from '../utils/deepLinks';

const route = useRoute();
const router = useRouter();

const { maintenanceTasks } = useMaintenanceData();
const { logs } = useMaintenanceLogs();
const { shortcuts, markShortcutOpened } = usePlaylistShortcuts();
const { places } = useSavedPlaces();
const { vehicles, activeVehicle } = useVehicleProfile();
const { preferences } = useAppPreferences();

const currentDate = computed(() => new Date());
const filteredTasks = computed(() => maintenanceTasks.value.filter((task) => task.vehicleId === activeVehicle.value.id && !task.isArchived));
const enrichedTasks = computed(() => enrichTasks(filteredTasks.value, currentDate.value));
const filteredLogs = computed(() => logs.value.filter((log) => log.vehicleId === activeVehicle.value.id));

const isCarMode = computed(() => preferences.value.carMode.enabled);
const isSimplifiedCarMode = computed(() => isCarMode.value && preferences.value.carMode.simplifiedHome);

const urgentTasks = computed(() => enrichedTasks.value.filter((task) => task.status === 'overdue' || task.status === 'dueNow'));
const nextTask = computed(() => {
  const candidate = enrichedTasks.value
    .filter((task) => ['overdue', 'dueNow', 'dueSoon', 'pending'].includes(task.status))
    .sort((a, b) => {
      const aDate = a.scheduleType === 'scheduled' ? a.dueDate : a.nextCheck;
      const bDate = b.scheduleType === 'scheduled' ? b.dueDate : b.nextCheck;
      if (aDate && bDate) return new Date(aDate).getTime() - new Date(bDate).getTime();
      if (aDate && !bDate) return -1;
      if (!aDate && bDate) return 1;
      return 0;
    })[0];

  if (!candidate) return null;

  return {
    title: candidate.description,
    meta: `${candidate.category} · ${candidate.scheduleType === 'scheduled' ? 'Geplant' : 'Wiederholend'}`,
    date: formatDisplayDate(candidate.scheduleType === 'scheduled' ? candidate.dueDate ?? null : candidate.nextCheck)
  };
});

const recentCompletions = computed(() => filteredLogs.value.slice(0, 3));
const favoritePlace = computed(() => places.value.find((place) => place.id === preferences.value.pinnedStartPlaceId) ?? null);
const favoritePlaylist = computed(() => shortcuts.value.find((item) => item.id === preferences.value.pinnedStartPlaylistId) ?? null);

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

onMounted(() => {
  applyRootDeepLinkRedirect(route, router, preferences.value.preferredStartupModule === 'home' ? null : preferences.value.preferredStartupModule);
});
</script>

<template>
  <section class="space-y-4 pb-6 sm:space-y-5">
    <section class="-mx-4 -mt-4 bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-4 pb-6 pt-5 text-white shadow-lg sm:mx-0 sm:mt-0 sm:rounded-[28px] sm:px-5 sm:pt-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">Start</h2>
          <p class="mt-2 text-sm text-white/85">Dein persönlicher Begleiter</p>
        </div>
        <RouterLink to="/settings" class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white hover:bg-white/20">
          <ArrowRightIcon class="h-5 w-5 -rotate-45" />
        </RouterLink>
      </div>
    </section>

    <section v-if="!onboardingComplete" class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Loslegen</h3>
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
        <div class="flex h-14 w-14 items-center justify-center rounded-[22px] bg-white/15 text-white">
          <TruckIcon class="h-7 w-7" />
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="rounded-[22px] bg-white/10 px-4 py-4 text-center">
          <p class="text-3xl font-semibold">{{ places.length }}</p>
          <p class="mt-1 text-sm text-blue-100/85">Ziele</p>
        </div>
        <div class="rounded-[22px] bg-white/10 px-4 py-4 text-center">
          <p class="text-3xl font-semibold">{{ shortcuts.length }}</p>
          <p class="mt-1 text-sm text-blue-100/85">Playlists</p>
        </div>
      </div>
    </button>

    <button
      v-if="favoritePlace"
      @click="openPlace(favoritePlace)"
      class="w-full rounded-[28px] bg-gradient-to-r from-amber-400 to-orange-500 p-5 text-left text-white shadow-lg"
    >
      <div class="flex items-start justify-between gap-3">
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
        <ArrowRightIcon class="mt-2 h-5 w-5 text-white/90" />
      </div>
    </button>

    <button
      v-if="favoritePlaylist"
      @click="openPlaylist(favoritePlaylist.id, favoritePlaylist.url)"
      class="w-full rounded-[28px] bg-gradient-to-r from-violet-500 to-fuchsia-500 p-5 text-left text-white shadow-lg"
    >
      <div class="flex items-start justify-between gap-3">
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
        <ArrowRightIcon class="mt-2 h-5 w-5 text-white/90" />
      </div>
    </button>

    <button
      v-if="nextTask"
      as="button"
      class="w-full rounded-[28px] bg-gradient-to-r p-5 text-left text-white shadow-lg"
      :class="urgentTasks.length > 0 ? 'from-red-500 to-orange-500' : 'from-orange-500 to-amber-500'"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="mt-1 flex h-11 w-11 items-center justify-center rounded-[20px] bg-white/20 text-white">
            <ExclamationTriangleIcon class="h-5 w-5" />
          </div>
          <div>
            <p class="text-sm font-medium text-white/85">Dringende Wartung</p>
            <h3 class="mt-2 text-2xl font-semibold">{{ nextTask.title }}</h3>
            <p class="mt-1 text-sm text-white/90">{{ nextTask.date || nextTask.meta }}</p>
          </div>
        </div>
      </div>
    </button>

    <section class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm space-y-4">
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
        <RouterLink to="/maintenance" class="text-gray-400 hover:text-gray-500">
          <ArrowRightIcon class="h-5 w-5" />
        </RouterLink>
      </div>

      <RouterLink
        v-if="urgentTasks.length > 0"
        to="/maintenance"
        class="flex items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-red-700"
      >
        <div class="flex items-center gap-2">
          <ExclamationTriangleIcon class="h-5 w-5" />
          <span class="font-medium">{{ urgentTasks.length }} dringende Aufgabe<span v-if="urgentTasks.length !== 1">n</span></span>
        </div>
        <ArrowRightIcon class="h-4 w-4" />
      </RouterLink>

      <div v-else class="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-emerald-700">
        <div class="flex items-center gap-2">
          <CheckCircleIcon class="h-5 w-5" />
          <span class="font-medium">Keine dringenden Aufgaben</span>
        </div>
      </div>
    </section>

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

    <section v-if="recentCompletions.length > 0 && !isSimplifiedCarMode" class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Zuletzt erledigt</h3>
        <RouterLink to="/maintenance" class="text-gray-400 hover:text-gray-500">
          <ArrowRightIcon class="h-5 w-5" />
        </RouterLink>
      </div>

      <div v-for="entry in recentCompletions" :key="entry.id" class="rounded-2xl bg-gray-50 px-4 py-3">
        <p class="font-medium text-gray-900">{{ entry.taskDescription }}</p>
        <p class="mt-1 text-sm text-gray-600">Erledigt am {{ formatDisplayDate(entry.checkedAt) }}</p>
      </div>
    </section>
  </section>
</template>
