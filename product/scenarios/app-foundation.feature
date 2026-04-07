@epic-1
Feature: App Foundation
  As a Gelegenheitsnutzer
  I want to open the app and start using it immediately
  so that I don't waste time on setup or account creation.

  Rule: The app loads with a usable default state on first visit

    Scenario: First visit creates a default vehicle with built-in tasks
      Given the user has never opened the app before
      And localStorage is empty
      When the app loads
      Then a vehicle named "Mein Fahrzeug" exists with brand "Opel"
      And 16 maintenance tasks exist for that vehicle
      And each built-in task has scheduleType "recurring"
      And no task has a lastCheck date

    Scenario: Built-in tasks cover all maintenance categories
      Given the default vehicle exists with built-in tasks
      Then the following categories have at least one task:
        | category     |
        | Motor        |
        | Karosserie   |
        | Beleuchtung  |
        | Reifen       |
        | Elektrik     |
        | Dokumente    |
        | Service      |
        | Klimaanlage  |

    Scenario: Built-in tasks span all recurring frequencies
      Given the default vehicle exists with built-in tasks
      Then tasks exist with the following frequencies:
        | frequency  |
        | weekly     |
        | monthly    |
        | quarterly  |
        | biannual   |
        | annual     |

  Rule: The app works without any network connection

    Scenario: All pages load from service worker cache
      Given the app has been opened at least once
      And the device has no network connection
      When the user navigates to each page
      Then the Home page loads
      And the Map page loads
      And the Maintenance page loads
      And the Music page loads
      And the Settings page loads

  Rule: The app can be installed as a PWA

    Scenario: Install banner appears on eligible devices
      Given the browser fires a "beforeinstallprompt" event
      When the user has not previously dismissed the banner
      Then the PWA install banner is visible

    Scenario: Install banner is dismissed permanently
      Given the PWA install banner is visible
      When the user dismisses the banner
      Then the banner is no longer visible
      And the banner does not appear on the next visit

  Rule: No authentication is required for local-only usage

    Scenario: App functions fully without login
      Given VITE_STORAGE_PROVIDER is "local"
      When the user creates a vehicle, marks a task done, and saves a place
      Then all data is persisted in localStorage
      And no network requests are made to Supabase
      And no auth-related errors appear in the console
