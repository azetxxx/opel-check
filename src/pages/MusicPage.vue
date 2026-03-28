<script setup lang="ts">
import { PencilSquareIcon, PlusIcon, StarIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline';
import { MusicalNoteIcon } from '@heroicons/vue/24/outline';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import MusicProviderIcon from '../components/MusicProviderIcon.vue';
import { usePlaylistShortcuts } from '../composables/usePlaylistShortcuts';
import { useAppPreferences } from '../composables/useAppPreferences';
import type { MusicProvider, PlaylistShortcut } from '../types/music';
import { getProviderIconFallback } from '../utils/musicIcons';

const route = useRoute();
const { shortcuts, upsertShortcut, markShortcutOpened, removeShortcut } = usePlaylistShortcuts();
const { preferences, updatePreferences } = useAppPreferences();

const editingId = ref<string | null>(null);
const isFormOpen = ref(false);
const topCreateButton = ref<HTMLElement | null>(null);
const showFloatingCreateButton = ref(false);
const activeActionMenuId = ref<string | null>(null);
let createButtonObserver: IntersectionObserver | null = null;
const preferredMusicProvider = computed(() => preferences.value.preferredMusicProvider);
const favoritePlaylistIds = computed(() => preferences.value.favoritePlaylistIds);
const pinnedStartPlaylistId = computed(() => preferences.value.pinnedStartPlaylistId);

const getDefaultMusicProvider = () => {
  return preferredMusicProvider.value !== 'none' ? preferredMusicProvider.value : 'spotify';
};

const form = reactive({
  title: '',
  provider: getDefaultMusicProvider() as MusicProvider,
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

const sortedShortcuts = computed(() => {
  return [...shortcuts.value].sort((a, b) => {
    const aFavorite = favoritePlaylistIds.value.includes(a.id);
    const bFavorite = favoritePlaylistIds.value.includes(b.id);
    if (aFavorite && !bFavorite) return -1;
    if (!aFavorite && bFavorite) return 1;
    if (a.id === pinnedStartPlaylistId.value) return -1;
    if (b.id === pinnedStartPlaylistId.value) return 1;
    if (preferredMusicProvider.value !== 'none' && a.provider === preferredMusicProvider.value && b.provider !== preferredMusicProvider.value) return -1;
    if (preferredMusicProvider.value !== 'none' && a.provider !== preferredMusicProvider.value && b.provider === preferredMusicProvider.value) return 1;
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.lastOpenedAt && b.lastOpenedAt) return new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime();
    if (a.lastOpenedAt && !b.lastOpenedAt) return -1;
    if (!a.lastOpenedAt && b.lastOpenedAt) return 1;
    return a.title.localeCompare(b.title, 'de');
  });
});

const favoriteShortcuts = computed(() => sortedShortcuts.value.filter((item) => favoritePlaylistIds.value.includes(item.id)));
const otherShortcuts = computed(() => sortedShortcuts.value.filter((item) => !favoritePlaylistIds.value.includes(item.id)));
const syncProviderIcon = (provider: MusicProvider) => {
  form.icon = getProviderIconFallback(provider);
};

const resetForm = () => {
  editingId.value = null;
  form.title = '';
  form.provider = getDefaultMusicProvider();
  form.url = '';
  form.notes = '';
  form.icon = getProviderIconFallback(form.provider);
  form.pinned = false;
};

const openCreateForm = () => {
  resetForm();
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
  resetForm();
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

  closeForm();
};

const editShortcut = (item: PlaylistShortcut) => {
  editingId.value = item.id;
  form.title = item.title;
  form.provider = item.provider;
  form.url = item.url;
  form.notes = item.notes ?? '';
  form.icon = item.icon ?? getProviderIconFallback(item.provider);
  form.pinned = item.pinned;
  isFormOpen.value = true;
};

const openShortcut = (item: PlaylistShortcut) => {
  markShortcutOpened(item.id);
  window.open(item.url, '_blank', 'noopener,noreferrer');
};

const toggleFavorite = (item: PlaylistShortcut) => {
  const isFavorite = favoritePlaylistIds.value.includes(item.id);
  updatePreferences({
    favoritePlaylistIds: isFavorite
      ? favoritePlaylistIds.value.filter((id) => id !== item.id)
      : [...favoritePlaylistIds.value, item.id],
    pinnedStartPlaylistId: preferences.value.pinnedStartPlaylistId === item.id && isFavorite
      ? null
      : preferences.value.pinnedStartPlaylistId
  });
};

const togglePinnedStartPlaylist = (item: PlaylistShortcut) => {
  const nextPinnedId = pinnedStartPlaylistId.value === item.id ? null : item.id;
  const nextFavoriteIds = favoritePlaylistIds.value.includes(item.id)
    ? favoritePlaylistIds.value
    : [...favoritePlaylistIds.value, item.id];

  updatePreferences({
    favoritePlaylistIds: nextFavoriteIds,
    pinnedStartPlaylistId: nextPinnedId
  });
};

const toggleActionMenu = (itemId: string) => {
  activeActionMenuId.value = activeActionMenuId.value === itemId ? null : itemId;
};

const applyDeepLinkAction = () => {
  const action = typeof route.query.action === 'string' ? route.query.action : null;
  const shortcutId = typeof route.query.shortcut === 'string' ? route.query.shortcut : null;

  if (action === 'create-task') {
    openCreateForm();
    return;
  }

  if (action !== 'play' || !shortcutId) return;

  const shortcut = shortcuts.value.find((item) => item.id === shortcutId);
  if (!shortcut) return;

  openShortcut(shortcut);
};

watch(() => route.fullPath, applyDeepLinkAction, { immediate: true });
watch(() => form.provider, (provider) => {
  syncProviderIcon(provider);
});

onMounted(() => {
  if (!topCreateButton.value) return;

  createButtonObserver = new IntersectionObserver(
    ([entry]) => {
      showFloatingCreateButton.value = entry.intersectionRatio < 0.4;
    },
    {
      threshold: [0, 0.25, 0.4, 0.6, 1],
      rootMargin: '0px 0px -32px 0px'
    }
  );

  createButtonObserver.observe(topCreateButton.value);
});

onBeforeUnmount(() => {
  createButtonObserver?.disconnect();
});
</script>

<template>
  <section class="space-y-4 pb-6 sm:space-y-5">
    <section class="-mx-4 -mt-4 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-purple-600 px-4 pb-6 pt-5 text-white shadow-lg sm:mx-0 sm:mt-0 sm:rounded-[28px] sm:px-5 sm:pt-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">Musik</h2>
          <p class="mt-2 text-sm text-white/85">Schnellzugriff auf deine Playlists</p>
        </div>
        <button
          ref="topCreateButton"
          @click="openCreateForm"
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/25"
        >
          <PlusIcon class="h-5 w-5" />
        </button>
      </div>
    </section>

    <section v-if="favoriteShortcuts.length > 0" class="space-y-3">
      <div class="flex items-center gap-2 text-gray-900">
        <StarIcon class="h-5 w-5 text-amber-500" />
        <h3 class="text-lg font-semibold text-gray-900">Favoriten</h3>
      </div>

      <div class="space-y-3">
        <div v-for="item in favoriteShortcuts" :key="item.id" class="rounded-[28px] bg-gradient-to-r from-yellow-400 to-orange-500 p-5 text-white shadow-lg">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                <MusicProviderIcon :provider="item.provider" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-2xl font-semibold">{{ item.title }}</h3>
                <p class="mt-1 text-sm text-yellow-50/90">{{ providerLabels[item.provider] }}</p>
                <p v-if="pinnedStartPlaylistId === item.id" class="mt-2 text-xs font-medium text-yellow-50/95">Auf Startseite angeheftet</p>
              </div>
            </div>
            <button @click="toggleActionMenu(item.id)" class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/25">
              <EllipsisVerticalIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="mt-4 flex items-center gap-2">
            <button @click="openShortcut(item)" class="flex-1 min-h-11 rounded-[20px] bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50">
              In der Musik-App öffnen
            </button>
          </div>

          <div v-if="activeActionMenuId === item.id" class="mt-3 flex flex-col sm:flex-row gap-2">
            <button @click="toggleFavorite(item); activeActionMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-yellow-200 bg-white text-yellow-700 hover:bg-yellow-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <StarIcon class="h-4 w-4" />
              Aus Favoriten entfernen
            </button>
            <button @click="togglePinnedStartPlaylist(item); activeActionMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-fuchsia-200 bg-white text-fuchsia-700 hover:bg-fuchsia-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <MusicalNoteIcon class="h-4 w-4" />
              {{ pinnedStartPlaylistId === item.id ? 'Von Startseite lösen' : 'Auf Startseite anheften' }}
            </button>
            <button @click="editShortcut(item); activeActionMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <PencilSquareIcon class="h-4 w-4" />
              Bearbeiten
            </button>
            <button @click="removeShortcut(item.id); activeActionMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <TrashIcon class="h-4 w-4" />
              Löschen
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Alle Playlists</h3>
        <p class="text-sm text-gray-500">{{ otherShortcuts.length }} Einträge</p>
      </div>

      <div v-if="otherShortcuts.length > 0" class="space-y-3">
        <div v-for="item in otherShortcuts" :key="item.id" class="rounded-2xl border-l-4 border-fuchsia-400 bg-gray-50 px-4 py-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="mt-1 flex h-11 w-11 items-center justify-center rounded-[20px] bg-white text-fuchsia-600 shadow-sm">
                <MusicProviderIcon :provider="item.provider" class="h-5 w-5" />
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ item.title }}</p>
                <p class="mt-1 text-sm text-gray-600">{{ providerLabels[item.provider] }}</p>
                <p v-if="item.lastOpenedAt" class="mt-1 text-xs text-gray-500">Zuletzt geöffnet: {{ new Date(item.lastOpenedAt).toLocaleString('de-DE') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="toggleActionMenu(item.id)" class="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 bg-white">
                <EllipsisVerticalIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-2">
            <button @click="openShortcut(item)" class="flex-1 min-h-11 rounded-[20px] bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100">
              In der Musik-App öffnen
            </button>
          </div>

          <div v-if="activeActionMenuId === item.id" class="mt-3 flex flex-col sm:flex-row gap-2">
            <button @click="toggleFavorite(item); activeActionMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-yellow-200 bg-white text-yellow-700 hover:bg-yellow-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <StarIcon class="h-4 w-4" />
              Zu Favoriten hinzufügen
            </button>
            <button @click="togglePinnedStartPlaylist(item); activeActionMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-fuchsia-200 bg-white text-fuchsia-700 hover:bg-fuchsia-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <MusicalNoteIcon class="h-4 w-4" />
              Auf Startseite anheften
            </button>
            <button @click="editShortcut(item); activeActionMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <PencilSquareIcon class="h-4 w-4" />
              Bearbeiten
            </button>
            <button @click="removeShortcut(item.id); activeActionMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <TrashIcon class="h-4 w-4" />
              Löschen
            </button>
          </div>
        </div>
      </div>

      <section v-else-if="shortcuts.length === 0" class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center space-y-4">
        <p class="text-sm text-gray-500">Noch keine Musik-Shortcuts gespeichert.</p>
        <button @click="openCreateForm" class="inline-flex items-center gap-2 rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-600">
          <PlusIcon class="h-4 w-4" />
          Neu
        </button>
      </section>

      <section v-else class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <p class="text-sm text-gray-500">Weitere Playlists erscheinen hier unterhalb des Favoritenbereichs.</p>
      </section>
    </section>

    <button
      v-if="showFloatingCreateButton && !isFormOpen"
      @click="openCreateForm"
      class="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500 text-white shadow-lg hover:bg-fuchsia-600 sm:hidden"
    >
      <PlusIcon class="h-5 w-5" />
    </button>

    <div v-if="isFormOpen" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-6 py-4 rounded-t-2xl">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ editingId ? 'Shortcut bearbeiten' : 'Shortcut hinzufügen' }}</h3>
            <p class="text-sm text-gray-500">Playlists und Medien-Links für den Schnellstart</p>
          </div>
          <button @click="closeForm" class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 space-y-4">
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Provider-Icon</label>
              <div class="flex items-center gap-3 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50">
                <MusicProviderIcon :provider="form.provider" class="h-5 w-5" />
                <span class="text-gray-600">Wird automatisch aus dem Anbieter übernommen</span>
              </div>
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
        </div>

        <div class="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4 rounded-b-2xl">
          <button @click="closeForm" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Abbrechen</button>
          <button @click="submit" class="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-sm font-medium text-white">
            {{ editingId ? 'Shortcut speichern' : 'Shortcut hinzufügen' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
