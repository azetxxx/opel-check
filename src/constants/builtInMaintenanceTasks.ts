import type { Frequency, MaintenanceTask } from '../types/maintenance';

export interface BuiltInMaintenanceTaskDefinition {
  key: string;
  description: string;
  category: string;
  frequency: NonNullable<Frequency>;
}

export const BUILT_IN_MAINTENANCE_TASKS: BuiltInMaintenanceTaskDefinition[] = [
  { key: 'engine-oil-check', description: 'Ölstand prüfen (Motoröl)', category: 'Motor', frequency: 'weekly' },
  { key: 'washer-fluid-check', description: 'Scheibenwaschanlage prüfen und nachfüllen', category: 'Karosserie', frequency: 'weekly' },
  { key: 'lights-check', description: 'Lichtfunktionen prüfen (Abblend-, Fernlicht, Bremslicht, Blinker)', category: 'Beleuchtung', frequency: 'weekly' },
  { key: 'coolant-brake-fluid-check', description: 'Kühlflüssigkeit und Bremsflüssigkeit kontrollieren', category: 'Motor', frequency: 'monthly' },
  { key: 'battery-check', description: 'Batterie prüfen (besonders im Winter)', category: 'Elektrik', frequency: 'monthly' },
  { key: 'tire-pressure-check', description: 'Reifendruck kontrollieren und anpassen', category: 'Reifen', frequency: 'monthly' },
  { key: 'wiper-check', description: 'Wischerblätter auf Schlierenbildung/Geräusche prüfen', category: 'Karosserie', frequency: 'quarterly' },
  { key: 'tire-change', description: 'Reifenwechsel (Sommer/Winter)', category: 'Reifen', frequency: 'quarterly' },
  { key: 'inspection-tuv-check', description: 'TÜV/HU/AU Fälligkeit prüfen', category: 'Dokumente', frequency: 'quarterly' },
  { key: 'underbody-wash', description: 'Unterbodenwäsche durchführen', category: 'Karosserie', frequency: 'biannual' },
  { key: 'rust-check', description: 'Roststellen kontrollieren (Kanten/Radläufe)', category: 'Karosserie', frequency: 'biannual' },
  { key: 'service-inspection', description: 'Inspektion nach Herstellervorgabe', category: 'Service', frequency: 'annual' },
  { key: 'ac-check', description: 'Klimaanlage prüfen und desinfizieren', category: 'Klimaanlage', frequency: 'annual' },
  { key: 'cabin-filter-change', description: 'Innenraumfilter (Pollenfilter) wechseln', category: 'Klimaanlage', frequency: 'annual' },
  { key: 'brakes-check', description: 'Bremsen (Beläge und Scheiben) überprüfen', category: 'Bremsen', frequency: 'annual' },
  { key: 'adac-membership-check', description: 'ADAC-Mitgliedschaft prüfen', category: 'Dokumente', frequency: 'annual' }
];

const nowIso = () => new Date().toISOString();

export const createBuiltInTaskForVehicle = (
  definition: BuiltInMaintenanceTaskDefinition,
  vehicleId: string,
  now = nowIso()
): MaintenanceTask => ({
  id: crypto.randomUUID(),
  vehicleId,
  description: definition.description,
  category: definition.category,
  scheduleType: 'recurring',
  frequency: definition.frequency,
  lastCheck: null,
  nextCheck: null,
  dueDate: null,
  notes: '',
  dueMileage: null,
  lastMileage: null,
  isCustom: false,
  isArchived: false,
  createdAt: now,
  updatedAt: now
});
