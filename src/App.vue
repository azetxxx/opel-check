<script setup lang="ts">
import { computed, onErrorCaptured, onMounted, onUnmounted, ref, watch } from 'vue';
import AppHeader from './components/AppHeader.vue';
import LogModal from './components/LogModal.vue';
import TaskGroup from './components/TaskGroup.vue';
import VehicleProfileCard from './components/VehicleProfileCard.vue';
import { FREQUENCY_ORDER } from './constants/maintenance';
import { useMaintenanceData } from './composables/useMaintenanceData';
import { useMaintenanceLogs } from './composables/useMaintenanceLogs';
import { useVehicleProfile } from './composables/useVehicleProfile';
import type { Frequency, MaintenanceTask, VehicleProfile } from './types/maintenance';
import { getCurrentDate, getNextCheckDate, toDateInputValue } from './utils/maintenanceDates';
import {
  buildDefaultCollapsedGroups,
  enrichTasks,
  getAutoCollapsedGroups,
  groupTasksByFrequency
} from './utils/maintenanceTasks';

const { maintenanceTasks, updateTask, resetTasks } = useMaintenanceData();
const { addLog, isLoading, openLogModal } = useMaintenanceLogs();
const { activeVehicle, updateVehicle } = useVehicleProfile();

const showDebug = ref(false);
const simulatedDate = ref<string>(toDateInputValue(new Date()));
const useSimulatedDate = ref(false);
const collapsedGroups = ref<Record<Frequency, boolean>>(buildDefaultCollapsedGroups());

const currentDate = computed(() => getCurrentDate(simulatedDate.value, useSimulatedDate.value));
const filteredTasks = computed(() => {
  const vehicleId = activeVehicle.value.id;
  return maintenanceTasks.value.filter((task) => task.vehicleId === vehicleId);
});
const enrichedTasks = computed(() => enrichTasks(filteredTasks.value, currentDate.value));
const groupedTasks = computed(() => groupTasksByFrequency(enrichedTasks.value));

const debug = computed(() => ({
  activeVehicle: activeVehicle.value,
  tasksLoaded: maintenanceTasks.value.length,
  filteredTasksLoaded: filteredTasks.value.length,
  groupedTasksCount: Object.values(groupedTasks.value).reduce((acc, tasks) => acc + tasks.length, 0),
  groups: Object.fromEntries(
    Object.entries(groupedTasks.value).map(([key, tasks]) => [key, tasks.length])
  ),
  rawTasks: maintenanceTasks.value,
  rawGroupedTasks: groupedTasks.value,
  collapsedState: collapsedGroups.value,
  simulatedDateEnabled: useSimulatedDate.value,
  currentSimulatedDate: simulatedDate.value,
  currentDate: currentDate.value.toISOString()
}));

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault();
    showDebug.value = !showDebug.value;
  }
};

watch(
  groupedTasks,
  (groups) => {
    collapsedGroups.value = getAutoCollapsedGroups(groups);
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const toggleGroup = (frequency: Frequency) => {
  collapsedGroups.value[frequency] = !collapsedGroups.value[frequency];
};

const saveVehicleProfile = (vehicle: VehicleProfile) => {
  updateVehicle(vehicle);
};

const markChecked = async (task: MaintenanceTask) => {
  const now = currentDate.value;
  const nextCheck = getNextCheckDate(task.frequency, now);

  const updatedTask = {
    ...task,
    lastCheck: now.toISOString(),
    nextCheck: nextCheck.toISOString(),
    updatedAt: now.toISOString(),
    lastMileage: activeVehicle.value.currentMileage ?? task.lastMileage ?? null
  };

  await addLog({
    id: crypto.randomUUID(),
    vehicleId: task.vehicleId,
    taskId: task.id,
    taskDescription: task.description,
    category: task.category,
    frequency: task.frequency,
    checkedAt: now.toISOString(),
    nextDueDate: nextCheck.toISOString(),
    notes: task.notes ?? '',
    mileage: activeVehicle.value.currentMileage ?? task.lastMileage ?? null,
    createdAt: now.toISOString()
  });

  updateTask(updatedTask);
};

onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', err);
  console.log('Component:', instance);
  console.log('Error Info:', info);
  return false;
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
    <AppHeader
      :show-debug="showDebug"
      :simulated-date="simulatedDate"
      :use-simulated-date="useSimulatedDate"
      :is-loading="isLoading"
      :debug="debug"
      @close-debug="showDebug = false"
      @update:simulated-date="simulatedDate = $event"
      @update:use-simulated-date="useSimulatedDate = $event"
      @reset="resetTasks"
      @open-logs="openLogModal"
    />

    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="space-y-6">
        <VehicleProfileCard
          :vehicle="activeVehicle"
          @save="saveVehicleProfile"
        />

        <TaskGroup
          v-for="frequency in FREQUENCY_ORDER"
          :key="frequency"
          :frequency="frequency"
          :tasks="groupedTasks[frequency]"
          :collapsed="collapsedGroups[frequency]"
          :is-loading="isLoading"
          @toggle="toggleGroup"
          @mark-checked="markChecked"
        />
      </div>
    </main>

    <LogModal />
  </div>
</template>
