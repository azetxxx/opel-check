import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['car-maintenance.svg', 'apple-touch-icon.svg', 'pwa-192.svg', 'pwa-512.svg'],
      manifest: {
        name: 'Omiigo Car',
        short_name: 'Omiigo Car',
        description: 'Modularer Car-Companion mit Wartung, Karte, Musik und Einstellungen.',
        theme_color: '#2563eb',
        background_color: '#eff6ff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'de',
        // Chromium (incl. Android): prefer opening in-scope links in the installed PWA when possible.
        // Does not force email clients to hand off to the PWA; a native shell (TWA/Capacitor) is the full fix.
        handle_links: 'preferred',
        launch_handler: {
          client_mode: ['navigate-existing', 'focus-existing']
        },
        icons: [
          {
            src: '/pwa-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}']
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  base: '/'
});
