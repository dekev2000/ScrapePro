<template>
  <div 
    class="task-column"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <div class="column-header">
      <h3>{{ title }} ({{ tasks.length }})</h3>
      <button 
        class="add-task-btn"
        @click="$emit('add-task', status)"
      >
        <i class="fas fa-plus"></i>
      </button>
    </div>
    
    <div class="column-body">
      <div v-if="tasks.length === 0" class="empty-column">
        <i class="fas fa-clipboard-list"></i>
        <p>No tasks</p>
      </div>
      
      <div v-else class="tasks-list">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @click="$emit('view-task', task)"
          @edit="$emit('edit-task', task)"
          @delete="$emit('delete-task', task)"
          @dragstart="$emit('drag-start', $event, task)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Task } from '@/stores/task'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  title: string
  status: Task['status']
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'add-task', status: Task['status']): void
  (e: 'view-task', task: Task): void
  (e: 'edit-task', task: Task): void
  (e: 'delete-task', task: Task): void
  (e: 'drag-start', event: DragEvent, task: Task): void
  (e: 'drop', taskId: string, status: Task['status']): void
}>()

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    const taskId = event.dataTransfer.getData('text/plain')
    if (taskId) {
      emit('drop', taskId, props.status)
    }
  }
}
</script>

<style scoped>
.task-column {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  height: 100%;
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  margin-right: 16px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.column-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.add-task-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-task-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.column-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  /* Allow menus to overflow */
  overflow-x: visible;
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #9ca3af;
  text-align: center;
}

.empty-column i {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-column p {
  margin: 0;
  font-size: 14px;
}

.tasks-list {
  min-height: 100px;
  /* Ensure menus can overflow */
  overflow: visible;
}
</style>
