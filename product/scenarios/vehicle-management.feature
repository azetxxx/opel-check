@epic-5
Feature: Vehicle Management
  As a Familienverwalterin
  I want to create, edit, switch, and delete vehicles
  so that each car in my household is tracked independently.

  Rule: Vehicle profiles store essential identity fields

    Scenario: Edit a vehicle's full profile
      Given a vehicle "Mein Fahrzeug" exists
      When the user opens the vehicle profile editor
      And updates the following fields:
        | field          | value        |
        | name           | Opel Corsa   |
        | plate          | M-AB 1234    |
        | brand          | Opel         |
        | model          | Corsa        |
        | year           | 2018         |
        | currentMileage | 125000       |
        | symbol         | car-side     |
        | notes          | Familienauto |
      And saves the profile
      Then the vehicle has all updated fields
      And the vehicle's updatedAt is refreshed

    Scenario: Empty name defaults to "Mein Fahrzeug"
      Given a vehicle profile editor is open
      When the user clears the name field and saves
      Then the vehicle's name is "Mein Fahrzeug"

  Rule: Multiple vehicles are supported with independent task sets

    Scenario: Create a second vehicle
      Given one vehicle "Opel Corsa" exists
      When the user creates a new vehicle
      Then 2 vehicles exist
      And the new vehicle has 16 built-in maintenance tasks
      And the new vehicle's tasks are independent of "Opel Corsa" tasks

    Scenario: Switch active vehicle
      Given "Opel Corsa" and "VW Golf" exist
      And "Opel Corsa" is the active vehicle
      When the user switches to "VW Golf"
      Then "VW Golf" is the active vehicle
      And the Home page shows "VW Golf" in the vehicle card
      And the Maintenance page shows only "VW Golf" tasks

  Rule: Vehicles can be deleted

    Scenario: Delete a vehicle
      Given "Opel Corsa" and "VW Golf" exist
      When the user deletes "VW Golf"
      Then only "Opel Corsa" exists
      And "Opel Corsa" is the active vehicle

    Scenario: Delete the last vehicle triggers new vehicle creation
      Given only "Opel Corsa" exists
      When the user deletes "Opel Corsa"
      Then the vehicle create modal opens
      And the user must create a new vehicle to continue

  Rule: Each vehicle has a selectable icon

    Scenario Outline: Vehicle symbol options
      When the user selects symbol "<symbol>"
      Then the vehicle card shows the corresponding icon

      Examples:
        | symbol      |
        | car         |
        | car-side    |
        | car-rear    |
        | van-shuttle |
        | truck       |
        | gas-pump    |
        | oil-can     |
        | gauge-high  |
        | car-burst   |

  Rule: Mileage can be updated from the home page

    Scenario: Quick mileage update
      Given the vehicle has mileage 125000
      When the user taps the mileage on the Home page
      And enters 126500
      And confirms
      Then the vehicle's currentMileage is 126500
