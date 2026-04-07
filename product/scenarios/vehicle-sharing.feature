@epic-6
Feature: Vehicle Sharing
  As a Familienverwalterin
  I want to share my vehicle with family members via invite codes
  so that we can both see and update maintenance status.

  Background:
    Given the user is authenticated via Supabase
    And VITE_STORAGE_PROVIDER is "supabase"
    And the user owns a vehicle "Opel Corsa"

  Rule: Owners can create invite codes with specific roles

    Scenario: Create a driver invite
      When the owner creates an invite with role "driver"
      Then an 8-character alphanumeric invite code is generated
      And the invite has role "driver"
      And the invite appears in the active invites list

    Scenario: Create a viewer invite
      When the owner creates an invite with role "viewer"
      Then the invite has role "viewer"

    Scenario: Invite codes use unambiguous characters
      When the owner creates an invite
      Then the code contains only characters from "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
      And the code does not contain "0", "O", "I", "1", or "L"

  Rule: Invite codes can be redeemed by authenticated users

    Scenario: Accept a valid invite code
      Given an invite code "AB3D5FGH" exists with role "driver" for "Opel Corsa"
      And another user is authenticated
      When the other user enters code "AB3D5FGH"
      Then the other user becomes a "driver" member of "Opel Corsa"
      And the invite is marked as used

    Scenario: Invite codes are case-insensitive
      Given an invite code "AB3D5FGH" exists
      When a user enters "ab3d5fgh"
      Then the invite is accepted successfully

    Scenario: Expired invite is rejected
      Given an invite code "AB3D5FGH" exists with expires_at in the past
      When a user enters "AB3D5FGH"
      Then the error "Invite expired" is shown

    Scenario: Already-used invite is rejected
      Given an invite code "AB3D5FGH" has already been redeemed
      When another user enters "AB3D5FGH"
      Then the error "Invite not found" is shown

    Scenario: Accepting an invite for an existing membership updates the role
      Given user B is already a "viewer" of "Opel Corsa"
      And an invite code exists with role "driver"
      When user B redeems the invite
      Then user B's role is updated to "driver"

  Rule: Owners can manage members

    Scenario: List all members with profiles
      Given "Opel Corsa" has members:
        | email              | role   |
        | owner@example.com  | owner  |
        | driver@example.com | driver |
      When the owner opens the sharing settings
      Then 2 members are listed with their emails and roles

    Scenario: Change a member's role
      Given user "driver@example.com" has role "driver"
      When the owner changes their role to "viewer"
      Then user "driver@example.com" has role "viewer"

    Scenario: Remove a member
      Given user "driver@example.com" is a member
      When the owner removes "driver@example.com"
      Then "driver@example.com" is no longer a member of "Opel Corsa"

  Rule: The last owner cannot be removed or downgraded

    Scenario: Cannot downgrade the only owner
      Given "Opel Corsa" has exactly one owner
      When the owner tries to change their own role to "driver"
      Then the error "Last owner cannot be downgraded" is shown
      And the owner retains role "owner"

    Scenario: Cannot remove the only owner
      Given "Opel Corsa" has exactly one owner
      When someone tries to remove the owner
      Then the error "Last owner cannot be removed" is shown

    Scenario: Can downgrade an owner when another owner exists
      Given "Opel Corsa" has 2 owners
      When one owner downgrades the other to "driver"
      Then the operation succeeds
      And 1 owner remains

  Rule: Owners can revoke unused invites

    Scenario: Revoke an active invite
      Given an unused invite code "AB3D5FGH" exists
      When the owner revokes it
      Then the invite is deleted
      And it no longer appears in the active invites list

  Rule: Sharing requires Supabase authentication

    Scenario: Sharing card shows auth warning when not logged in
      Given the user is not authenticated
      When the user opens the sharing settings
      Then a warning says "Melde dich zuerst mit Supabase an"
      And no invite or member controls are shown
