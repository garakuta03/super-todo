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
    console.log('[TaskStore] setupFirestoreListener called')
    const authStore = useAuthStore()

    console.log('[TaskStore] authStore.user:', authStore.user)
    if (!authStore.user) {
      console.warn('[TaskStore] Cannot setup task listener: user not authenticated')
      return
    }

    console.log('[TaskStore] Setting up Firestore listener for userId:', authStore.user.uid)
    unsubscribe = tasksApi.subscribe(authStore.user.uid, (taskList) => {
      console.log('[TaskStore] Received tasks from Firestore:', {
        count: taskList.length,
        tasks: taskList.map(t => ({ id: t.id, title: t.title, listId: t.listId, userId: t.userId, order: t.order }))
      })
      tasks.value = taskList.reduce((acc, task) => {
        acc[task.id] = task
        return acc
      }, {} as Record<string, Task>)
      console.log('[TaskStore] Updated tasks state:', Object.keys(tasks.value).length, 'tasks')
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
    const filtered = allTasks.value
      .filter(task => task.listId === listId)
      .sort((a, b) => a.order - b.order)
    console.log('[TaskStore] getTasksByListId:', {
      listId,
      totalTasks: allTasks.value.length,
      filteredTasks: filtered.length,
      tasks: filtered.map(t => ({ id: t.id, title: t.title, order: t.order }))
    })
    return filtered
  }

  // Actions
  const createTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    console.log('[TaskStore] createTask called with:', taskData)
    const authStore = useAuthStore()

    // ユーザーが認証されていない場合はエラー
    if (!authStore.user) {
      console.error('[TaskStore] Cannot create task: user not authenticated')
      throw new Error('User must be authenticated to create tasks')
    }

    const task: Task = {
      ...taskData,
      id: nanoid(),
      userId: authStore.user.uid,  // 現在のユーザーIDを設定
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('[TaskStore] Creating task:', { id: task.id, title: task.title, userId: task.userId, listId: task.listId })
    tasks.value[task.id] = task

    try {
      await tasksApi.create(task)
      console.log('[TaskStore] Task created successfully in Firestore:', task.id)
    } catch (error) {
      console.error('[TaskStore] Failed to create task in Firestore:', error)
      delete tasks.value[task.id]
      throw error
    }

    return task
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    console.log('[TaskStore] updateTask called:', { id, updates })
    if (!tasks.value[id]) {
      console.warn('[TaskStore] Task not found:', id)
      return
    }

    const oldTask = { ...tasks.value[id] }
    tasks.value[id] = {
      ...tasks.value[id],
      ...updates,
      updatedAt: new Date()
    }

    try {
      await tasksApi.update(id, updates)
      console.log('[TaskStore] Task updated successfully in Firestore:', id)
    } catch (error) {
      console.error('[TaskStore] Failed to update task in Firestore:', error)
      tasks.value[id] = oldTask
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    console.log('[TaskStore] deleteTask called:', id)
    const oldTask = tasks.value[id]
    delete tasks.value[id]

    try {
      await tasksApi.delete(id)
      console.log('[TaskStore] Task deleted successfully from Firestore:', id)
    } catch (error) {
      console.error('[TaskStore] Failed to delete task in Firestore:', error)
      tasks.value[id] = oldTask
      throw error
    }
  }

  const toggleTask = async (id: string) => {
    console.log('[TaskStore] toggleTask called:', id)
    if (!tasks.value[id]) {
      console.warn('[TaskStore] Task not found for toggle:', id)
      return
    }

    const completed = !tasks.value[id].completed
    console.log('[TaskStore] Toggling task completed status:', { id, completed })
    await updateTask(id, { completed })
  }

  // タスクの並び替え
  const reorderTasks = async (taskIds: string[]) => {
    console.log('[TaskStore] reorderTasks called:', { taskIds })
    // 各タスクのorderを更新
    const updatePromises = taskIds.map((taskId, index) => {
      if (!tasks.value[taskId]) {
        console.warn('[TaskStore] Task not found in reorder:', taskId)
        return Promise.resolve()
      }
      console.log('[TaskStore] Updating task order:', { taskId, newOrder: index })
      return updateTask(taskId, { order: index })
    })

    try {
      await Promise.all(updatePromises)
      console.log('[TaskStore] Tasks reordered successfully')
    } catch (error) {
      console.error('[TaskStore] Failed to reorder tasks:', error)
      throw error
    }
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
    toggleTask,
    reorderTasks
  }
})
