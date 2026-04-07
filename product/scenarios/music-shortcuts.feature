@epic-8
Feature: Music Shortcuts
  As a Gelegenheitsnutzer
  I want to save playlist links and open them in one tap
  so that I can start my driving music without searching through Spotify.

  Rule: Playlists can be saved with provider and URL

    Scenario: Save a Spotify playlist
      When the user adds a playlist with:
        | field    | value                                           |
        | title    | Road Trip Mix                                   |
        | provider | spotify                                         |
        | url      | https://open.spotify.com/playlist/abc123         |
      Then the playlist "Road Trip Mix" appears in the list
      And it shows the Spotify provider icon

    Scenario: Save a YouTube Music playlist
      When the user adds a playlist with provider "youtube-music"
      Then the playlist shows the YouTube Music icon

  Rule: One-tap opens the playlist URL

    Scenario: Tap opens the URL
      Given a playlist "Road Trip Mix" with url "https://open.spotify.com/playlist/abc123"
      When the user taps "Road Trip Mix"
      Then the URL is opened in a new tab/app
      And the playlist's lastOpenedAt is updated

  Rule: Playlists can be favorited and pinned

    Scenario: Favorite a playlist to show on home
      Given a playlist "Road Trip Mix" exists
      When the user marks it as favorite
      Then "Road Trip Mix" appears in the home quick-playlists widget

    Scenario: Pin a playlist for car mode
      Given a playlist "Road Trip Mix" is set as pinnedStartPlaylistId
      And car mode with autoPlayFavoritePlaylist is enabled
      When the app opens in car mode
      Then "Road Trip Mix" opens automatically

  Rule: Playlists are sorted by last opened

    Scenario: Recently opened playlists appear first
      Given playlists exist:
        | title          | lastOpenedAt |
        | Road Trip Mix  | 2026-04-01   |
        | Chill Vibes    | 2026-04-03   |
        | Workout Beats  | 2026-03-28   |
      When the Music page loads
      Then the order is "Chill Vibes", "Road Trip Mix", "Workout Beats"
