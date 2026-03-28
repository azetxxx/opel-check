<script setup lang="ts">
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, ListBulletIcon } from '@heroicons/vue/24/outline';

interface SummaryItem {
  title: string;
  value: string | number;
  hint: string;
  targetGroup?: string | null;
  disabled?: boolean;
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

const emit = defineEmits<{
  (e: 'select-summary', targetGroup: string): void;
}>();

const icons = [ExclamationTriangleIcon, ClockIcon, ListBulletIcon, CheckCircleIcon];
</script>

<template>
  <section class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <button
        v-for="(item, index) in summary"
        :key="item.title"
        type="button"
        @click="item.targetGroup && !item.disabled ? emit('select-summary', item.targetGroup) : undefined"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 text-left transition-colors"
        :class="item.targetGroup && !item.disabled ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm opacity-85">{{ item.title }}</p>
            <p class="mt-2 text-2xl font-semibold">{{ item.value }}</p>
            <p class="mt-1 text-sm opacity-85">{{ item.hint }}</p>
          </div>
          <component :is="icons[index]" class="h-6 w-6 opacity-80" />
        </div>
      </button>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900">Nächster fälliger Punkt</h2>
        <div v-if="nextDueItem" class="mt-4">
          <p class="font-medium text-gray-900">{{ nextDueItem.title }}</p>
          <p class="text-sm text-gray-600 mt-1">{{ nextDueItem.subtitle }}</p>
          <p class="text-sm text-gray-500 mt-2">{{ nextDueItem.meta }}</p>
        </div>
        <p v-else class="mt-4 text-sm text-gray-500">Aktuell ist nichts fällig.</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900">Diesen Monat</h2>
        <p class="mt-4 text-sm text-gray-600">{{ monthSummary }}</p>
      </div>
    </div>

  </section>
</template>
