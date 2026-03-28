<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/20/solid';
import { ClipboardDocumentListIcon, PlusIcon } from '@heroicons/vue/24/outline';
import { computed, onBeforeUnmount, onErrorCaptured, onMounted, onUnmounted, ref } from 'vue';
import LogModal from '../components/LogModal.vue';
import TaskCard from '../components/TaskCard.vue';
import TaskFormModal from '../components/TaskFormModal.vue';
import { useMaintenanceData } from '../composables/useMaintenanceData';
import { useMaintenanceLogs } from '../composables/useMaintenanceLogs';
import { useVehicleProfile } from '../composables/useVehicleProfile';
import type { MaintenanceTask } from '../types/maintenance';
import { getCurrentDate, getNextCheckDate, toDateInputValue } from '../utils/maintenanceDates';
import { enrichTasks } from '../utils/maintenanceTasks';

const { maintenanceTasks, updateTask, saveTask, archiveTask } = useMaintenanceData();
const { addLog, isLoading, openLogModal } = useMaintenanceLogs();
const { activeVehicle } = useVehicleProfile();

const isTaskModalOpen = ref(false);
const editingTask = ref<MaintenanceTask | null>(null);
const topCreateButton = ref<HTMLElement | null>(null);
const showFloatingCreateButton = ref(false);
let createButtonObserver: IntersectionObserver | null = null;
const simulatedDate = ref<string>(toDateInputValue(new Date()));
const useSimulatedDate = ref(false);
const collapsedSections = ref<Record<'urgent' | 'dueSoon' | 'planned' | 'open' | 'done', boolean>>({
  urgent: false,
  dueSoon: false,
  planned: false,
  open: false,
  done: true
});

const currentDate = computed(() => getCurrentDate(simulatedDate.value, useSimulatedDate.value));
const filteredTasks = computed(() => maintenanceTasks.value.filter((task) => task.vehicleId === activeVehicle.value.id && !task.isArchived));
const enrichedTasks = computed(() => enrichTasks(filteredTasks.value, currentDate.value));

const tasksByStatus = computed(() => ({
  urgent: enrichedTasks.value.filter((task) => task.status === 'overdue'),
  dueSoon: enrichedTasks.value.filter((task) => task.status === 'dueSoon' || task.status === 'dueNow'),
  planned: enrichedTasks.value.filter((task) => task.scheduleType === 'scheduled' && !['done', 'overdue', 'dueSoon', 'dueNow'].includes(task.status)),
  open: enrichedTasks.value.filter((task) => task.scheduleType === 'recurring' && task.status === 'pending'),
  done: enrichedTasks.value.filter((task) => task.status === 'done')
}));

const statusSections = computed(() => [
  {
    key: 'urgent' as const,
    title: 'Dringend',
    count: tasksByStatus.value.urgent.length,
    tasks: tasksByStatus.value.urgent
  },
  {
    key: 'dueSoon' as const,
    title: 'Bald fällig',
    count: tasksByStatus.value.dueSoon.length,
    tasks: tasksByStatus.value.dueSoon
  },
  {
    key: 'planned' as const,
    title: 'Geplant',
    count: tasksByStatus.value.planned.length,
    tasks: tasksByStatus.value.planned
  },
  {
    key: 'open' as const,
    title: 'Offen',
    count: tasksByStatus.value.open.length,
    tasks: tasksByStatus.value.open
  },
  {
    key: 'done' as const,
    title: 'Erledigt',
    count: tasksByStatus.value.done.length,
    tasks: tasksByStatus.value.done
  }
]);

