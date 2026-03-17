import type { Frequency } from '../types/maintenance';

export const FREQUENCY_ORDER: Frequency[] = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'biannual',
  'annual'
];

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  monthly: 'Monatlich',
  quarterly: 'Vierteljährlich',
  biannual: 'Halbjährlich',
  annual: 'Jährlich'
};

export const CATEGORY_CLASSES: Record<string, string> = {
  Motor: 'bg-red-100 text-red-800',
  Reifen: 'bg-blue-100 text-blue-800',
  Bremsen: 'bg-yellow-100 text-yellow-800',
  Karosserie: 'bg-purple-100 text-purple-800',
  Beleuchtung: 'bg-green-100 text-green-800',
  Elektrik: 'bg-orange-100 text-orange-800',
  Dokumente: 'bg-slate-100 text-slate-800',
  Service: 'bg-emerald-100 text-emerald-800',
  Klimaanlage: 'bg-cyan-100 text-cyan-800'
};

export const DEFAULT_CATEGORY_CLASS = 'bg-gray-100 text-gray-800';
