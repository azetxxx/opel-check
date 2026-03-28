import type { MusicProvider } from '../types/music';

export const providerIconFallback: Record<MusicProvider, string> = {
  spotify: 'spotify',
  'youtube-music': 'youtube',
  'apple-music': 'apple',
  soundcloud: 'soundcloud',
  other: 'music'
};

export const getProviderIconFallback = (provider: MusicProvider) => providerIconFallback[provider] ?? 'music';
