@epic-10
Feature: Backup & Debug Tools
  As an Alltagsfahrer
  I want to export and import my data
  so that I can recover from data loss or migrate to a new device.

  Rule: JSON export includes all vehicles, tasks, and logs

    Scenario: Export creates a complete backup file
      Given 2 vehicles exist with tasks and logs
      When the user taps "Backup exportieren"
      Then a JSON file is downloaded
      And the file contains all vehicle profiles
      And the file contains all maintenance tasks
      And the file contains all maintenance logs

  Rule: JSON import restores data from a backup file

    Scenario: Import replaces current data with backup
      Given the user has a valid backup JSON file
      When the user imports the file
      Then the vehicles match the backup
      And the tasks match the backup
      And the logs match the backup

    Scenario: Import rejects invalid JSON
      Given the user selects a file that is not valid JSON
      When the import is attempted
      Then an error message is shown
      And existing data is unchanged

  Rule: Developer tools are hidden by default

    Scenario: Demo button is hidden without developer flag
      Given preferences.developer.showDemoDataButton is false
      When the Maintenance page loads
      Then the "Demo" button is not visible

    Scenario: Enabling developer mode shows debug tools
      Given the user enables showDemoDataButton in preferences
      When the Maintenance page loads
      Then the "Demo" button is visible

  Rule: Simulated date overrides the system clock for testing

    Scenario: Simulated date affects task status computation
      Given today is "2026-04-03"
      And a task was last checked "2026-04-01" with frequency "weekly"
      When the developer sets simulated date to "2026-04-15"
      Then the task status changes from "done" to "overdue"
