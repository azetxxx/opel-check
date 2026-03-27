export type NavigationProvider = 'google' | 'apple' | 'waze';

export interface SavedPlace {
  id: string;
  label: string;
  address: string;
  notes?: string;
  icon?: string;
  providers: NavigationProvider[];
  defaultProvider: NavigationProvider;
  createdAt: string;
  updatedAt: string;
}
