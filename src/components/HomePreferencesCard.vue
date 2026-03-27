<script setup lang="ts">
import type { PlaylistShortcut } from '../types/music';
import type { SavedPlace } from '../types/map';
import type { AppPreferences, StartupModule } from '../types/preferences';

defineProps<{
  preferences: AppPreferences;
  places: SavedPlace[];
  playlists: PlaylistShortcut[];
}>();

const emit = defineEmits<{
  (e: 'update:favoritePlaceId', value: string | null): void;
  (e: 'update:favoritePlaylistId', value: string | null): void;
  (e: 'update:preferredStartupModule', value: StartupModule): void;
  (e: 'toggle-widget', key: keyof AppPreferences['homeWidgets'], value: boolean): void;
}>();

const startupOptions: { value: StartupModule; label: string }[] = [
  { value: 'home', label: 'Start' },
  { value: 'map', label: 'Karte' },
  { value: 'maintenance', label: 'Wartung' },
  { value: 'music', label: 'Musik' },
  { value: 'settings', label: 'Einstellungen' }
];

const widgetLabels: Record<keyof AppPreferences['homeWidgets'], string> = {
  stats: 'Status-Kacheln',
  nextTask: 'Nächste Aufgabe',
  recentCompletions: 'Zuletzt erledigt',
  quickPlaces: 'Schnellziele',
  quickPlaylists: 'Musik-Shortcuts',
  modules: 'Modul-Kacheln'
};
</script>

<template>
  <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">Startseite anpassen</h3>
      <p class="text-sm text-gray-600 mt-1">Lege Favoriten und sichtbare Widgets für die Startseite fest.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Favorit: Ziel</label>
        <select
          :value="preferences.favoritePlaceId ?? ''"
          @change="emit('update:favoritePlaceId', ($event.target as HTMLSelectElement).value || null)"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">Kein Favorit</option>
          <option v-for="place in places" :key="place.id" :value="place.id">{{ place.label }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Favorit: Playlist</label>
        <select
          :value="preferences.favoritePlaylistId ?? ''"
          @change="emit('update:favoritePlaylistId', ($event.target as HTMLSelectElement).value || null)"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">Kein Favorit</option>
          <option v-for="playlist in playlists" :key="playlist.id" :value="playlist.id">{{ playlist.title }}</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Bevorzugtes Startmodul</label>
        <select
          :value="preferences.preferredStartupModule"
          @change="emit('update:preferredStartupModule', ($event.target as HTMLSelectElement).value as StartupModule)"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option v-for="option in startupOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>
    </div>

    <div>
      <p class="text-sm font-medium text-gray-700 mb-2">Widgets auf der Startseite</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
        <label v-for="(label, key) in widgetLabels" :key="key" class="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <input
            type="checkbox"
            :checked="preferences.homeWidgets[key]"
            @change="emit('toggle-widget', key, ($event.target as HTMLInputElement).checked)"
          >
          {{ label }}
        </label>
      </div>
    </div>
  </section>
</template>
