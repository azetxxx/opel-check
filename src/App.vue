<script setup lang="ts">
import { computed, onErrorCaptured, onMounted, onUnmounted, ref, watch } from 'vue';
import AppHeader from './components/AppHeader.vue';
import BackupPanel from './components/BackupPanel.vue';
import LogModal from './components/LogModal.vue';
import TaskFormModal from './components/TaskFormModal.vue';
import TaskGroup from './components/TaskGroup.vue';
import VehicleProfileCard from './components/VehicleProfileCard.vue';
import { FREQUENCY_ORDER } from './constants/maintenance';
import { useMaintenanceData } from './composables/useMaintenanceData';
import { useMaintenanceLogs } from './composables/useMaintenanceLogs';
import { useVehicleProfile } from './composables/useVehicleProfile';
import type { MaintenanceTask, TaskGroupKey, VehicleProfile } from './types/maintenance';
import { createBackupPayload, downloadBackup, validateBackupPayload } from './utils/backup';
import { getCurrentDate, getNextCheckDate, toDateInputValue } from './utils/maintenanceDates';
import { buildDefaultCollapsedGroups, enrichTasks, getAutoCollapsedGroups, groupTasksByFrequency } from './utils/maintenanceTasks';

const { maintenanceTasks, updateTask, saveTask, archiveTask, replaceTasks, resetTasks } = useMaintenanceData();
const { logs, addLog, isLoading, openLogModal, replaceLogs } = useMaintenanceLogs();
const { vehicles, activeVehicle, updateVehicle, replaceVehicles } = useVehicleProfile();

const showDebug = ref(false);
const isTaskModalOpen = ref(false);
const isImportingBackup = ref(false);
const editingTask = ref<MaintenanceTask | null>(null);
const simulatedDate = ref<string>(toDateInputValue(new Date()));
const useSimulatedDate = ref(false);
const collapsedGroups = ref<Record<TaskGroupKey, boolean>>(buildDefaultCollapsedGroups());

const currentDate = computed(() => getCurrentDate(simulatedDate.value, useSimulatedDate.value));
const filteredTasks = computed(() => maintenanceTasks.value.filter((task) => task.vehicleId === activeVehicle.value.id && !task.isArchived));
const enrichedTasks = computed(() => enrichTasks(filteredTasks.value, currentDate.value));
const groupedTasks = computed(() => groupTasksByFrequency(enrichedTasks.value));

const debug = computed(() => ({
  activeVehicle: activeVehicle.value,
  vehiclesLoaded: vehicles.value.length,
  logsLoaded: logs.value.length,
  tasksLoaded: maintenanceTasks.value.length,
  filteredTasksLoaded: filteredTasks.value.length,
  groupedTasksCount: Object.values(groupedTasks.value).reduce((acc, tasks) => acc + tasks.length, 0),
  groups: Object.fromEntries(Object.entries(groupedTasks.value).map(([key, tasks]) => [key, tasks.length])),
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

watch(groupedTasks, (groups) => {
  collapsedGroups.value = getAutoCollapsedGroups(groups);
}, { immediate: true });

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

const toggleGroup = (frequency: TaskGroupKey) => {
  collapsedGroups.value[frequency] = !collapsedGroups.value[frequency];
};

const saveVehicleProfile = (vehicle: VehicleProfile) => updateVehicle(vehicle);

const exportBackup = () => downloadBackup(createBackupPayload(vehicles.value, maintenanceTasks.value, logs.value));

const importBackup = async (file: File) => {
  try {
    isImportingBackup.value = true;
    const parsed = JSON.parse(await file.text()) as unknown;

    if (!validateBackupPayload(parsed)) {
      alert('Ungültiges Backup-Format. Bitte eine gültige Omiigo-Car-JSON-Datei wählen.');
      return;
    }

    replaceVehicles(parsed.vehicles);
    replaceTasks(parsed.tasks);
    replaceLogs(parsed.logs);
    alert('Backup erfolgreich importiert.');
  } catch (error) {
    console.error('Error importing backup:', error);
    alert('Backup konnte nicht importiert werden. Bitte JSON-Datei prüfen.');
  } finally {
    isImportingBackup.value = false;
  }
};

const openCreateTaskModal = () => {
  editingTask.value = null;
  isTaskModalOpen.value = true;
};

const openEditTaskModal = (task: MaintenanceTask) => {
  editingTask.value = task;
  isTaskModalOpen.value = true;
};

const closeTaskModal = () => {
  isTaskModalOpen.value = false;
  editingTask.value = null;
};

const handleSaveTask = (task: Partial<MaintenanceTask> & Pick<MaintenanceTask, 'vehicleId' | 'description' | 'category' | 'scheduleType'>) => {
  saveTask(task);
  closeTaskModal();
};

const handleArchiveTask = (taskId: string) => archiveTask(taskId);

const markChecked = async (task: MaintenanceTask) => {
  const now = currentDate.value;
  const nextCheck = task.scheduleType === 'recurring' && task.frequency ? getNextCheckDate(task.frequency, now).toISOString() : null;

  const updatedTask: MaintenanceTask = {
    ...task,
    lastCheck: now.toISOString(),
    nextCheck,
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
    nextDueDate: task.scheduleType === 'scheduled' ? task.dueDate ?? null : nextCheck,
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
        <VehicleProfileCard :vehicle="activeVehicle" @save="saveVehicleProfile" @create-task="openCreateTaskModal" />
        <BackupPanel :is-importing="isImportingBackup" @export="exportBackup" @import-file="importBackup" />

        <TaskGroup
          v-for="frequency in FREQUENCY_ORDER"
          :key="frequency"
          :frequency="frequency"
          :tasks="groupedTasks[frequency]"
          :collapsed="collapsedGroups[frequency]"
          :is-loading="isLoading"
          @toggle="toggleGroup"
          @mark-checked="markChecked"
          @edit="openEditTaskModal"
          @delete="handleArchiveTask"
        />
      </div>
    </main>

    <TaskFormModal :open="isTaskModalOpen" :task="editingTask" :vehicle-id="activeVehicle.id" @close="closeTaskModal" @save="handleSaveTask" />
    <LogModal />
  </div>
</template>
