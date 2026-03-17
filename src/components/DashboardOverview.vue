<script setup lang="ts">
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, ListBulletIcon } from '@heroicons/vue/24/outline';

interface SummaryItem {
  title: string;
  value: string | number;
  hint: string;
}

interface RecentItem {
  title: string;
  subtitle: string;
  meta: string;
}

defineProps<{
  summary: SummaryItem[];
  nextDueItem: RecentItem | null;
  recentItems: RecentItem[];
  monthSummary: string;
}>();

const icons = [ExclamationTriangleIcon, ClockIcon, ListBulletIcon, CheckCircleIcon];
</script>

<template>
  <section class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="(item, index) in summary"
        :key="item.title"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-gray-500">{{ item.title }}</p>
            <p class="mt-2 text-2xl font-semibold text-gray-900">{{ item.value }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ item.hint }}</p>
          </div>
          <component :is="icons[index]" class="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 class="text-lg font-semibold text-gray-900">Nächster fälliger Punkt</h2>
        <div v-if="nextDueItem" class="mt-4">
          <p class="font-medium text-gray-900">{{ nextDueItem.title }}</p>
          <p class="text-sm text-gray-600 mt-1">{{ nextDueItem.subtitle }}</p>
          <p class="text-sm text-gray-500 mt-2">{{ nextDueItem.meta }}</p>
        </div>
        <p v-else class="mt-4 text-sm text-gray-500">Aktuell ist nichts fällig.</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 class="text-lg font-semibold text-gray-900">Diesen Monat</h2>
        <p class="mt-4 text-sm text-gray-600">{{ monthSummary }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 class="text-lg font-semibold text-gray-900">Zuletzt erledigt</h2>
      <div v-if="recentItems.length > 0" class="mt-4 space-y-3">
        <div v-for="item in recentItems" :key="`${item.title}-${item.meta}`" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg bg-gray-50 px-4 py-3">
          <div>
            <p class="font-medium text-gray-900">{{ item.title }}</p>
            <p class="text-sm text-gray-600">{{ item.subtitle }}</p>
          </div>
          <p class="text-sm text-gray-500">{{ item.meta }}</p>
        </div>
      </div>
      <p v-else class="mt-4 text-sm text-gray-500">Noch keine erledigten Einträge vorhanden.</p>
    </div>
  </section>
</template>
