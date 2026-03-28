<script setup lang="ts">
import {
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  MapPinIcon,
  MusicalNoteIcon,
  PlusCircleIcon,
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
const { activeVehicle } = useVehicleProfile();
const { preferences } = useAppPreferences();

const modules = [
  { title: 'Karte', description: 'Gespeicherte Orte und Schnellnavigation.', to: '/map', icon: MapPinIcon, action: 'Zu Karte' },
  { title: 'Wartung', description: 'Aufgaben, Dashboard und Serviceprotokolle.', to: '/maintenance', icon: WrenchScrewdriverIcon, action: 'Zu Wartung' },
  { title: 'Musik', description: 'Playlists und Medien-Shortcuts fürs Auto.', to: '/music', icon: MusicalNoteIcon, action: 'Zu Musik' },
  { title: 'Einstellungen', description: 'Profile, Backup und Modul-Konfiguration.', to: '/settings', icon: Cog6ToothIcon, action: 'Zu Einstellungen' }
];

const currentDate = computed(() => new Date());
const filteredTasks = computed(() => maintenanceTasks.value.filter((task) => task.vehicleId === activeVehicle.value.id && !task.isArchived));
const enrichedTasks = computed(() => enrichTasks(filteredTasks.value, currentDate.value));
const filteredLogs = computed(() => logs.value.filter((log) => log.vehicleId === activeVehicle.value.id));

const isCarMode = computed(() => preferences.value.carMode.enabled);
const isSimplifiedCarMode = computed(() => isCarMode.value && preferences.value.carMode.simplifiedHome);

const quickStats = computed(() => {
  const overdue = enrichedTasks.value.filter((task) => task.status === 'overdue').length;
  const dueSoon = enrichedTasks.value.filter((task) => task.status === 'dueSoon' || task.status === 'dueNow').length;
  const open = enrichedTasks.value.filter((task) => task.status === 'pending').length;
  const completed = enrichedTasks.value.filter((task) => task.status === 'done').length;

  return [
    { label: 'Überfällig', value: overdue, tone: 'text-red-600 bg-red-50' },
    { label: 'Bald fällig', value: dueSoon, tone: 'text-orange-600 bg-orange-50' },
    { label: 'Offen', value: open, tone: 'text-yellow-700 bg-yellow-50' },
    { label: 'Erledigt', value: completed, tone: 'text-green-600 bg-green-50' }
  ];
});

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
const favoritePlace = computed(() => places.value.find((place) => place.id === preferences.value.favoritePlaceId) ?? null);
const favoritePlaylist = computed(() => shortcuts.value.find((item) => item.id === preferences.value.favoritePlaylistId) ?? null);
const quickPlaces = computed(() => {
  const remaining = places.value.filter((place) => place.id !== favoritePlace.value?.id);
  return favoritePlace.value ? [favoritePlace.value, ...remaining].slice(0, 4) : remaining.slice(0, 4);
});
const quickPlaylists = computed(() => {
  const sorted = [...shortcuts.value].sort((a, b) => {
    if (a.id === favoritePlaylist.value?.id) return -1;
    if (b.id === favoritePlaylist.value?.id) return 1;
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.lastOpenedAt && b.lastOpenedAt) return new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime();
    if (a.lastOpenedAt && !b.lastOpenedAt) return -1;
    if (!a.lastOpenedAt && b.lastOpenedAt) return 1;
    return a.title.localeCompare(b.title, 'de');
  });
  return sorted.slice(0, 4);
});

const providerLabel: Record<NavigationProvider, string> = {
  google: 'Google Maps',
  apple: 'Apple Karten',
  waze: 'Waze'
};

const startupModuleLabel: Record<string, string> = {
  home: 'Start',
  map: 'Karte',
  maintenance: 'Wartung',
  music: 'Musik',
  settings: 'Einstellungen'
};

