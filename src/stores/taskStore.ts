import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { nanoid } from 'nanoid'
import type { Task } from '@/lib/types'
import { tasksApi } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Record<string, Task>>({})
  const isLoading = ref(false)
  let unsubscribe: (() => void) | null = null

  // Firestoreリアルタイムリスナーを設定
  const setupFirestoreListener = () => {
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
  const createTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const authStore = useAuthStore()

    // ユーザーが認証されていない場合はエラー
    if (!authStore.user) {
      throw new Error('User must be authenticated to create tasks')
    }

    const task: Task = {
      ...taskData,
      id: nanoid(),
      userId: authStore.user.uid,  // 現在のユーザーIDを設定
      createdAt: new Date(),
      updatedAt: new Date()
    }

    tasks.value[task.id] = task

    try {
      await tasksApi.create(task)
    } catch (error) {
      console.error('Failed to create task in Firestore:', error)
      delete tasks.value[task.id]
      throw error
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

    try {
      await tasksApi.update(id, updates)
    } catch (error) {
      console.error('Failed to update task in Firestore:', error)
      tasks.value[id] = oldTask
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    const oldTask = tasks.value[id]
    delete tasks.value[id]

    try {
      await tasksApi.delete(id)
    } catch (error) {
      console.error('Failed to delete task in Firestore:', error)
      tasks.value[id] = oldTask
      throw error
    }
  }

  const toggleTask = async (id: string) => {
    if (!tasks.value[id]) return

    const completed = !tasks.value[id].completed
    await updateTask(id, { completed })
  }

  // 初期化 - Firestoreリスナーをセットアップ
  setupFirestoreListener()

  return {
    tasks,
    isLoading,
    allTasks,
    getTasksByListId,
    createTask,
    updateTask,
    deleteTask,
    toggleTask
  }
})
