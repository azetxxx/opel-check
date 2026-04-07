@epic-3
Feature: Maintenance Task Management
  As an Alltagsfahrer
  I want to see, create, edit, and organize my maintenance tasks
  so that my checklist reflects what my car actually needs.

  Background:
    Given the active vehicle is "Opel Corsa"
    And built-in tasks have been loaded for this vehicle

  Rule: Tasks are grouped by urgency status

    Scenario: Tasks appear in the correct status sections
      Given the following tasks exist:
        | description               | lastCheck    | frequency | scheduleType | dueDate     |
        | Ölstand prüfen            | 40 days ago  | weekly    | recurring    |             |
        | Reifendruck kontrollieren | 26 days ago  | monthly   | recurring    |             |
        | TÜV Termin                |              |           | scheduled    | in 15 days  |
        | Batterie prüfen           | 2 days ago   | monthly   | recurring    |             |
        | Bremsen überprüfen        |              |           | recurring    |             |
      When the Maintenance page loads
      Then "Ölstand prüfen" appears in the "Dringend" section
      And "Reifendruck kontrollieren" appears in the "Bald fällig" section
      And "TÜV Termin" appears in the "Geplant" section
      And "Bremsen überprüfen" appears in the "Offen" section
      And "Batterie prüfen" appears in the "Erledigt" section

    Scenario: Sections can be collapsed and expanded
      When the user taps the "Erledigt" section header
      Then the "Erledigt" section tasks are hidden
      When the user taps the "Erledigt" section header again
      Then the "Erledigt" section tasks are visible

  Rule: Custom tasks can be created with full control

    Scenario: Create a recurring custom task
      When the user taps the create button
      And fills in:
        | field        | value                    |
        | description  | Scheinwerfer polieren    |
        | category     | Karosserie               |
        | scheduleType | recurring                |
        | frequency    | quarterly                |
      And saves the task
      Then a task "Scheinwerfer polieren" exists for "Opel Corsa"
      And the task has isCustom = true
      And the task appears in the "Offen" section

    Scenario: Create a scheduled one-off task
      When the user taps the create button
      And fills in:
        | field        | value               |
        | description  | TÜV am 15.06.      |
        | category     | Dokumente           |
        | scheduleType | scheduled           |
        | dueDate      | 2026-06-15          |
      And saves the task
      Then a task "TÜV am 15.06." exists with scheduleType "scheduled"
      And the task has a dueDate of "2026-06-15"
      And the task has frequency null

  Rule: Existing tasks can be edited

    Scenario: Edit a task's description and frequency
      Given a custom task "Scheinwerfer polieren" with frequency "quarterly"
      When the user opens the edit modal for "Scheinwerfer polieren"
      And changes the frequency to "biannual"
      And saves
      Then the task has frequency "biannual"
      And the task's updatedAt is refreshed

  Rule: Built-in tasks can be archived but not deleted

    Scenario: Archive a built-in task
      Given a built-in task "ADAC-Mitgliedschaft prüfen" with isCustom = false
      When the user deletes "ADAC-Mitgliedschaft prüfen"
      Then the task has isArchived = true
      And the task no longer appears in the task list

    Scenario: Restore an archived built-in task
      Given "ADAC-Mitgliedschaft prüfen" is archived
      When the user restores "ADAC-Mitgliedschaft prüfen" via demo restore
      Then the task has isArchived = false
      And the task appears in the task list

  Rule: Custom tasks are permanently deleted

    Scenario: Delete a custom task
      Given a custom task "Scheinwerfer polieren"
      When the user deletes "Scheinwerfer polieren"
      Then the task no longer exists in storage

  Rule: Tasks are scoped to the active vehicle

    Scenario: Switching vehicles shows only that vehicle's tasks
      Given "Opel Corsa" has 16 tasks
      And "VW Golf" has 16 tasks
      When the user switches the active vehicle to "VW Golf"
      Then only "VW Golf" tasks are visible on the Maintenance page
