<script setup lang="ts">
defineProps<{
  message: string;
  tone?: 'success' | 'error';
}>();
</script>

<template>
  <div
    class="fixed left-1/2 top-4 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur"
    :class="tone === 'error'
      ? 'border-red-200 bg-red-50/95 text-red-800'
      : 'border-emerald-200 bg-emerald-50/95 text-emerald-800'"
  >
    <p class="text-sm font-medium">{{ message }}</p>
  </div>
</template>