const showStats = computed(() => preferences.value.homeWidgets.stats && !isSimplifiedCarMode.value);
const showRecentCompletions = computed(() => preferences.value.homeWidgets.recentCompletions && !isSimplifiedCarMode.value);
const showQuickPlaces = computed(() => preferences.value.homeWidgets.quickPlaces && (!isSimplifiedCarMode.value || quickPlaces.value.length > 0));
const showQuickPlaylists = computed(() => preferences.value.homeWidgets.quickPlaylists && (!isSimplifiedCarMode.value || quickPlaylists.value.length > 0));
const showModules = computed(() => preferences.value.homeWidgets.modules && !isSimplifiedCarMode.value);
const shouldAutoFocusFavoritePlace = computed(() => isCarMode.value && preferences.value.carMode.autoOpenFavoritePlace && favoritePlace.value);
const shouldAutoFocusFavoritePlaylist = computed(() => isCarMode.value && preferences.value.carMode.autoPlayFavoritePlaylist && favoritePlaylist.value);

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
  <section class="space-y-6">
    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold text-gray-900">Aktives Fahrzeug</h3>
            <span v-if="isCarMode" class="px-2 py-0.5 text-xs rounded-full bg-slate-900 text-white">Car Mode</span>
          </div>
          <p class="text-sm text-gray-600">
            {{ activeVehicle.name }}<span v-if="activeVehicle.brand || activeVehicle.model"> · {{ [activeVehicle.brand, activeVehicle.model].filter(Boolean).join(' ') }}</span>
          </p>
        </div>
        <RouterLink to="/settings" class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
          <Cog6ToothIcon class="h-4 w-4" />
          Einstellungen
        </RouterLink>
      </div>

      <div v-if="isCarMode && (favoritePlace || favoritePlaylist)" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <button
          v-if="favoritePlace"
          @click="openPlace(favoritePlace)"
          class="rounded-2xl bg-blue-600 px-5 py-5 text-left text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-blue-100">Schnellstart Ziel</p>
              <p class="mt-2 text-xl font-semibold">{{ favoritePlace.label }}</p>
              <p class="mt-1 text-sm text-blue-100">{{ favoritePlace.address }}</p>
              <p v-if="shouldAutoFocusFavoritePlace" class="mt-3 text-xs font-medium text-blue-100">Favorit-Ziel priorisiert</p>
            </div>
            <span class="text-xs font-medium text-blue-100">{{ providerLabel[getPreferredPlaceProvider(favoritePlace)] }}</span>
          </div>
        </button>

        <button
          v-if="favoritePlaylist"
          @click="openPlaylist(favoritePlaylist.id, favoritePlaylist.url)"
          class="rounded-2xl bg-purple-600 px-5 py-5 text-left text-white shadow-sm hover:bg-purple-700 transition-colors"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-purple-100">Schnellstart Musik</p>
              <p class="mt-2 text-xl font-semibold">{{ favoritePlaylist.title }}</p>
              <p class="mt-1 text-sm text-purple-100">{{ favoritePlaylist.provider }}</p>
              <p v-if="shouldAutoFocusFavoritePlaylist" class="mt-3 text-xs font-medium text-purple-100">Favorit-Playlist priorisiert</p>
            </div>
            <span class="text-xs font-medium text-purple-100">Abspielen</span>
          </div>
        </button>
      </div>

      <div v-else-if="favoritePlace || favoritePlaylist || preferences.preferredStartupModule !== 'home'" class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button v-if="favoritePlace" @click="openPlace(favoritePlace)" class="rounded-xl bg-blue-50 px-4 py-4 text-left hover:bg-blue-100 transition-colors">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-blue-700">Favorit: Ziel</p>
              <p class="mt-2 font-semibold text-gray-900">{{ favoritePlace.label }}</p>
              <p class="mt-1 text-sm text-gray-600">{{ favoritePlace.address }}</p>
            </div>
            <span class="text-xs font-medium text-blue-600">{{ providerLabel[getPreferredPlaceProvider(favoritePlace)] }}</span>
          </div>
        </button>
        <button v-if="favoritePlaylist" @click="openPlaylist(favoritePlaylist.id, favoritePlaylist.url)" class="rounded-xl bg-purple-50 px-4 py-4 text-left hover:bg-purple-100 transition-colors">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-purple-700">Favorit: Playlist</p>
              <p class="mt-2 font-semibold text-gray-900">{{ favoritePlaylist.title }}</p>
              <p class="mt-1 text-sm text-gray-600">{{ favoritePlaylist.provider }}</p>
            </div>
            <span class="text-xs font-medium text-purple-600">Abspielen</span>
          </div>
        </button>
        <div v-if="preferences.preferredStartupModule !== 'home'" class="rounded-xl bg-emerald-50 px-4 py-4">
          <p class="text-sm font-medium text-emerald-700">Bevorzugter Start</p>
          <p class="mt-2 font-semibold text-gray-900">{{ startupModuleLabel[preferences.preferredStartupModule] }}</p>
          <p class="mt-1 text-sm text-gray-600">Wird für spätere Schnellstarts verwendet.</p>
        </div>
      </div>

      <div v-if="showStats" class="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div v-for="item in quickStats" :key="item.label" class="rounded-xl px-4 py-4" :class="item.tone">
          <p class="text-sm font-medium">{{ item.label }}</p>
          <p class="mt-2 text-2xl font-semibold">{{ item.value }}</p>
        </div>
      </div>
    </section>

    <div v-if="preferences.homeWidgets.nextTask || showRecentCompletions" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <section v-if="preferences.homeWidgets.nextTask" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-gray-900">Nächste Aufgabe</h3>
          <RouterLink to="/maintenance" class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            Zur Wartung
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
          </RouterLink>
        </div>
        <div v-if="nextTask" class="mt-4 rounded-xl bg-gray-50 px-4 py-4">
          <p class="font-medium text-gray-900">{{ nextTask.title }}</p>
          <p class="mt-1 text-sm text-gray-600">{{ nextTask.meta }}</p>
          <p class="mt-2 text-sm text-gray-500">{{ nextTask.date ? `Termin: ${nextTask.date}` : 'Noch kein Termin hinterlegt' }}</p>
        </div>
        <p v-else class="mt-4 text-sm text-gray-500">Aktuell gibt es keine offenen oder bald fälligen Aufgaben.</p>
      </section>

      <section v-if="showRecentCompletions" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-gray-900">Zuletzt erledigt</h3>
          <RouterLink to="/maintenance" class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            Protokolle ansehen
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
          </RouterLink>
        </div>
        <div v-if="recentCompletions.length > 0" class="mt-4 space-y-3">
          <div v-for="entry in recentCompletions" :key="entry.id" class="rounded-xl bg-gray-50 px-4 py-3">
            <p class="font-medium text-gray-900">{{ entry.taskDescription }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ entry.category }}{{ entry.frequency ? ` · ${entry.frequency}` : ' · Geplant' }}</p>
            <p class="mt-1 text-sm text-gray-500">Erledigt am {{ formatDisplayDate(entry.checkedAt) }}</p>
          </div>
        </div>
        <p v-else class="mt-4 text-sm text-gray-500">Noch keine erledigten Einträge vorhanden.</p>
      </section>
    </div>

    <div v-if="showQuickPlaces || showQuickPlaylists" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <section v-if="showQuickPlaces" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-gray-900">Schnellziele</h3>
          <RouterLink to="/map" class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            Zur Karte
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
          </RouterLink>
        </div>
        <div v-if="quickPlaces.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button v-for="place in quickPlaces" :key="place.id" @click="openPlace(place)" class="text-left rounded-xl bg-gray-50 px-4 py-4 hover:bg-gray-100 transition-colors">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-2xl">{{ place.icon || '📍' }}</p>
                <p class="mt-2 font-medium text-gray-900">{{ place.label }}</p>
                <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ place.address }}</p>
              </div>
              <span class="text-xs font-medium text-blue-600">{{ providerLabel[getPreferredPlaceProvider(place)] }}</span>
            </div>
          </button>
        </div>
        <p v-else class="text-sm text-gray-500">Noch keine Schnellziele gespeichert.</p>
      </section>

      <section v-if="showQuickPlaylists" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-gray-900">Musik-Shortcuts</h3>
          <RouterLink to="/music" class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            Zu Musik
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
          </RouterLink>
        </div>
        <div v-if="quickPlaylists.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button v-for="item in quickPlaylists" :key="item.id" @click="openPlaylist(item.id, item.url)" class="text-left rounded-xl bg-gray-50 px-4 py-4 hover:bg-gray-100 transition-colors">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-2xl">{{ item.icon || '🎶' }}</p>
                <p class="mt-2 font-medium text-gray-900">{{ item.title }}</p>
                <p class="mt-1 text-sm text-gray-600">{{ item.provider }}</p>
              </div>
              <span class="text-xs font-medium text-blue-600">Öffnen</span>
            </div>
          </button>
        </div>
        <p v-else class="text-sm text-gray-500">Noch keine Musik-Shortcuts gespeichert.</p>
      </section>
    </div>

    <section v-if="showModules" class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Module</h3>
        <RouterLink to="/maintenance" class="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <PlusCircleIcon class="h-4 w-4" />
          Neue Wartungsaufgabe
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RouterLink v-for="module in modules" :key="module.to" :to="module.to" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-start gap-4">
            <component :is="module.icon" class="h-6 w-6 text-blue-600 mt-0.5" />
            <div class="flex-1">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h4 class="font-semibold text-gray-900">{{ module.title }}</h4>
                  <p class="mt-1 text-sm text-gray-600">{{ module.description }}</p>
                </div>
                <span class="text-xs font-medium text-blue-600">{{ module.action }}</span>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>
  </section>
</template>
