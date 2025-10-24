import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import type { Task } from '@/lib/types'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Record<string, Task>>({})

  // LocalStorageから読み込み
  const loadFromStorage = () => {
    const stored = localStorage.getItem('tone-tasks')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Date オブジェクトに変換
      Object.keys(parsed).forEach((key) => {
        parsed[key].createdAt = new Date(parsed[key].createdAt)
        parsed[key].updatedAt = new Date(parsed[key].updatedAt)
        if (parsed[key].dueDate) {
          parsed[key].dueDate = new Date(parsed[key].dueDate)
        }
      })
      tasks.value = parsed
    }
  }

  // LocalStorageに保存
  const saveToStorage = () => {
    localStorage.setItem('tone-tasks', JSON.stringify(tasks.value))
  }

  // Getters
  const allTasks = computed(() => Object.values(tasks.value))

  const getTasksByListId = (listId: string) => {
    return allTasks.value
      .filter(task => task.listId === listId)
      .sort((a, b) => a.order - b.order)
  }

  // Actions
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...taskData,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    tasks.value[task.id] = task
    saveToStorage()
    return task
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    if (tasks.value[id]) {
      tasks.value[id] = {
        ...tasks.value[id],
        ...updates,
        updatedAt: new Date()
      }
      saveToStorage()
    }
  }

  const deleteTask = (id: string) => {
    delete tasks.value[id]
    saveToStorage()
  }

  const toggleTask = (id: string) => {
    if (tasks.value[id]) {
      tasks.value[id].completed = !tasks.value[id].completed
      tasks.value[id].updatedAt = new Date()
      saveToStorage()
    }
  }

  // 初期化時にローカルストレージから読み込み
  loadFromStorage()

  return {
    tasks,
    allTasks,
    getTasksByListId,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    loadFromStorage
  }
})
