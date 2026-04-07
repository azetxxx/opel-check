@epic-2
Feature: Home Dashboard
  As an Alltagsfahrer
  I want to see my car's maintenance status at a glance
  so that I know if anything needs attention without navigating deeper.

  Background:
    Given the active vehicle is "Opel Corsa" with mileage 125000

  Rule: The dashboard shows the active vehicle's identity

    Scenario: Vehicle card displays name, brand, and mileage
      Given the vehicle has name "Opel Corsa", brand "Opel", and mileage 125000
      When the Home page loads
      Then the vehicle card shows "Opel Corsa"
      And the vehicle card shows "Opel"
      And the vehicle card shows "125.000 km"

  Rule: The next-task highlight reflects the most urgent maintenance item

    Scenario: Overdue task appears as highlight
      Given a task "Ölstand prüfen" is overdue by 3 days
      And a task "Reifendruck kontrollieren" is due in 5 days
      When the Home page loads
      Then the maintenance highlight shows "Ölstand prüfen"

    Scenario: No tasks overdue shows the next due-soon task
      Given no tasks are overdue
      And a task "Reifendruck kontrollieren" is due in 3 days
      When the Home page loads
      Then the maintenance highlight shows "Reifendruck kontrollieren"

  Rule: Home widgets can be individually toggled

    Scenario: Hiding a widget removes it from the dashboard
      Given the "quickPlaces" widget is visible
      When the user disables the "quickPlaces" widget in preferences
      And the Home page reloads
      Then the quick-places section is not visible

    Scenario: All widgets visible by default
      Given default preferences
      When the Home page loads
      Then the following widgets are visible:
        | widget              |
        | stats               |
        | nextTask            |
        | recentCompletions   |
        | quickPlaces         |
        | quickPlaylists      |
        | modules             |

  Rule: Quick links navigate to the correct modules

    Scenario Outline: Quick link opens the target page
      When the user taps the "<module>" quick link
      Then the app navigates to "<route>"

      Examples:
        | module   | route         |
        | Ziele    | /map          |
        | Musik    | /music        |
        | Wartung  | /maintenance  |

  Rule: Car mode simplifies the home screen for driving

    Scenario: Car mode hides non-essential widgets
      Given car mode is enabled with simplifiedHome = true
      When the Home page loads
      Then only the vehicle card and maintenance highlight are visible
      And the module quick links are hidden

    Scenario: Car mode auto-opens favorite place
      Given car mode is enabled with autoOpenFavoritePlace = true
      And a place "Werkstatt" is pinned as favorite
      When the Home page loads
      Then the navigation deep link for "Werkstatt" opens automatically
