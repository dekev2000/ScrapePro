<template>
  <div class="tasks-kanban">
    <div class="kanban-header">
      <h1>Task Management</h1>
      <div class="header-actions">
        <button
          class="btn primary"
          @click="openTaskForm()"
        >
          <i class="fas fa-plus"></i> New Task
        </button>
      </div>
    </div>

    <div class="kanban-board">
      <div class="kanban-columns">
        <TaskColumn
          v-for="column in columns"
          :key="column.status"
          :title="column.title"
          :status="column.status"
          :tasks="getTasksByStatus(column.status)"
          @add-task="openTaskForm"
          @view-task="openTaskDetails"
          @edit-task="openTaskForm"
          @delete-task="confirmDeleteTask"
          @drag-start="onDragStart"
          @drop="onDrop"
        />
      </div>
    </div>

    <!-- Task Form Modal -->
    <Teleport to="body">
      <div
        v-if="showTaskForm"
        class="modal-overlay"
        @click="closeTaskForm"
      >
        <div
          class="modal-content"
          @click.stop
        >
          <div class="modal-header">
            <h2>{{ editingTask ? 'Edit Task' : 'New Task' }}</h2>
            <button
              class="close-btn"
              @click="closeTaskForm"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <TaskForm
              :task="editingTask"
              :initial-status="initialStatus"
              @submit="saveTask"
              @cancel="closeTaskForm"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Task Details Modal -->
    <Teleport to="body">
      <div
        v-if="showTaskDetails"
        class="modal-overlay"
        @click="closeTaskDetails"
      >
        <div
          class="modal-content"
          @click.stop
        >
          <div class="modal-header">
            <h2>Task Details</h2>
            <button
              class="close-btn"
              @click="closeTaskDetails"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <TaskDetails
              v-if="selectedTask"
              :task="selectedTask"
              @edit="openTaskForm"
              @delete="confirmDeleteTask"
              @view-prospect="viewProspect"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirmation"
        class="modal-overlay"
        @click="cancelDelete"
      >
        <div
          class="modal-content confirmation-modal"
          @click.stop
        >
          <div class="modal-header">
            <h2>Confirm Delete</h2>
            <button
              class="close-btn"
              @click="cancelDelete"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this task?</p>
            <p class="task-title">{{ taskToDelete?.title }}</p>
            <div class="confirmation-actions">
              <button
                class="btn secondary"
                @click="cancelDelete"
              >
                Cancel
              </button>
              <button
                class="btn danger"
                @click="deleteTask"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Teleport } from "vue";
import { useRouter } from "vue-router";
import { useTaskStore, Task } from "@/stores/task";
import { useToast } from "@/composables/useToast";
import TaskColumn from "@/components/tasks/TaskColumn.vue";
import TaskForm from "@/components/tasks/TaskForm.vue";
import TaskDetails from "@/components/tasks/TaskDetails.vue";

const router = useRouter();
const taskStore = useTaskStore();
const toast = useToast();

// Initialize tasks
onMounted(() => {
  console.log("TasksKanban mounted");
  console.log("Initial tasks:", taskStore.tasks);
});

// Kanban columns
const columns = [
  { title: "To Do", status: "todo" as const },
  { title: "In Progress", status: "in_progress" as const },
  { title: "Review", status: "review" as const },
  { title: "Done", status: "done" as const },
];

// Task form state
const showTaskForm = ref(false);
const editingTask = ref<Task | null>(null);
const initialStatus = ref<Task["status"] | null>(null);

// Task details state
const showTaskDetails = ref(false);
const selectedTask = ref<Task | null>(null);

// Delete confirmation state
const showDeleteConfirmation = ref(false);
const taskToDelete = ref<Task | null>(null);

// Get tasks by status
const getTasksByStatus = (status: Task["status"]) => {
  // Direct filtering instead of using the getter
  return taskStore.tasks.filter((task: Task) => task.status === status);
};

