<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faApple, faSoundcloud, faSpotify, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import type { MusicProvider } from '../types/music';

const props = defineProps<{
  provider: MusicProvider;
  class?: string;
}>();

const icon = computed(() => {
  switch (props.provider) {
    case 'spotify':
      return faSpotify;
    case 'youtube-music':
      return faYoutube;
    case 'apple-music':
      return faApple;
    case 'soundcloud':
      return faSoundcloud;
    default:
      return faMusic;
  }
});

const tone = computed(() => {
  switch (props.provider) {
    case 'spotify':
      return 'text-green-500';
    case 'youtube-music':
      return 'text-red-500';
    case 'apple-music':
      return 'text-gray-900';
    case 'soundcloud':
      return 'text-orange-500';
    default:
      return 'text-slate-500';
  }
});
</script>

<template>
  <FontAwesomeIcon :icon="icon" :class="[tone, props.class || '']" />
</template>