const addDemoTasks = async () => {
  const now = currentDate.value;
  const existingDescriptions = new Set(maintenanceTasks.value.map((task) => task.description));

  const demoTasks: Array<Partial<MaintenanceTask> & Pick<MaintenanceTask, 'vehicleId' | 'description' | 'category' | 'scheduleType'>> = [
    {
      vehicleId: activeVehicle.value.id,
      description: 'Demo Dringend',
      category: 'Service',
      scheduleType: 'scheduled',
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Custom Demo für Gruppe Dringend'
    },
    {
      vehicleId: activeVehicle.value.id,
      description: 'Demo Bald fällig',
      category: 'Dokumente',
      scheduleType: 'scheduled',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Custom Demo für Gruppe Bald fällig'
    },
    {
      vehicleId: activeVehicle.value.id,
      description: 'Demo Geplant',
      category: 'Karosserie',
      scheduleType: 'scheduled',
      dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Custom Demo für Gruppe Geplant'
    },
    {
      vehicleId: activeVehicle.value.id,
      description: 'Demo Offen',
      category: 'Reifen',
      scheduleType: 'recurring',
      frequency: 'monthly',
      notes: 'Custom Demo für Gruppe Offen'
    },
    {
      vehicleId: activeVehicle.value.id,
      description: 'Demo Erledigt',
      category: 'Motor',
      scheduleType: 'recurring',
      frequency: 'monthly',
      lastCheck: now.toISOString(),
      nextCheck: getNextCheckDate('monthly', now).toISOString(),
      notes: 'Custom Demo für Gruppe Erledigt'
    }
  ];

  demoTasks.forEach((task) => {
    if (!existingDescriptions.has(task.description)) {
      saveTask(task);
    }
  });

  collapsedSections.value = {
    urgent: false,
    dueSoon: false,
    planned: false,
    open: false,
    done: false
  };
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

const toggleSection = (key: 'urgent' | 'dueSoon' | 'planned' | 'open' | 'done') => {
  collapsedSections.value[key] = !collapsedSections.value[key];
};

onMounted(() => {
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

onUnmounted(() => undefined);

onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', err);
  console.log('Component:', instance);
  console.log('Error Info:', info);
  return false;
});
</script>

<template>
  <section class="space-y-4 pb-6 sm:space-y-5">
    <section class="-mx-4 -mt-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-4 pb-6 pt-5 text-white shadow-lg sm:mx-0 sm:mt-0 sm:rounded-[28px] sm:px-5 sm:pt-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">Wartung</h2>
          <p class="mt-2 text-sm text-white/85">Service und Fälligkeiten</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="addDemoTasks"
            class="rounded-2xl bg-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/25"
          >
            Demo
          </button>
          <button
            @click="openLogModal"
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/25"
          >
            <ClipboardDocumentListIcon class="h-5 w-5" />
          </button>
          <button
            ref="topCreateButton"
            @click="openCreateTaskModal"
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/25"
          >
            <PlusIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>

    <section
      v-for="section in statusSections"
      :key="section.key"
      :id="`status-section-${section.key}`"
      class="space-y-3"
    >
      <button
        type="button"
        class="flex w-full items-center justify-between px-1 py-1 text-left"
        @click="toggleSection(section.key)"
      >
        <div class="flex items-center gap-2">
          <ChevronDownIcon
            class="h-5 w-5 text-gray-500 transition-transform duration-200"
            :class="collapsedSections[section.key] ? '-rotate-90' : 'rotate-0'"
          />
          <span class="text-lg font-semibold text-gray-900">{{ section.title }}</span>
        </div>
        <span class="text-base font-medium text-gray-400">{{ section.count }}</span>
      </button>

      <div v-show="!collapsedSections[section.key]" class="space-y-3">
        <TaskCard
          v-for="task in section.tasks"
          :key="task.id"
          :task="task"
          :is-loading="isLoading"
          @mark-checked="markChecked"
          @edit="openEditTaskModal"
          @delete="handleArchiveTask"
        />

        <div v-if="section.tasks.length === 0" class="rounded-[24px] border border-dashed border-gray-200 bg-white px-5 py-4 text-sm text-gray-500">
          Keine Aufgaben in diesem Bereich.
        </div>
      </div>
    </section>

    <button
      v-if="showFloatingCreateButton && !isTaskModalOpen"
      @click="openCreateTaskModal"
      class="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg hover:bg-orange-600 sm:hidden"
    >
      <PlusIcon class="h-5 w-5" />
    </button>

    <TaskFormModal :open="isTaskModalOpen" :task="editingTask" :vehicle-id="activeVehicle.id" @close="closeTaskModal" @save="handleSaveTask" />
    <LogModal />
  </section>
</template>
