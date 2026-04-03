<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { VehicleProfile } from '../types/maintenance';
import type { VehicleInviteRow, VehicleMemberListItem, VehicleMemberRole } from '../types/supabase';

const props = defineProps<{
  vehicle: VehicleProfile;
  enabled: boolean;
  invites: VehicleInviteRow[];
  members: VehicleMemberListItem[];
  loading?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'create-invite', payload: { vehicleId: string; role: Exclude<VehicleMemberRole, 'owner'> }): void;
  (e: 'accept-invite', code: string): void;
  (e: 'update-member-role', payload: { memberId: string; role: VehicleMemberRole }): void;
  (e: 'remove-member', memberId: string): void;
  (e: 'revoke-invite', inviteId: string): void;
}>();

const inviteCode = ref('');
const inviteRole = ref<Exclude<VehicleMemberRole, 'owner'>>('driver');

watch(
  () => props.vehicle.id,
  () => {
    inviteCode.value = '';
  }
);

const hasInvites = computed(() => props.invites.length > 0);
const hasMembers = computed(() => props.members.length > 0);

const createInvite = () => {
  emit('create-invite', {
    vehicleId: props.vehicle.id,
    role: inviteRole.value
  });
};

const acceptInvite = () => {
  emit('accept-invite', inviteCode.value);
  inviteCode.value = '';
};
</script>

<template>
  <section class="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm space-y-4">
    <div>
      <h3 class="text-xl font-semibold text-gray-900">Fahrzeug teilen</h3>
      <p class="mt-1 text-sm text-gray-600">Lade weitere Nutzer kontrolliert per Code ein.</p>
    </div>

    <div v-if="!enabled" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Melde dich zuerst mit Supabase an und aktiviere den Storage-Provider <code>supabase</code>.
    </div>

    <template v-else>
      <div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {{ successMessage }}
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rolle für Einladung</label>
          <select v-model="inviteRole" class="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="driver">Driver</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <button
          @click="createInvite"
          :disabled="loading"
          class="flex min-h-12 items-center justify-center rounded-[20px] bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          Einladungs-Code erstellen
        </button>
      </div>

      <div v-if="hasMembers" class="space-y-2">
        <p class="text-sm font-medium text-gray-700">Mitglieder</p>
        <div v-for="member in members" :key="member.id" class="rounded-2xl border border-gray-200 px-4 py-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 break-all">{{ member.email || member.label }}</p>
              <p v-if="member.display_name" class="mt-1 text-sm text-gray-500">{{ member.display_name }}</p>
              <p class="mt-1 text-sm text-gray-500">Rolle: {{ member.role }}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <select
                :value="member.role"
                @change="emit('update-member-role', { memberId: member.id, role: ($event.target as HTMLSelectElement).value as VehicleMemberRole })"
                class="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              >
                <option value="owner">Owner</option>
                <option value="driver">Driver</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                @click="emit('remove-member', member.id)"
                class="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Entfernen
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasInvites" class="space-y-2">
        <p class="text-sm font-medium text-gray-700">Aktive Codes</p>
        <div v-for="invite in invites" :key="invite.id" class="rounded-2xl border border-gray-200 px-4 py-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="font-mono text-lg font-semibold text-gray-900">{{ invite.code }}</p>
              <p class="mt-1 text-sm text-gray-500">Rolle: {{ invite.role }}</p>
            </div>
            <button
              @click="emit('revoke-invite', invite.id)"
              class="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Widerrufen
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-3 border-t border-gray-100 pt-4">
        <p class="text-sm font-medium text-gray-700">Per Code beitreten</p>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Invite-Code</label>
            <input
              v-model="inviteCode"
              type="text"
              class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABCD2345"
            >
          </div>
          <button
            @click="acceptInvite"
            :disabled="loading || !inviteCode.trim()"
            class="flex min-h-12 items-center justify-center rounded-[20px] border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Fahrzeug beitreten
          </button>
        </div>
      </div>
    </template>
  </section>
</template>
