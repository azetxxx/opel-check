export type MusicProvider = 'spotify' | 'youtube-music' | 'apple-music' | 'soundcloud' | 'other';

export interface PlaylistShortcut {
  id: string;
  title: string;
  provider: MusicProvider;
  url: string;
  notes?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}
