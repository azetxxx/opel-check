<script setup lang="ts">
import { computed, onErrorCaptured, onMounted, onUnmounted, ref, watch } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import DashboardOverview from '../components/DashboardOverview.vue';
import LogModal from '../components/LogModal.vue';
import TaskFormModal from '../components/TaskFormModal.vue';
import TaskGroup from '../components/TaskGroup.vue';
import { FREQUENCY_ORDER } from '../constants/maintenance';
import { useMaintenanceData } from '../composables/useMaintenanceData';
import { useMaintenanceLogs } from '../composables/useMaintenanceLogs';
import { useVehicleProfile } from '../composables/useVehicleProfile';
import type { MaintenanceTask, TaskGroupKey } from '../types/maintenance';
import { formatDisplayDate, getCurrentDate, getNextCheckDate, toDateInputValue } from '../utils/maintenanceDates';
import { buildDefaultCollapsedGroups, enrichTasks, getAutoCollapsedGroups, groupTasksByFrequency } from '../utils/maintenanceTasks';

const { maintenanceTasks, updateTask, saveTask, archiveTask, resetTasks } = useMaintenanceData();
const { logs, addLog, isLoading, openLogModal } = useMaintenanceLogs();
const { activeVehicle } = useVehicleProfile();

const showDebug = ref(false);
const isTaskModalOpen = ref(false);
const editingTask = ref<MaintenanceTask | null>(null);
const simulatedDate = ref<string>(toDateInputValue(new Date()));
const useSimulatedDate = ref(false);
const collapsedGroups = ref<Record<TaskGroupKey, boolean>>(buildDefaultCollapsedGroups());

const currentDate = computed(() => getCurrentDate(simulatedDate.value, useSimulatedDate.value));
const filteredTasks = computed(() => maintenanceTasks.value.filter((task) => task.vehicleId === activeVehicle.value.id && !task.isArchived));
const filteredLogs = computed(() => logs.value.filter((log) => log.vehicleId === activeVehicle.value.id));
const enrichedTasks = computed(() => enrichTasks(filteredTasks.value, currentDate.value));
const groupedTasks = computed(() => groupTasksByFrequency(enrichedTasks.value));

const summaryCards = computed(() => {
  const overdueCount = enrichedTasks.value.filter((task) => task.status === 'overdue').length;
  const pendingCount = enrichedTasks.value.filter((task) => task.status === 'pending').length;
  const dueSoonCount = enrichedTasks.value.filter((task) => task.status === 'dueSoon' || task.status === 'dueNow').length;
  const completedCount = enrichedTasks.value.filter((task) => task.status === 'done').length;

  return [
    { title: 'Überfällig', value: overdueCount, hint: overdueCount > 0 ? 'Benötigt Aufmerksamkeit' : 'Alles gut' },
    { title: 'Demnächst fällig', value: dueSoonCount, hint: 'Heute + nächste 7 Tage' },
    { title: 'Offen', value: pendingCount, hint: 'Noch nie erledigt' },
    { title: 'Erledigt', value: completedCount, hint: 'Aktuell ohne Handlungsbedarf' }
  ];
});

const nextDueItem = computed(() => {
  const tasksWithDates = enrichedTasks.value
    .filter((task) => ['overdue', 'dueNow', 'dueSoon'].includes(task.status) || (task.scheduleType === 'scheduled' ? task.dueDate : task.nextCheck))
    .map((task) => ({ task, date: task.scheduleType === 'scheduled' ? task.dueDate : task.nextCheck }))
    .filter((item): item is { task: typeof enrichedTasks.value[number]; date: string } => Boolean(item.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  if (!tasksWithDates) return null;

  return {
    title: tasksWithDates.task.description,
    subtitle: `${tasksWithDates.task.category} · ${tasksWithDates.task.scheduleType === 'scheduled' ? 'Geplant' : 'Wiederholend'}`,
    meta: `${tasksWithDates.task.scheduleType === 'scheduled' ? 'Termin' : 'Nächste Prüfung'}: ${formatDisplayDate(tasksWithDates.date)}`
  };
});

const recentItems = computed(() => filteredLogs.value.slice(0, 5).map((log) => ({
  title: log.taskDescription,
  subtitle: `${log.category}${log.frequency ? ` · ${log.frequency}` : ' · Geplant'}`,
  meta: `Erledigt am ${formatDisplayDate(log.checkedAt)}`
})));

const monthSummary = computed(() => {
  const now = currentDate.value;
  const completedThisMonth = filteredLogs.value.filter((log) => {
    const checkedDate = new Date(log.checkedAt);
    return checkedDate.getMonth() === now.getMonth() && checkedDate.getFullYear() === now.getFullYear();
  }).length;

  return `${completedThisMonth} Aufgaben wurden in diesem Monat erledigt.`;
});

const debug = computed(() => ({
  activeVehicle: activeVehicle.value,
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
  <section class="space-y-6">
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

    <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Wartung</h2>
        <p class="text-sm text-gray-600">Wartungsaufgaben, Protokolle und Fälligkeiten für das aktive Fahrzeug.</p>
      </div>
      <button
        @click="openCreateTaskModal"
        class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow text-sm font-medium"
      >
        Neue Aufgabe
      </button>
    </section>

    <DashboardOverview :summary="summaryCards" :next-due-item="nextDueItem" :recent-items="recentItems" :month-summary="monthSummary" />

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

    <TaskFormModal :open="isTaskModalOpen" :task="editingTask" :vehicle-id="activeVehicle.id" @close="closeTaskModal" @save="handleSaveTask" />
    <LogModal />
  </section>
</template>
