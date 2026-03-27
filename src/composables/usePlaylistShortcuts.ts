import { ref } from 'vue';
import { readRawStorage, writeStorageEnvelope } from '../utils/storage';
import { STORAGE_VERSIONS } from '../constants/storage';
import type { PlaylistShortcut } from '../types/music';

const STORAGE_KEY = 'playlist-shortcuts';
const STORAGE_VERSION = STORAGE_VERSIONS.logs;

const nowIso = () => new Date().toISOString();

const defaultShortcuts: PlaylistShortcut[] = [
  {
    id: 'playlist-roadtrip',
    title: 'Roadtrip Mix',
    provider: 'spotify',
    url: 'https://open.spotify.com/',
    notes: 'Beispiel-Link',
    icon: '🚗',
    pinned: true,
    createdAt: nowIso(),
    updatedAt: nowIso()
  },
  {
    id: 'playlist-chill',
    title: 'Chill Fahrt',
    provider: 'youtube-music',
    url: 'https://music.youtube.com/',
    notes: 'Beispiel-Link',
    icon: '🎵',
    pinned: false,
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
];

const shortcuts = ref<PlaylistShortcut[]>([]);
let initialized = false;

const normalizeMusicUrl = (provider: PlaylistShortcut['provider'], url: string) => {
  if (provider !== 'youtube-music' || !url) return url;

  try {
    const parsed = new URL(url);
    const listId = parsed.searchParams.get('list');

    if (!listId) return url;

    return `https://music.youtube.com/watch?list=${encodeURIComponent(listId)}`;
  } catch {
    const match = url.match(/[?&]list=([^&]+)/);
    if (!match?.[1]) return url;
    return `https://music.youtube.com/watch?list=${encodeURIComponent(match[1])}`;
  }
};

const normalizeShortcut = (item: Partial<PlaylistShortcut>): PlaylistShortcut => {
  const createdAt = item.createdAt ?? nowIso();
  const provider = item.provider ?? 'other';
  const url = normalizeMusicUrl(provider, item.url ?? '');

  return {
    id: item.id ?? crypto.randomUUID(),
    title: item.title ?? 'Neue Playlist',
    provider,
    url,
    notes: item.notes ?? '',
    icon: item.icon ?? '🎶',
    pinned: item.pinned ?? false,
    createdAt,
    updatedAt: item.updatedAt ?? createdAt
  };
};

export function usePlaylistShortcuts() {
  const saveShortcuts = () => {
    writeStorageEnvelope(STORAGE_KEY, STORAGE_VERSION, shortcuts.value);
  };

  const loadShortcuts = () => {
    const raw = readRawStorage(STORAGE_KEY);

    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data)) {
      shortcuts.value = (raw as { data: Partial<PlaylistShortcut>[] }).data.map(normalizeShortcut);
      saveShortcuts();
      return;
    }

    if (Array.isArray(raw)) {
      shortcuts.value = raw.map((item) => normalizeShortcut(item as Partial<PlaylistShortcut>));
      saveShortcuts();
      return;
    }

    shortcuts.value = defaultShortcuts.map(normalizeShortcut);
    saveShortcuts();
  };

  const upsertShortcut = (item: Partial<PlaylistShortcut> & Pick<PlaylistShortcut, 'title' | 'provider' | 'url'>) => {
    if (item.id) {
      const index = shortcuts.value.findIndex((entry) => entry.id === item.id);
      if (index !== -1) {
        shortcuts.value[index] = normalizeShortcut({
          ...shortcuts.value[index],
          ...item,
          id: shortcuts.value[index].id,
          createdAt: shortcuts.value[index].createdAt,
          updatedAt: nowIso()
        });
        saveShortcuts();
        return;
      }
    }

    shortcuts.value.unshift(
      normalizeShortcut({
        ...item,
        id: crypto.randomUUID(),
        createdAt: nowIso(),
        updatedAt: nowIso()
      })
    );
    saveShortcuts();
  };

  const removeShortcut = (shortcutId: string) => {
    shortcuts.value = shortcuts.value.filter((entry) => entry.id !== shortcutId);
    saveShortcuts();
  };

  if (!initialized) {
    loadShortcuts();
    initialized = true;
  }

  return {
    shortcuts,
    upsertShortcut,
    removeShortcut
  };
}
