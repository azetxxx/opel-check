<script setup lang="ts">
import { PencilSquareIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePlaylistShortcuts } from '../composables/usePlaylistShortcuts';
import { useAppPreferences } from '../composables/useAppPreferences';
import type { MusicProvider, PlaylistShortcut } from '../types/music';

const route = useRoute();
const { shortcuts, upsertShortcut, removeShortcut } = usePlaylistShortcuts();
const { preferences, updatePreferences } = useAppPreferences();

const editingId = ref<string | null>(null);
const form = reactive({
  title: '',
  provider: 'spotify' as MusicProvider,
  url: '',
  notes: '',
  icon: '🎶',
  pinned: false
});

const providerLabels: Record<MusicProvider, string> = {
  spotify: 'Spotify',
  'youtube-music': 'YouTube Music',
  'apple-music': 'Apple Music',
  soundcloud: 'SoundCloud',
  other: 'Andere'
};

const providerOptions: MusicProvider[] = ['spotify', 'youtube-music', 'apple-music', 'soundcloud', 'other'];
const favoritePlaylistId = computed(() => preferences.value.favoritePlaylistId);

const sortedShortcuts = computed(() => {
  return [...shortcuts.value].sort((a, b) => {
    if (a.id === favoritePlaylistId.value) return -1;
    if (b.id === favoritePlaylistId.value) return 1;
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.title.localeCompare(b.title, 'de');
  });
});

const resetForm = () => {
  editingId.value = null;
  form.title = '';
  form.provider = 'spotify';
  form.url = '';
  form.notes = '';
  form.icon = '🎶';
  form.pinned = false;
};

const submit = () => {
  if (!form.title.trim() || !form.url.trim()) return;

  upsertShortcut({
    id: editingId.value ?? undefined,
    title: form.title.trim(),
    provider: form.provider,
    url: form.url.trim(),
    notes: form.notes.trim(),
    icon: form.icon.trim() || '🎶',
    pinned: form.pinned
  });

  resetForm();
};

const editShortcut = (item: PlaylistShortcut) => {
  editingId.value = item.id;
  form.title = item.title;
  form.provider = item.provider;
  form.url = item.url;
  form.notes = item.notes ?? '';
  form.icon = item.icon ?? '🎶';
  form.pinned = item.pinned;
};

const openShortcut = (item: PlaylistShortcut) => {
  window.open(item.url, '_blank', 'noopener,noreferrer');
};

const toggleFavorite = (item: PlaylistShortcut) => {
  updatePreferences({
    favoritePlaylistId: favoritePlaylistId.value === item.id ? null : item.id
  });
};

const applyDeepLinkAction = () => {
  const action = typeof route.query.action === 'string' ? route.query.action : null;
  const shortcutId = typeof route.query.shortcut === 'string' ? route.query.shortcut : null;

  if (action !== 'play' || !shortcutId) return;

  const shortcut = shortcuts.value.find((item) => item.id === shortcutId);
  if (!shortcut) return;

  openShortcut(shortcut);
};

watch(() => route.fullPath, applyDeepLinkAction, { immediate: true });

const groupedCounts = computed(() => {
  return providerOptions.map((provider) => ({
    provider,
    count: shortcuts.value.filter((item) => item.provider === provider).length
  }));
});
</script>

<template>
  <section class="space-y-6">
    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Shortcut speichern</h3>
        <button @click="resetForm" class="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <PlusIcon class="h-4 w-4" />
          Neu
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Titel</label>
          <input v-model="form.title" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="z. B. Morning Drive">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Anbieter</label>
          <select v-model="form.provider" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
            <option v-for="provider in providerOptions" :key="provider" :value="provider">{{ providerLabels[provider] }}</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input v-model="form.url" type="url" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="https://open.spotify.com/...">
          <p v-if="form.provider === 'youtube-music'" class="mt-1 text-xs text-gray-500">
            YouTube Music Playlist-Links werden automatisch in das bessere <span class="font-mono">watch?list=...</span>-Format umgewandelt.
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Icon / Emoji</label>
          <input v-model="form.icon" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="🎶">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <input v-model="form.notes" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="optional">
        </div>
      </div>

      <label class="inline-flex items-center gap-2 text-sm text-gray-700">
        <input v-model="form.pinned" type="checkbox">
        Oben anheften
      </label>

      <div class="flex justify-end gap-3">
        <button @click="resetForm" class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">Zurücksetzen</button>
        <button @click="submit" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium">
          {{ editingId ? 'Shortcut speichern' : 'Shortcut hinzufügen' }}
        </button>
      </div>
    </section>

    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">Anbieter-Überblick</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div v-for="item in groupedCounts" :key="item.provider" class="rounded-xl bg-gray-50 px-4 py-3">
          <p class="text-sm text-gray-500">{{ providerLabels[item.provider] }}</p>
          <p class="mt-2 text-xl font-semibold text-gray-900">{{ item.count }}</p>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Gespeicherte Shortcuts</h3>
        <p class="text-sm text-gray-500">{{ shortcuts.length }} Einträge gespeichert</p>
      </div>

      <div v-if="sortedShortcuts.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="item in sortedShortcuts" :key="item.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <p class="text-2xl">{{ item.icon || '🎶' }}</p>
                <span v-if="favoritePlaylistId === item.id" class="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Favorit</span>
                <span v-else-if="item.pinned" class="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">Angeheftet</span>
              </div>
              <h4 class="mt-2 font-semibold text-gray-900">{{ item.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ providerLabels[item.provider] }}</p>
              <p v-if="item.notes" class="text-sm text-gray-500 mt-2">{{ item.notes }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="toggleFavorite(item)" class="p-2 rounded-lg border border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                <StarIcon class="h-4 w-4" />
              </button>
              <button @click="editShortcut(item)" class="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button @click="removeShortcut(item.id)" class="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ item.url }}</p>
            </div>
            <button @click="openShortcut(item)" class="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black whitespace-nowrap">
              Öffnen
            </button>
          </div>
        </div>
      </div>

      <section v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p class="text-sm text-gray-500">Noch keine Musik-Shortcuts gespeichert. Lege oben deinen ersten Eintrag an.</p>
      </section>
    </section>
  </section>
</template>
