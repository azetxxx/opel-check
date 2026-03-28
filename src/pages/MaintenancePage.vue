<script setup lang="ts">
import { ClipboardDocumentListIcon, PlusIcon } from '@heroicons/vue/24/outline';
import { computed, onBeforeUnmount, onErrorCaptured, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
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

const route = useRoute();

const { maintenanceTasks, updateTask, saveTask, archiveTask } = useMaintenanceData();
const { logs, addLog, isLoading, openLogModal } = useMaintenanceLogs();
const { activeVehicle } = useVehicleProfile();

const showDebug = ref(false);
const isTaskModalOpen = ref(false);
const editingTask = ref<MaintenanceTask | null>(null);
const topCreateButton = ref<HTMLElement | null>(null);
const showFloatingCreateButton = ref(false);
let createButtonObserver: IntersectionObserver | null = null;
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

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault();
    showDebug.value = !showDebug.value;
  }
};

watch(groupedTasks, (groups) => {
  collapsedGroups.value = getAutoCollapsedGroups(groups);
}, { immediate: true });

const openCreateTaskModal = () => {
  editingTask.value = null;
  isTaskModalOpen.value = true;
};

watch(() => route.query.action, (action) => {
  if (action === 'create-task') {
    openCreateTaskModal();
  }
}, { immediate: true });

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);

  if (!topCreateButton.value) return;

  createButtonObserver = new IntersectionObserver(
    ([entry]) => {
      showFloatingCreateButton.value = entry.intersectionRatio < 0.4;
    },
    {
      threshold: [0, 0.25, 0.4, 0.6, 1],
      rootMargin: '0px 0px -32px 0px'
    }
  );

  createButtonObserver.observe(topCreateButton.value);
});

onBeforeUnmount(() => {
  createButtonObserver?.disconnect();
});

onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

const toggleGroup = (frequency: TaskGroupKey) => {
  collapsedGroups.value[frequency] = !collapsedGroups.value[frequency];
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
  <section class="space-y-5 sm:space-y-6 pb-4">
    <section class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Aufgaben</h3>
        <div class="flex items-center gap-2">
          <button
            @click="openLogModal"
            class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            <ClipboardDocumentListIcon class="h-4 w-4" />
            Protokolle
          </button>
          <button
            ref="topCreateButton"
            @click="openCreateTaskModal"
            class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            <PlusIcon class="h-4 w-4" />
            Neu
          </button>
        </div>
      </div>
    </section>

    <DashboardOverview :summary="summaryCards" :next-due-item="nextDueItem" :recent-items="recentItems" :month-summary="monthSummary" />

    <button
      v-if="showFloatingCreateButton && !isTaskModalOpen"
      @click="openCreateTaskModal"
      class="fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700 sm:hidden"
    >
      <PlusIcon class="h-4 w-4" />
      Neu
    </button>

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
