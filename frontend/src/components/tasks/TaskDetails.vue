<template>
  <div class="task-details">
    <div class="task-header">
      <h2 class="task-title">{{ task.title }}</h2>
      <div class="task-actions">
        <button
          class="action-btn"
          @click="$emit('edit', task)"
        >
          <i class="fas fa-edit"></i> Edit
        </button>
        <button
          class="action-btn delete"
          @click="$emit('delete', task)"
        >
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
    
    <div class="task-meta">
      <div class="meta-item">
        <span class="meta-label">Status:</span>
        <span :class="['status-badge', `status-${task.status}`]">
          {{ formatStatus(task.status) }}
        </span>
      </div>
      
      <div class="meta-item">
        <span class="meta-label">Priority:</span>
        <span :class="['priority-badge', `priority-${task.priority}`]">
          {{ formatPriority(task.priority) }}
        </span>
      </div>
      
      <div class="meta-item">
        <span class="meta-label">Due Date:</span>
        <span :class="{ 'overdue': isOverdue }">
          {{ formatDueDate(task.dueDate) }}
        </span>
      </div>
      
      <div class="meta-item">
        <span class="meta-label">Assigned To:</span>
        <span>{{ task.assignedTo || 'Unassigned' }}</span>
      </div>
      
      <div v-if="task.prospectName" class="meta-item">
        <span class="meta-label">Related Prospect:</span>
        <a
          href="#"
          @click.prevent="$emit('view-prospect', task.prospectId)"
        >
          {{ task.prospectName }}
        </a>
      </div>
    </div>
    
    <div class="task-description">
      <h3>Description</h3>
      <p>{{ task.description || 'No description provided.' }}</p>
    </div>
    
    <div class="task-dates">
      <div class="date-item">
        <span class="date-label">Created:</span>
        <span>{{ formatDateTime(task.createdAt) }}</span>
      </div>
      
      <div class="date-item">
        <span class="date-label">Last Updated:</span>
        <span>{{ formatDateTime(task.updatedAt) }}</span>
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
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'view-prospect', prospectId?: string): void
}>()

const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  return new Date(props.task.dueDate) < new Date() && props.task.status !== 'done'
})

const formatStatus = (status: Task['status']) => {
  switch (status) {
    case 'todo': return 'To Do'
    case 'in_progress': return 'In Progress'
    case 'review': return 'Review'
    case 'done': return 'Done'
    default: return status
  }
}

const formatPriority = (priority: Task['priority']) => {
  switch (priority) {
    case 'low': return 'Low'
    case 'medium': return 'Medium'
    case 'high': return 'High'
    default: return priority
  }
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

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  
  const date = new Date(dateTime)
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
}
</script>

<style scoped>
.task-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.task-title {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
  flex: 1;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.action-btn.delete:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.task-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.status-badge, .priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.status-badge.status-todo {
  background-color: #e5e7eb;
  color: #4b5563;
}

.status-badge.status-in_progress {
  background-color: #dbeafe;
  color: #3b82f6;
}

.status-badge.status-review {
  background-color: #fef3c7;
  color: #f59e0b;
}

.status-badge.status-done {
  background-color: #d1fae5;
  color: #10b981;
}

.priority-badge.priority-low {
  background-color: #d1fae5;
  color: #10b981;
}

.priority-badge.priority-medium {
  background-color: #fef3c7;
  color: #f59e0b;
}

.priority-badge.priority-high {
  background-color: #fee2e2;
  color: #ef4444;
}

.overdue {
  color: #ef4444;
  font-weight: 500;
}

.task-description h3 {
  font-size: 16px;
  margin: 0 0 12px 0;
  color: #374151;
}

.task-description p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-line;
}

.task-dates {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.date-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-label {
  font-weight: 500;
}
</style>
