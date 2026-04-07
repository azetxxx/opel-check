@epic-9
Feature: Authentication & Cloud Sync
  As a Familienverwalterin
  I want to optionally sign in to sync my data across devices
  so that my maintenance records aren't trapped on one phone.

  Rule: Magic link authentication requires only an email

    Scenario: Request a login link
      Given VITE_STORAGE_PROVIDER is "supabase"
      When the user enters "user@example.com" and taps "Anmelden"
      Then a magic link email is sent to "user@example.com"
      And a confirmation message is shown

  Rule: Authenticated sessions route data to Supabase

    Scenario: After login, data operations use Supabase
      Given the user has an active Supabase session
      When the user creates a vehicle
      Then the vehicle is created via the "create_vehicle_with_owner" RPC
      And a vehicle_members row exists with role "owner"

    Scenario: Without session, data stays local
      Given VITE_STORAGE_PROVIDER is "supabase"
      But the user is not authenticated
      When the user creates a vehicle
      Then the vehicle is stored in localStorage
      And no Supabase requests are made

  Rule: Logout falls back to local storage gracefully

    Scenario: Logout reverts to local mode
      Given the user is authenticated
      When the user taps "Abmelden"
      Then the Supabase session is cleared
      And subsequent data operations use localStorage
      And no errors are shown

  Rule: Session status is visible in settings

    Scenario: Logged-in user sees their email
      Given the user is authenticated as "user@example.com"
      When the user opens Settings
      Then the auth card shows "user@example.com"
      And a "Abmelden" button is visible
