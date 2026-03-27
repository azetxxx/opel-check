export type StartupModule = 'home' | 'map' | 'maintenance' | 'music' | 'settings';

export interface HomeWidgetVisibility {
  stats: boolean;
  nextTask: boolean;
  recentCompletions: boolean;
  quickPlaces: boolean;
  quickPlaylists: boolean;
  modules: boolean;
}

export interface AppPreferences {
  favoritePlaceId: string | null;
  favoritePlaylistId: string | null;
  preferredStartupModule: StartupModule;
  homeWidgets: HomeWidgetVisibility;
}
