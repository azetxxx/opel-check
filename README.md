# Omiigo Car – Wartungscheckliste

Eine lokale Web-Anwendung zur Verwaltung und Nachverfolgung von Fahrzeugwartungen.

## Aktueller Stack

- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- Heroicons
- localStorage für lokale Datenpersistenz

## Aktueller Stand

Die App läuft aktuell **lokal-first**:
- Wartungsaufgaben werden im Browser gespeichert
- Wartungsprotokolle werden im Browser gespeichert
- keine Backend- oder Firebase-Abhängigkeit für die Funktionalität

Das ist sinnvoll für die lokale Weiterentwicklung, bevor später ein produktionsreifer Sync- oder Backend-Ansatz ergänzt wird.

## Features

- Wartungsaufgaben mit Intervallen
- Statusanzeige für offen / aktuell / überfällig
- Protokollierung erledigter Wartungen
- Mobile-friendly UI
- lokale Speicherung im Browser
- Debug-Modus mit simuliertem Datum

## Entwicklung

### Voraussetzungen

- Node.js 20+ empfohlen
- npm

### Installation

```bash
npm install
```

### Entwicklungsserver starten

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

## Datenhaltung

Die App nutzt aktuell `localStorage` mit diesen Keys:

- `maintenance-tasks`
- `maintenance-logs`

Hinweis:
`localStorage` ist browser- und gerätegebunden. Daten werden nicht automatisch zwischen Geräten synchronisiert.

## Nächste sinnvolle Schritte vor Production

1. Komponenten weiter aufteilen
2. Geschäftslogik aus `App.vue` in Utilities/Composables verschieben
3. Datenmodell für mehrere Fahrzeuge vorbereiten
4. Export/Import für lokale Backups ergänzen
5. später optional Auth + Cloud-Sync ergänzen

## Hinweis zum bisherigen Firebase-Ansatz

Der Code wurde auf lokale Nutzung zurückgestellt. Falls später Production-Sync gebraucht wird, sollte die Cloud-Strategie sauber neu eingeführt werden statt Aufgaben lokal und Logs remote zu mischen.
