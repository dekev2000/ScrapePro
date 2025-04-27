<template>
  <div class="task-button">
    <div
      class="task-icon"
      @click="navigateToTasks"
    >
      <i class="fas fa-tasks"></i>
      <span
        v-if="pendingTasksCount > 0"
        class="task-badge"
      >{{ pendingTasksCount > 99 ? '99+' : pendingTasksCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useTaskStore, Task } from "@/stores/task";

const router = useRouter();
const taskStore = useTaskStore();

const pendingTasksCount = computed(() => {
  return taskStore.tasks.filter((task: Task) => task.status !== "done").length;
});

const navigateToTasks = () => {
  router.push("/dashboard/tasks");
};
</script>

<style scoped>
.task-button {
  position: relative;
}

.task-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.task-icon:hover {
  color: #4b5563;
}

.task-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #4f46e5;
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
</style>
