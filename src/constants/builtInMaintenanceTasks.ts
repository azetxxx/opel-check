import type { Frequency, MaintenanceTask } from '../types/maintenance';

export interface BuiltInMaintenanceTaskDefinition {
  key: string;
  description: string;
  category: string;
  frequency: NonNullable<Frequency>;
}

export const BUILT_IN_MAINTENANCE_TASKS: BuiltInMaintenanceTaskDefinition[] = [
  { key: 'tire-pressure-check', description: 'Reifendruck prüfen', category: 'Reifen', frequency: 'biweekly' },
  { key: 'lights-check', description: 'Lichtfunktionen prüfen', category: 'Beleuchtung', frequency: 'biweekly' },
  { key: 'washer-fluid-check', description: 'Scheibenwaschanlage prüfen / nachfüllen', category: 'Karosserie', frequency: 'biweekly' },
  { key: 'engine-oil-check', description: 'Ölstand prüfen', category: 'Motor', frequency: 'monthly' },
  { key: 'battery-check', description: 'Batterie prüfen', category: 'Elektrik', frequency: 'monthly' },
  { key: 'brakes-check', description: 'Bremsen prüfen', category: 'Bremsen', frequency: 'quarterly' },
  { key: 'service-inspection', description: 'Inspektion nach Herstellervorgabe', category: 'Service', frequency: 'annual' }
];

export const ACTIVE_BUILT_IN_TASK_DESCRIPTIONS = new Set(BUILT_IN_MAINTENANCE_TASKS.map((task) => task.description));

export const LEGACY_BUILT_IN_TASK_DESCRIPTIONS = new Set([
  'Ölstand prüfen (Motoröl)',
  'Scheibenwaschanlage prüfen und nachfüllen',
  'Lichtfunktionen prüfen (Abblend-, Fernlicht, Bremslicht, Blinker)',
  'Kühlflüssigkeit und Bremsflüssigkeit kontrollieren',
  'Batterie prüfen (besonders im Winter)',
  'Reifendruck kontrollieren und anpassen',
  'Wischerblätter auf Schlierenbildung/Geräusche prüfen',
  'Reifenwechsel (Sommer/Winter)',
  'TÜV/HU/AU Fälligkeit prüfen',
  'Unterbodenwäsche durchführen',
  'Roststellen kontrollieren (Kanten/Radläufe)',
  'Klimaanlage prüfen und desinfizieren',
  'Innenraumfilter (Pollenfilter) wechseln',
  'Bremsen (Beläge und Scheiben) überprüfen',
  'ADAC-Mitgliedschaft prüfen'
]);

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
