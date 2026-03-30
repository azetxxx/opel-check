<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  email?: string | null;
  configured: boolean;
  authenticated: boolean;
  loading?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
}>();

const emit = defineEmits<{
  (e: 'sign-in', email: string): void;
  (e: 'sign-out'): void;
}>();

const inputEmail = ref(props.email ?? '');

const statusText = computed(() => {
  if (!props.configured) return 'Supabase ist noch nicht konfiguriert.';
  if (props.authenticated) return 'Mit Supabase verbunden.';
  return 'Mit Magic Link anmelden, um Cloud-Funktionen zu aktivieren.';
});

const submit = () => {
  emit('sign-in', inputEmail.value);
};
</script>

<template>
  <section class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm space-y-4">
    <div>
      <h3 class="text-xl font-semibold text-gray-900">Cloud & Konto</h3>
      <p class="mt-1 text-sm text-gray-600">{{ statusText }}</p>
    </div>

    <div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ successMessage }}
    </div>

    <div v-if="configured && authenticated" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
      <p class="text-sm font-medium text-emerald-800">Angemeldet</p>
      <p class="mt-1 text-sm text-emerald-700">{{ email || 'Kein E-Mail-Konto verfügbar' }}</p>
    </div>

    <div v-else-if="configured" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
        <input
          v-model="inputEmail"
          type="email"
          class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="name@example.com"
        >
      </div>

      <button
        @click="submit"
        :disabled="loading"
        class="flex min-h-12 w-full items-center justify-center rounded-[20px] bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        Magic Link senden
      </button>
    </div>

    <div v-else class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Trage zuerst <code>VITE_SUPABASE_URL</code> und <code>VITE_SUPABASE_ANON_KEY</code> in deine lokale <code>.env</code> ein.
    </div>

    <button
      v-if="configured && authenticated"
      @click="emit('sign-out')"
      :disabled="loading"
      class="flex min-h-12 w-full items-center justify-center rounded-[20px] border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
    >
      Abmelden
    </button>
  </section>
</template>
