@epic-4
Feature: Task Completion & Logging
  As an Alltagsfahrer
  I want to mark tasks as done in one tap and have the next due date computed automatically
  so that I have a maintenance record without filling out forms.

  Background:
    Given the active vehicle is "Opel Corsa" with mileage 125000
    And today is "2026-04-03"

  Rule: Marking a recurring task done computes the next due date

    Scenario Outline: Next due date is calculated from frequency
      Given a recurring task "<task>" with frequency "<frequency>" and no lastCheck
      When the user marks "<task>" as done
      Then the task's lastCheck is "2026-04-03"
      And the task's nextCheck is "<nextCheck>"
      And the task's lastMileage is 125000

      Examples:
        | task                          | frequency  | nextCheck   |
        | Ölstand prüfen                | weekly     | 2026-04-10  |
        | Reifendruck kontrollieren     | monthly    | 2026-05-03  |
        | Wischerblätter prüfen         | quarterly  | 2026-07-02  |
        | Unterbodenwäsche              | biannual   | 2026-09-30  |
        | Inspektion nach Herstellervorgabe | annual | 2027-04-03  |

  Rule: Each completion creates an immutable log entry

    Scenario: Log entry records task details and mileage
      Given a recurring task "Ölstand prüfen" with frequency "weekly"
      When the user marks "Ölstand prüfen" as done
      Then a maintenance log exists with:
        | field            | value              |
        | taskDescription  | Ölstand prüfen     |
        | category         | Motor              |
        | frequency        | weekly             |
        | checkedAt        | 2026-04-03         |
        | mileage          | 125000             |
        | nextDueDate      | 2026-04-10         |

    Scenario: Multiple completions create separate log entries
      Given "Ölstand prüfen" was marked done on "2026-03-27"
      When the user marks "Ölstand prüfen" as done again
      Then 2 log entries exist for "Ölstand prüfen"
      And the latest log has checkedAt "2026-04-03"

  Rule: Marking a scheduled task done records it without computing next date

    Scenario: Scheduled task completion has no nextCheck
      Given a scheduled task "TÜV Termin" with dueDate "2026-06-15"
      When the user marks "TÜV Termin" as done
      Then the task's lastCheck is "2026-04-03"
      And the task's nextCheck is null
      And the log's nextDueDate is "2026-06-15"

  Rule: Log history is viewable and sorted by date

    Scenario: Log modal shows entries newest-first
      Given the following log entries exist:
        | taskDescription | checkedAt  |
        | Ölstand prüfen  | 2026-03-01 |
        | Reifendruck     | 2026-03-15 |
        | Batterie prüfen | 2026-04-01 |
      When the user opens the log modal
      Then the first entry shown is "Batterie prüfen" (2026-04-01)
      And the last entry shown is "Ölstand prüfen" (2026-03-01)

  Rule: Task status transitions correctly after completion

    Scenario: Overdue task moves to done after completion
      Given a task "Ölstand prüfen" that is 5 days overdue
      When the user marks "Ölstand prüfen" as done
      Then the task appears in the "Erledigt" section
      And the task no longer appears in the "Dringend" section

  Rule: Simulated date affects status computation (developer mode)

    Scenario: Setting a future simulated date changes task statuses
      Given a task "Reifendruck kontrollieren" was last checked today
      And the task has frequency "monthly"
      And the task appears in the "Erledigt" section
      When the developer enables simulated date "2026-05-10"
      Then the task appears in the "Dringend" section
