<template>
  <div class="task-form">
    <div class="form-group">
      <label for="task-title">Title</label>
      <input
        id="task-title"
        v-model="formData.title"
        type="text"
        placeholder="Enter task title"
        required
      />
    </div>
    
    <div class="form-group">
      <label for="task-description">Description</label>
      <textarea
        id="task-description"
        v-model="formData.description"
        rows="4"
        placeholder="Enter task description"
      ></textarea>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label for="task-status">Status</label>
        <select
          id="task-status"
          v-model="formData.status"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="task-priority">Priority</label>
        <select
          id="task-priority"
          v-model="formData.priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label for="task-due-date">Due Date</label>
        <input
          id="task-due-date"
          v-model="formData.dueDate"
          type="date"
        />
      </div>
      
      <div class="form-group">
        <label for="task-assigned-to">Assigned To</label>
        <select
          id="task-assigned-to"
          v-model="formData.assignedTo"
        >
          <option value="">Unassigned</option>
          <option value="user1">User 1</option>
          <option value="user2">User 2</option>
        </select>
      </div>
    </div>
    
    <div class="form-group">
      <label for="task-prospect">Related Prospect</label>
      <select
        id="task-prospect"
        v-model="selectedProspect"
      >
        <option value="">None</option>
        <option
          v-for="prospect in prospects"
          :key="prospect.id"
          :value="prospect.id"
        >
          {{ prospect.name }}
        </option>
      </select>
    </div>
    
    <div class="form-actions">
      <button
        class="btn secondary"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        class="btn primary"
        @click="submitForm"
        :disabled="!isFormValid"
      >
        {{ isEditing ? 'Update Task' : 'Create Task' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Task } from '@/stores/task'
import { useBusinessStore } from '@/stores/business'

const props = defineProps<{
  task?: Task
  initialStatus?: Task['status']
}>()

const emit = defineEmits<{
  (e: 'submit', task: Partial<Task>): void
  (e: 'cancel'): void
}>()

const businessStore = useBusinessStore()
const prospects = computed(() => businessStore.businesses)

const isEditing = computed(() => !!props.task)

const formData = ref({
  title: '',
  description: '',
  status: props.initialStatus || 'todo' as Task['status'],
  priority: 'medium' as Task['priority'],
  dueDate: '',
  assignedTo: ''
})

const selectedProspect = ref('')

const isFormValid = computed(() => {
  return formData.value.title.trim() !== ''
})

// Initialize form data if editing
onMounted(() => {
  if (props.task) {
    formData.value.title = props.task.title
    formData.value.description = props.task.description
    formData.value.status = props.task.status
    formData.value.priority = props.task.priority
    formData.value.dueDate = props.task.dueDate ? new Date(props.task.dueDate).toISOString().split('T')[0] : ''
    formData.value.assignedTo = props.task.assignedTo || ''
    selectedProspect.value = props.task.prospectId || ''
  }
})

// Initialize form data if initialStatus changes
watch(() => props.initialStatus, (newStatus) => {
  if (newStatus && !props.task) {
    formData.value.status = newStatus
  }
})

const submitForm = () => {
  if (!isFormValid.value) return
  
  const taskData: Partial<Task> = {
    ...formData.value,
    dueDate: formData.value.dueDate ? new Date(formData.value.dueDate).toISOString() : null
  }
  
  if (selectedProspect.value) {
    const prospect = prospects.value.find(p => p.id === selectedProspect.value)
    if (prospect) {
      taskData.prospectId = prospect.id
      taskData.prospectName = prospect.name
    }
  }
  
  emit('submit', taskData)
}
</script>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
