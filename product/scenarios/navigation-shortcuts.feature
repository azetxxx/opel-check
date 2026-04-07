@epic-7
Feature: Navigation Shortcuts
  As a Gelegenheitsnutzer
  I want to save frequently visited places and navigate in one tap
  so that I don't type the same address into Google Maps every time.

  Rule: Places can be saved with a label and address

    Scenario: Save a new place
      When the user adds a place with:
        | field           | value                        |
        | label           | Werkstatt Müller             |
        | address         | Hauptstr. 42, 80333 München  |
        | defaultProvider | google                       |
      Then the place "Werkstatt Müller" appears in the saved places list

    Scenario: Edit a saved place
      Given a place "Werkstatt Müller" exists
      When the user changes the label to "Autowerkstatt Müller"
      Then the place is updated in the list

    Scenario: Delete a saved place
      Given a place "Werkstatt Müller" exists
      When the user deletes it
      Then "Werkstatt Müller" no longer appears in the list

  Rule: One-tap navigation opens the correct app via deep link

    Scenario Outline: Deep link opens the selected navigation provider
      Given a place "Werkstatt" with address "Hauptstr. 42, München"
      When the user taps navigate with provider "<provider>"
      Then a deep link is opened matching "<url_pattern>"

      Examples:
        | provider | url_pattern                                  |
        | google   | https://www.google.com/maps/search/          |
        | apple    | https://maps.apple.com/                      |
        | waze     | https://waze.com/ul                          |

  Rule: A global default navigation provider can be set

    Scenario: Default provider applies to all places
      Given the preferred map provider is "waze"
      And a place "Werkstatt" has defaultProvider "google"
      When the user taps the primary navigate button
      Then the deep link uses the place's own provider "google"
