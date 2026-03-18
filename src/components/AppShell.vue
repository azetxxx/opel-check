<script setup lang="ts">
import { HomeIcon, MapIcon, WrenchScrewdriverIcon, MusicalNoteIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { name: 'Start', to: '/', icon: HomeIcon },
  { name: 'Karte', to: '/map', icon: MapIcon },
  { name: 'Wartung', to: '/maintenance', icon: WrenchScrewdriverIcon },
  { name: 'Musik', to: '/music', icon: MusicalNoteIcon },
  { name: 'Einstellungen', to: '/settings', icon: Cog6ToothIcon }
];

const currentTitle = computed(() => navItems.find((item) => item.to === route.path)?.name ?? 'Omiigo Car');
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <header class="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Omiigo Car</p>
          <h1 class="text-xl font-bold text-gray-900">{{ currentTitle }}</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 pb-24">
      <RouterView />
    </main>

    <nav class="fixed bottom-0 inset-x-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div class="max-w-7xl mx-auto grid grid-cols-5">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors"
          :class="route.path === item.to ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span>{{ item.name }}</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>
