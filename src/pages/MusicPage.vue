<script setup lang="ts">
import { PencilSquareIcon, PlusIcon, StarIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { EllipsisHorizontalIcon } from '@heroicons/vue/20/solid';
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
const favoritePlaylistId = computed(() => preferences.value.favoritePlaylistId);

const sortedShortcuts = computed(() => {
  return [...shortcuts.value].sort((a, b) => {
    if (a.id === favoritePlaylistId.value) return -1;
    if (b.id === favoritePlaylistId.value) return 1;
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

const lastOpenedShortcut = computed(() => {
  return [...shortcuts.value]
    .filter((item) => item.lastOpenedAt)
    .sort((a, b) => new Date(b.lastOpenedAt!).getTime() - new Date(a.lastOpenedAt!).getTime())[0] ?? null;
});

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
  updatePreferences({
    favoritePlaylistId: favoritePlaylistId.value === item.id ? null : item.id
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
  <section class="space-y-5 sm:space-y-6 pb-4">
    <div v-if="lastOpenedShortcut" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-gray-900">Zuletzt geöffnet</h3>
          <span class="text-xs text-gray-500">{{ lastOpenedShortcut.lastOpenedAt ? new Date(lastOpenedShortcut.lastOpenedAt).toLocaleString('de-DE') : '' }}</span>
        </div>
        <div class="mt-4 rounded-xl bg-gray-50 px-4 py-4">
          <div class="flex items-center gap-2 text-2xl">
            <MusicProviderIcon :provider="lastOpenedShortcut.provider" class="h-6 w-6" />
          </div>
          <p class="mt-2 font-semibold text-gray-900">{{ lastOpenedShortcut.title }}</p>
          <p class="mt-1 text-sm text-gray-600">{{ providerLabels[lastOpenedShortcut.provider] }}</p>
          <button @click="openShortcut(lastOpenedShortcut)" class="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black">
            Erneut öffnen
          </button>
        </div>
      </section>
    </div>

    <section class="space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h3 class="text-lg font-semibold text-gray-900">Playlists</h3>
        <div class="flex items-center gap-3 flex-wrap">
          <p class="hidden text-sm text-gray-500 sm:block">{{ shortcuts.length }} Einträge gespeichert</p>
          <button ref="topCreateButton" @click="openCreateForm" class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100">
            <PlusIcon class="h-4 w-4" />
            Neu
          </button>
        </div>
      </div>

      <div v-if="sortedShortcuts.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="item in sortedShortcuts" :key="item.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <MusicProviderIcon :provider="item.provider" class="h-6 w-6" />
                </div>
                <span v-if="favoritePlaylistId === item.id" class="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Favorit</span>
                <span v-else-if="item.pinned" class="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">Angeheftet</span>
              </div>
              <h4 class="mt-2 font-semibold text-gray-900">{{ item.title }}</h4>
              <div class="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <p>{{ providerLabels[item.provider] }}</p>
                <span v-if="preferredMusicProvider !== 'none' && item.provider === preferredMusicProvider" class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">Bevorzugt</span>
              </div>
              <p v-if="item.notes" class="text-sm text-gray-500 mt-2">{{ item.notes }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="toggleFavorite(item)" class="p-2.5 rounded-lg border border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                <StarIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex gap-2">
              <button @click="openShortcut(item)" class="flex-1 min-h-11 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black">
                In der Musik-App öffnen
              </button>
              <button
                @click="toggleActionMenu(item.id)"
                class="min-h-11 min-w-11 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center"
              >
                <EllipsisHorizontalIcon class="h-5 w-5" />
              </button>
            </div>

            <div v-if="item.lastOpenedAt" class="rounded-xl bg-gray-50 px-4 py-3">
              <p class="text-xs text-gray-500">Zuletzt geöffnet: {{ new Date(item.lastOpenedAt).toLocaleString('de-DE') }}</p>
            </div>

            <div v-if="activeActionMenuId === item.id" class="flex flex-col sm:flex-row gap-2">
              <button @click="editShortcut(item); activeActionMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <PencilSquareIcon class="h-4 w-4" />
                Bearbeiten
              </button>

              <button @click="removeShortcut(item.id); activeActionMenuId = null" class="min-h-11 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <TrashIcon class="h-4 w-4" />
                Löschen
              </button>
            </div>
          </div>
        </div>
      </div>

      <section v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 text-center space-y-4">
        <p class="text-sm text-gray-500">Noch keine Musik-Shortcuts gespeichert.</p>
        <button @click="openCreateForm" class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100">
          <PlusIcon class="h-4 w-4" />
          Neu
        </button>
      </section>
    </section>

    <button
      v-if="showFloatingCreateButton && !isFormOpen"
      @click="openCreateForm"
      class="fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700 sm:hidden"
    >
      <PlusIcon class="h-4 w-4" />
      Neu
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
          <button @click="submit" class="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white">
            {{ editingId ? 'Shortcut speichern' : 'Shortcut hinzufügen' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
