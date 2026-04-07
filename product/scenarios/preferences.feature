@epic-11
Feature: Preferences
  As a Gelegenheitsnutzer
  I want to customize how the app behaves
  so that it fits my personal workflow.

  Rule: A startup module can be configured

    Scenario Outline: App opens to the selected module
      Given preferredStartupModule is "<module>"
      When the app launches
      Then the "<page>" page is shown first

      Examples:
        | module      | page         |
        | home        | Home         |
        | map         | Map          |
        | maintenance | Maintenance  |
        | music       | Music        |
        | settings    | Settings     |

  Rule: Default navigation provider is configurable

    Scenario: Changing the map provider affects all new navigations
      Given the user sets preferredMapProvider to "apple"
      When a place has no per-place provider override
      Then tapping navigate uses Apple Maps

  Rule: Default music provider is configurable

    Scenario: Setting a preferred music provider
      Given the user sets preferredMusicProvider to "youtube-music"
      Then new playlist shortcuts default to "youtube-music"

  Rule: Per-vehicle task highlight is configurable

    Scenario: Configure which task is highlighted on home
      Given the active vehicle is "Opel Corsa"
      When the user sets the home task highlight to:
        | field  | value               |
        | taskId | <ölstand-task-uuid> |
        | alias  | Ölcheck             |
      Then the Home page shows "Ölcheck" as the maintenance highlight
      And tapping it opens the task details for "Ölstand prüfen"

    Scenario: Different vehicles have different highlights
      Given "Opel Corsa" highlights "Ölstand prüfen" as "Ölcheck"
      And "VW Golf" highlights "Reifendruck kontrollieren" as "Reifen"
      When the user switches to "VW Golf"
      Then the Home page shows "Reifen" as the highlight

  Rule: Preferences persist in localStorage (not synced to cloud)

    Scenario: Preferences survive app reload
      Given the user sets preferredStartupModule to "maintenance"
      When the app is closed and reopened
      Then preferredStartupModule is still "maintenance"

    Scenario: Preferences are per-device
      Given the user is authenticated and syncing via Supabase
      When the user sets car mode enabled on device A
      Then car mode is not enabled on device B
