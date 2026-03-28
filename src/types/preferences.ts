import type { NavigationProvider } from './map';
import type { MusicProvider } from './music';

export type StartupModule = 'home' | 'map' | 'maintenance' | 'music' | 'settings';

export interface HomeWidgetVisibility {
  stats: boolean;
  nextTask: boolean;
  recentCompletions: boolean;
  quickPlaces: boolean;
  quickPlaylists: boolean;
  modules: boolean;
}

export interface CarModePreferences {
  enabled: boolean;
  autoOpenFavoritePlace: boolean;
  autoPlayFavoritePlaylist: boolean;
  simplifiedHome: boolean;
}

export interface AppPreferences {
  favoritePlaceId: string | null;
  favoritePlaylistId: string | null;
  preferredMapProvider: NavigationProvider;
  preferredMusicProvider: MusicProvider | 'none';
  preferredStartupModule: StartupModule;
  carMode: CarModePreferences;
  homeWidgets: HomeWidgetVisibility;
}
