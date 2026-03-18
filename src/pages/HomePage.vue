<script setup lang="ts">
import { HomeIcon, MapPinIcon, MusicalNoteIcon, WrenchScrewdriverIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline';
import { RouterLink } from 'vue-router';

const modules = [
  { title: 'Map', description: 'Saved places and quick navigation shortcuts.', to: '/map', icon: MapPinIcon },
  { title: 'Maintaining', description: 'Maintenance dashboard, tasks and service logs.', to: '/maintenance', icon: WrenchScrewdriverIcon },
  { title: 'Music', description: 'Playlists and quick media shortcuts for the car.', to: '/music', icon: MusicalNoteIcon },
  { title: 'Settings', description: 'Profiles, backup, app preferences and setup.', to: '/settings', icon: Cog6ToothIcon }
];
</script>

<template>
  <section class="space-y-6">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-start gap-4">
        <HomeIcon class="h-8 w-8 text-blue-600" />
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Home</h2>
          <p class="mt-1 text-sm text-gray-600">
            This will become the customizable landing page with dashboard widgets and quick shortcuts to all modules.
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RouterLink
        v-for="module in modules"
        :key="module.to"
        :to="module.to"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-4">
          <component :is="module.icon" class="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h3 class="font-semibold text-gray-900">{{ module.title }}</h3>
            <p class="mt-1 text-sm text-gray-600">{{ module.description }}</p>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
