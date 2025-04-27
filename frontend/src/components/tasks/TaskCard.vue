<template>
  <div
    :class="['task-card', `priority-${task.priority}`]"
    @click="$emit('click', task)"
    draggable="true"
    @dragstart="onDragStart"
  >
    <div class="task-header">
      <span class="task-title">{{ task.title }}</span>
      <div class="task-actions">
        <button
          class="action-btn"
          @click.stop="$emit('edit', task)"
        >
          <i class="fas fa-edit"></i>
        </button>
        <button
          class="action-btn"
          @click.stop="$emit('delete', task)"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <div class="task-body">
      <p class="task-description">{{ truncateDescription(task.description) }}</p>
      
      <div v-if="task.prospectName" class="task-prospect">
        <i class="fas fa-building"></i>
        <span>{{ task.prospectName }}</span>
      </div>
      
      <div class="task-meta">
        <div class="task-due-date" :class="{ overdue: isOverdue }">
          <i class="fas fa-calendar-alt"></i>
          <span>{{ formatDueDate(task.dueDate) }}</span>
        </div>
        
        <div class="task-assignee">
          <i class="fas fa-user"></i>
          <span>{{ task.assignedTo || 'Unassigned' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Task } from '@/stores/task'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  (e: 'click', task: Task): void
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'dragstart', event: DragEvent, task: Task): void
}>()

const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  return new Date(props.task.dueDate) < new Date() && props.task.status !== 'done'
})

const truncateDescription = (description: string) => {
  if (description.length > 100) {
    return description.substring(0, 100) + '...'
  }
  return description
}

const formatDueDate = (dueDate: string | null) => {
  if (!dueDate) return 'No due date'
  
  const date = new Date(dueDate)
  const now = new Date()
  
  // Today
  if (date.toDateString() === now.toDateString()) {
    return 'Today'
  }
  
  // Tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  }
  
  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  // Format as date
  return date.toLocaleDateString()
}

const onDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', props.task.id)
    event.dataTransfer.effectAllowed = 'move'
  }
  emit('dragstart', event, props.task)
}
</script>

<style scoped>
.task-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid #9ca3af;
  position: relative;
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-card.priority-low {
  border-left-color: #10b981;
}

.task-card.priority-medium {
  border-left-color: #f59e0b;
}

.task-card.priority-high {
  border-left-color: #ef4444;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.4;
  flex: 1;
}

.task-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.task-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-description {
  font-size: 12px;
  color: #4b5563;
  margin: 0;
  line-height: 1.5;
}

.task-prospect {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.task-due-date, .task-assignee {
  display: flex;
  align-items: center;
  gap: 6px;
}

.task-due-date.overdue {
  color: #ef4444;
  font-weight: 500;
}

.task-due-date i, .task-assignee i, .task-prospect i {
  font-size: 10px;
}
</style>
