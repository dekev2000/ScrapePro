import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate: string | null
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  prospectId?: string
  prospectName?: string
}

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Task[]>([
    {
      id: '1',
      title: 'Review website design for Le Petit Bistro',
      description: 'Check the website design and provide feedback',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prospectId: '1',
      prospectName: 'Le Petit Bistro'
    },
    {
      id: '2',
      title: 'Send follow-up email to Bloom Boutique',
      description: 'Send a follow-up email to check if they liked the website',
      status: 'in_progress',
      priority: 'medium',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prospectId: '2',
      prospectName: 'Bloom Boutique'
    },
    {
      id: '3',
      title: 'Create content for Tech Solutions website',
      description: 'Write content for the services page',
      status: 'review',
      priority: 'medium',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prospectId: '3',
      prospectName: 'Tech Solutions'
    },
    {
      id: '4',
      title: 'Finalize contract with Fitness First',
      description: 'Review and finalize the contract',
      status: 'done',
      priority: 'high',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prospectId: '4',
      prospectName: 'Fitness First'
    },
    {
      id: '5',
      title: 'Schedule meeting with Green Gardens',
      description: 'Set up a meeting to discuss website requirements',
      status: 'todo',
      priority: 'low',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: 'user2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prospectId: '5',
      prospectName: 'Green Gardens'
    }
  ])

  // Getters
  const getTasks = computed(() => tasks.value)
  
  const getTasksByStatus = computed(() => {
    return (status: string) => tasks.value.filter(task => task.status === status)
  })
  
  const getTaskById = computed(() => {
    return (id: string) => tasks.value.find(task => task.id === id)
  })
  
  const getTasksByProspect = computed(() => {
    return (prospectId: string) => tasks.value.filter(task => task.prospectId === prospectId)
  })
  
  const getTasksByAssignee = computed(() => {
    return (assignedTo: string) => tasks.value.filter(task => task.assignedTo === assignedTo)
  })
  
  const getOverdueTasks = computed(() => {
    const now = new Date().toISOString()
    return tasks.value.filter(task => 
      task.dueDate && 
      task.dueDate < now && 
      task.status !== 'done'
    )
  })
  
  const getPendingTasksCount = computed(() => {
    return tasks.value.filter(task => task.status !== 'done').length
  })

  // Actions
  function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tasks.value.push(newTask)
    return newTask
  }
  
  function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      return tasks.value[index]
    }
    return null
  }
  
  function deleteTask(id: string) {
    const index = tasks.value.findIndex(task => task.id === id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      return true
    }
    return false
  }
  
  function updateTaskStatus(id: string, status: Task['status']) {
    return updateTask(id, { status })
  }

  return {
    tasks,
    getTasks,
    getTasksByStatus,
    getTaskById,
    getTasksByProspect,
    getTasksByAssignee,
    getOverdueTasks,
    getPendingTasksCount,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus
  }
})
