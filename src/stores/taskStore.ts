import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { nanoid } from 'nanoid'
import type { Task } from '@/lib/types'
import { tasksApi } from '@/lib/firestore'

// Firestoreを使用するかどうか（環境変数で制御）
const USE_FIRESTORE = (import.meta.env.VITE_USE_FIRESTORE || 'false') === 'true'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Record<string, Task>>({})
  const isLoading = ref(false)
  let unsubscribe: (() => void) | null = null

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

  // Firestoreから読み込み
  const loadFromFirestore = async () => {
    if (!USE_FIRESTORE) return

    isLoading.value = true
    try {
      const taskList = await tasksApi.getAll()
      tasks.value = taskList.reduce((acc, task) => {
        acc[task.id] = task
        return acc
      }, {} as Record<string, Task>)
    } catch (error) {
      console.error('Failed to load tasks from Firestore:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Firestoreリアルタイムリスナーを設定
  const setupFirestoreListener = () => {
    if (!USE_FIRESTORE) return

    unsubscribe = tasksApi.subscribe((taskList) => {
      tasks.value = taskList.reduce((acc, task) => {
        acc[task.id] = task
        return acc
      }, {} as Record<string, Task>)
    })
  }

  // クリーンアップ
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  // Getters
  const allTasks = computed(() => Object.values(tasks.value))

  const getTasksByListId = (listId: string) => {
    return allTasks.value
      .filter(task => task.listId === listId)
      .sort((a, b) => a.order - b.order)
  }

  // Actions
  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...taskData,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    tasks.value[task.id] = task

    if (USE_FIRESTORE) {
      try {
        await tasksApi.create(task)
      } catch (error) {
        console.error('Failed to create task in Firestore:', error)
        delete tasks.value[task.id]
        throw error
      }
    } else {
      saveToStorage()
    }

    return task
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!tasks.value[id]) return

    const oldTask = { ...tasks.value[id] }
    tasks.value[id] = {
      ...tasks.value[id],
      ...updates,
      updatedAt: new Date()
    }

    if (USE_FIRESTORE) {
      try {
        await tasksApi.update(id, updates)
      } catch (error) {
        console.error('Failed to update task in Firestore:', error)
        tasks.value[id] = oldTask
        throw error
      }
    } else {
      saveToStorage()
    }
  }

  const deleteTask = async (id: string) => {
    const oldTask = tasks.value[id]
    delete tasks.value[id]

    if (USE_FIRESTORE) {
      try {
        await tasksApi.delete(id)
      } catch (error) {
        console.error('Failed to delete task in Firestore:', error)
        tasks.value[id] = oldTask
        throw error
      }
    } else {
      saveToStorage()
    }
  }

  const toggleTask = async (id: string) => {
    if (!tasks.value[id]) return

    const completed = !tasks.value[id].completed
    await updateTask(id, { completed })
  }

  // 初期化
  if (USE_FIRESTORE) {
    setupFirestoreListener()
  } else {
    loadFromStorage()
  }

  return {
    tasks,
    isLoading,
    allTasks,
    getTasksByListId,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    loadFromStorage,
    loadFromFirestore
  }
})
