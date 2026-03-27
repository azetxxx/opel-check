<script setup lang="ts">
import {
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  HomeIcon,
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
import type { NavigationProvider, SavedPlace } from '../types/map';
import { formatDisplayDate } from '../utils/maintenanceDates';
import { enrichTasks } from '../utils/maintenanceTasks';
import { applyRootDeepLinkRedirect } from '../utils/deepLinks';

const route = useRoute();
const router = useRouter();

const { maintenanceTasks } = useMaintenanceData();
const { logs } = useMaintenanceLogs();
const { shortcuts } = usePlaylistShortcuts();
const { places } = useSavedPlaces();
const { activeVehicle } = useVehicleProfile();

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
const quickPlaces = computed(() => places.value.slice(0, 4));
const quickPlaylists = computed(() => shortcuts.value.slice(0, 4));

const providerLabel: Record<NavigationProvider, string> = {
  google: 'Google Maps',
  apple: 'Apple Karten',
  waze: 'Waze'
};

const openPlace = (place: SavedPlace) => {
  const provider = place.providers[0] ?? 'google';
  const encoded = encodeURIComponent(place.address);
  const urls: Record<NavigationProvider, string> = {
    google: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    apple: `https://maps.apple.com/?q=${encoded}`,
    waze: `https://waze.com/ul?q=${encoded}&navigate=yes`
  };

  window.open(urls[provider], '_blank', 'noopener,noreferrer');
};

const openPlaylist = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

onMounted(() => {
  applyRootDeepLinkRedirect(route, router);
});
</script>

<template>
  <section class="space-y-6">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-start gap-4">
        <HomeIcon class="h-8 w-8 text-blue-600" />
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Start</h2>
          <p class="mt-1 text-sm text-gray-600">
            Schnellzugriff auf deine Module, den aktuellen Fahrzeugstatus und die wichtigsten nächsten Schritte.
          </p>
        </div>
      </div>
    </div>

    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Aktives Fahrzeug</h3>
          <p class="text-sm text-gray-600">
            {{ activeVehicle.name }}<span v-if="activeVehicle.brand || activeVehicle.model"> · {{ [activeVehicle.brand, activeVehicle.model].filter(Boolean).join(' ') }}</span>
          </p>
        </div>
        <RouterLink to="/settings" class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
          <Cog6ToothIcon class="h-4 w-4" />
          Fahrzeugprofil öffnen
        </RouterLink>
      </div>

      <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div v-for="item in quickStats" :key="item.label" class="rounded-xl px-4 py-4" :class="item.tone">
          <p class="text-sm font-medium">{{ item.label }}</p>
          <p class="mt-2 text-2xl font-semibold">{{ item.value }}</p>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

      <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-gray-900">Schnellziele</h3>
          <RouterLink to="/map" class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            Zur Karte
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
          </RouterLink>
        </div>

        <div v-if="quickPlaces.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            v-for="place in quickPlaces"
            :key="place.id"
            @click="openPlace(place)"
            class="text-left rounded-xl bg-gray-50 px-4 py-4 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-2xl">{{ place.icon || '📍' }}</p>
                <p class="mt-2 font-medium text-gray-900">{{ place.label }}</p>
                <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ place.address }}</p>
              </div>
              <span class="text-xs font-medium text-blue-600">{{ providerLabel[place.providers[0] ?? 'google'] }}</span>
            </div>
          </button>
        </div>
        <p v-else class="text-sm text-gray-500">Noch keine Schnellziele gespeichert.</p>
      </section>

      <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-gray-900">Musik-Shortcuts</h3>
          <RouterLink to="/music" class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            Zu Musik
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
          </RouterLink>
        </div>

        <div v-if="quickPlaylists.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            v-for="item in quickPlaylists"
            :key="item.id"
            @click="openPlaylist(item.url)"
            class="text-left rounded-xl bg-gray-50 px-4 py-4 hover:bg-gray-100 transition-colors"
          >
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

    <section class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Module</h3>
        <RouterLink to="/maintenance" class="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <PlusCircleIcon class="h-4 w-4" />
          Neue Wartungsaufgabe
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RouterLink
          v-for="module in modules"
          :key="module.to"
          :to="module.to"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
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
