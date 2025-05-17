import { ref, onMounted } from 'vue';
import type { MaintenanceTask, MaintenanceCategory, Frequency } from '../types/maintenance';
import { frequencyToDays } from '../types/maintenance';

const STORAGE_KEY = 'maintenance-data';

// Helper function to calculate next due date
const calculateNextDate = (lastDate: string, days: number): string => {
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().split('T')[0];
};

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Get dates for different periods
const yesterday = calculateNextDate(today, -1);
const lastWeek = calculateNextDate(today, -7);
const lastMonth = calculateNextDate(today, -30);
const threeMonthsAgo = calculateNextDate(today, -90);
const sixMonthsAgo = calculateNextDate(today, -180);
const lastYear = calculateNextDate(today, -365);

export function useMaintenanceData() {
  const maintenanceSchedule = ref<MaintenanceCategory[]>([
    {
      title: 'Täglich oder vor jeder Fahrt (Sichtprüfung)',
      frequency: 'daily',
      tasks: [
        { id: 'daily-1', description: 'Kontrolliere den Reifendruck und das Reifenprofil (mind. 1,6 mm, besser 3 mm)', lastChecked: null, nextDueDate: null, frequency: 'daily' },
        { id: 'daily-2', description: 'Überprüfe auf sichtbare Schäden (z. B. an Scheinwerfern, Scheiben, Karosserie)', lastChecked: null, nextDueDate: null, frequency: 'daily' },
        { id: 'daily-3', description: 'Kontrolliere, ob Warnleuchten im Cockpit aufleuchten', lastChecked: null, nextDueDate: null, frequency: 'daily' },
      ]
    },
    {
      title: 'Wöchentlich',
      frequency: 'weekly',
      tasks: [
        { id: 'weekly-1', description: 'Kontrolliere den Ölstand (Motoröl)', lastChecked: lastWeek, nextDueDate: today, frequency: 'weekly' },
        { id: 'weekly-2', description: 'Überprüfe die Scheibenwaschanlage und fülle bei Bedarf Frostschutz bzw. Wasser nach', lastChecked: today, nextDueDate: calculateNextDate(today, 7), frequency: 'weekly' },
        { id: 'weekly-3', description: 'Prüfe die Funktion von Licht (Abblendlicht, Fernlicht, Bremslicht, Blinker)', lastChecked: calculateNextDate(today, -10), nextDueDate: calculateNextDate(calculateNextDate(today, -10), 7), frequency: 'weekly' },
      ]
    },
    {
      title: 'Monatlich',
      frequency: 'monthly',
      tasks: [
        { id: 'monthly-1', description: 'Kontrolliere den Stand von Kühlflüssigkeit und Bremsflüssigkeit', lastChecked: lastMonth, nextDueDate: today, frequency: 'monthly' },
        { id: 'monthly-2', description: 'Prüfe die Batterie (v. a. im Winter)', lastChecked: today, nextDueDate: calculateNextDate(today, 30), frequency: 'monthly' },
        { id: 'monthly-3', description: 'Ggf. Reifendruck nachjustieren (z. B. bei Temperaturwechsel)', lastChecked: calculateNextDate(today, -40), nextDueDate: calculateNextDate(calculateNextDate(today, -40), 30), frequency: 'monthly' },
      ]
    },
    {
      title: 'Vierteljährlich oder saisonal',
      frequency: 'quarterly',
      tasks: [
        { id: 'quarterly-1', description: 'Kontrolliere Wischerblätter auf Schlierenbildung oder Geräusche', lastChecked: threeMonthsAgo, nextDueDate: today, frequency: 'quarterly' },
        { id: 'quarterly-2', description: 'Reifentausch: Sommer- auf Winterreifen (ca. Oktober bis Ostern) und zurück', lastChecked: today, nextDueDate: calculateNextDate(today, 90), frequency: 'quarterly' },
        { id: 'quarterly-3', description: 'Prüfe, ob TÜV bzw. HU/AU bald fällig sind', lastChecked: calculateNextDate(today, -100), nextDueDate: calculateNextDate(calculateNextDate(today, -100), 90), frequency: 'quarterly' },
      ]
    },
    {
      title: 'Halbjährlich',
      frequency: 'biannual',
      tasks: [
        { id: 'biannual-1', description: 'Unterbodenwäsche (z. B. nach dem Winter, um Salzrückstände zu entfernen)', lastChecked: sixMonthsAgo, nextDueDate: today, frequency: 'biannual' },
        { id: 'biannual-2', description: 'Kontrolle auf Roststellen, vor allem an Kanten und Radläufen', lastChecked: calculateNextDate(today, -190), nextDueDate: calculateNextDate(calculateNextDate(today, -190), 180), frequency: 'biannual' },
      ]
    },
    {
      title: 'Jährlich',
      frequency: 'annual',
      tasks: [
        { id: 'annual-1', description: 'Inspektion nach Herstellervorgabe (meist im Serviceheft vermerkt)', lastChecked: lastYear, nextDueDate: today, frequency: 'annual' },
        { id: 'annual-2', description: 'Klimaanlage prüfen und ggf. desinfizieren', lastChecked: today, nextDueDate: calculateNextDate(today, 365), frequency: 'annual' },
        { id: 'annual-3', description: 'Innenraumfilter (Pollenfilter) wechseln', lastChecked: null, nextDueDate: null, frequency: 'annual' },
        { id: 'annual-4', description: 'Bremsen (Beläge und Scheiben) überprüfen lassen', lastChecked: calculateNextDate(today, -400), nextDueDate: calculateNextDate(calculateNextDate(today, -400), 365), frequency: 'annual' },
        { id: 'annual-5', description: 'ADAC-Mitgliedschaft prüfen (z. B. ob alle Fahrzeuge/Personen erfasst sind)', lastChecked: calculateNextDate(today, -10), nextDueDate: calculateNextDate(calculateNextDate(today, -10), 365), frequency: 'annual' },
      ]
    }
  ]);

  const calculateNextDueDate = (frequency: Frequency, lastChecked: string): string => {
    const days = frequencyToDays[frequency];
    const nextDate = new Date(lastChecked);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate.toISOString().split('T')[0];
  };

  const markTaskChecked = (taskId: string) => {
    const today = new Date().toISOString().split('T')[0];

    maintenanceSchedule.value.forEach((category: MaintenanceCategory) => {
      // Skip daily tasks
      if (category.frequency === 'daily') return;

      category.tasks.forEach((task: MaintenanceTask) => {
        if (task.id === taskId) {
          task.lastChecked = today;
          task.nextDueDate = calculateNextDueDate(task.frequency, today);
        }
      });
    });

    // Save to localStorage
    saveToLocalStorage();
  };

  const saveToLocalStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maintenanceSchedule.value));
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      maintenanceSchedule.value = JSON.parse(saved);
    }
  };

  onMounted(() => {
    loadFromLocalStorage();
  });

  return {
    maintenanceSchedule,
    markTaskChecked
  };
}