// Open task form
const openTaskForm = (taskOrStatus?: Task | Task["status"]) => {
  if (typeof taskOrStatus === "string") {
    // It's a status
    editingTask.value = null;
    initialStatus.value = taskOrStatus;
  } else if (taskOrStatus) {
    // It's a task
    editingTask.value = taskOrStatus;
    initialStatus.value = null;
  } else {
    // No parameter
    editingTask.value = null;
    initialStatus.value = null;
  }

  showTaskForm.value = true;
};

// Close task form
const closeTaskForm = () => {
  showTaskForm.value = false;
  editingTask.value = null;
  initialStatus.value = null;
};

// Save task
const saveTask = (taskData: Partial<Task>) => {
  try {
    if (editingTask.value) {
      // Update existing task
      const updatedTask = taskStore.updateTask(editingTask.value.id, taskData);
      if (updatedTask) {
        toast.success("Task updated successfully");
      } else {
        toast.error("Failed to update task");
      }
    } else {
      // Create new task
      taskStore.addTask(
        taskData as Omit<Task, "id" | "createdAt" | "updatedAt">
      );
      toast.success("Task created successfully");
    }

    closeTaskForm();
  } catch (error) {
    console.error("Error saving task:", error);
    toast.error("An error occurred while saving the task");
  }
};

// Open task details
const openTaskDetails = (task: Task) => {
  selectedTask.value = task;
  showTaskDetails.value = true;
};

// Close task details
const closeTaskDetails = () => {
  showTaskDetails.value = false;
  selectedTask.value = null;
};

// Confirm delete task
const confirmDeleteTask = (task: Task) => {
  taskToDelete.value = task;
  showDeleteConfirmation.value = true;
};

// Cancel delete
const cancelDelete = () => {
  showDeleteConfirmation.value = false;
  taskToDelete.value = null;
};

// Delete task
const deleteTask = () => {
  if (!taskToDelete.value) return;

  try {
    const deleted = taskStore.deleteTask(taskToDelete.value.id);
    if (deleted) {
      toast.success("Task deleted successfully");

      // Close details modal if the deleted task is currently selected
      if (
        selectedTask.value &&
        selectedTask.value.id === taskToDelete.value.id
      ) {
        closeTaskDetails();
      }
    } else {
      toast.error("Failed to delete task");
    }

    cancelDelete();
  } catch (error) {
    console.error("Error deleting task:", error);
    toast.error("An error occurred while deleting the task");
  }
};

// View prospect
const viewProspect = (prospectId?: string) => {
  if (prospectId) {
    router.push(`/dashboard/prospects/${prospectId}`);
  }
};

// Drag and drop
const onDragStart = (event: DragEvent, task: Task) => {
  // Nothing to do here, the TaskCard component handles setting the data
};

const onDrop = (taskId: string, newStatus: Task["status"]) => {
  try {
    const updated = taskStore.updateTaskStatus(taskId, newStatus);
    if (updated) {
      toast.success(
        `Task moved to ${columns.find((c) => c.status === newStatus)?.title}`
      );
    } else {
      toast.error("Failed to move task");
    }
  } catch (error) {
    console.error("Error moving task:", error);
    toast.error("An error occurred while moving the task");
  }
};
</script>

<style scoped>
.tasks-kanban {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.kanban-header h1 {
  margin: 0;
  font-size: 24px;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn.secondary:hover {
  background-color: #e5e7eb;
}

.btn.danger {
  background-color: #ef4444;
  color: white;
}

.btn.danger:hover {
  background-color: #dc2626;
}

.kanban-board {
  flex: 1;
  overflow-x: auto;
  padding: 20px 0;
  /* Allow menus to overflow */
  overflow-y: visible;
}

.kanban-columns {
  display: flex;
  height: 100%;
  min-height: 500px;
  /* Allow menus to overflow */
  overflow: visible;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.confirmation-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.task-title {
  font-weight: 600;
  color: #1f2937;
  margin: 12px 0;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 6px;
}
</style>
