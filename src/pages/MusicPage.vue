<script setup lang="ts">
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePlaylistShortcuts } from '../composables/usePlaylistShortcuts';
import type { MusicProvider, PlaylistShortcut } from '../types/music';

const route = useRoute();
const { shortcuts, upsertShortcut, removeShortcut } = usePlaylistShortcuts();

const editingId = ref<string | null>(null);
const form = reactive({
  title: '',
  provider: 'spotify' as MusicProvider,
  url: '',
  notes: '',
  icon: '🎶'
});

const providerLabels: Record<MusicProvider, string> = {
  spotify: 'Spotify',
  'youtube-music': 'YouTube Music',
  'apple-music': 'Apple Music',
  soundcloud: 'SoundCloud',
  other: 'Andere'
};

const providerOptions: MusicProvider[] = ['spotify', 'youtube-music', 'apple-music', 'soundcloud', 'other'];

const resetForm = () => {
  editingId.value = null;
  form.title = '';
  form.provider = 'spotify';
  form.url = '';
  form.notes = '';
  form.icon = '🎶';
};

const submit = () => {
  if (!form.title.trim() || !form.url.trim()) return;

  upsertShortcut({
    id: editingId.value ?? undefined,
    title: form.title.trim(),
    provider: form.provider,
    url: form.url.trim(),
    notes: form.notes.trim(),
    icon: form.icon.trim() || '🎶'
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
};

const openShortcut = (item: PlaylistShortcut) => {
  window.open(item.url, '_blank', 'noopener,noreferrer');
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

      <div v-if="shortcuts.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="item in shortcuts" :key="item.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-2xl">{{ item.icon || '🎶' }}</p>
              <h4 class="mt-2 font-semibold text-gray-900">{{ item.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ providerLabels[item.provider] }}</p>
              <p v-if="item.notes" class="text-sm text-gray-500 mt-2">{{ item.notes }}</p>
            </div>
            <div class="flex items-center gap-2">
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
