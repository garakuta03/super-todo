import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { nanoid } from 'nanoid'
import type { Workspace } from '@/lib/types'
import { workspacesApi } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'

export const useWorkspaceStore = defineStore('workspace', () => {
  // State
  const workspaces = ref<Record<string, Workspace>>({})
  const currentWorkspaceId = ref<string>('')
  const isLoading = ref(false)
  let unsubscribe: (() => void) | null = null

  // Getters
  const allWorkspaces = computed(() => Object.values(workspaces.value))

  const currentWorkspace = computed(() =>
    currentWorkspaceId.value ? workspaces.value[currentWorkspaceId.value] : null
  )

  // Actions
  const createWorkspace = async (workspaceData: Omit<Workspace, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const authStore = useAuthStore()

    // ユーザーが認証されていない場合はエラー
    if (!authStore.user) {
      throw new Error('User must be authenticated to create workspaces')
    }

    const workspace: Workspace = {
      ...workspaceData,
      id: nanoid(),
      userId: authStore.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    workspaces.value[workspace.id] = workspace

    try {
      await workspacesApi.create(workspace)
    } catch (error) {
      console.error('Failed to create workspace in Firestore:', error)
      delete workspaces.value[workspace.id]
      throw error
    }

    return workspace
  }

  // Firestoreリアルタイムリスナーを設定
  const setupFirestoreListener = () => {
    const authStore = useAuthStore()

    if (!authStore.user) {
      console.warn('Cannot setup workspace listener: user not authenticated')
      return
    }

    unsubscribe = workspacesApi.subscribe(authStore.user.uid, (workspaceArray) => {
      workspaces.value = workspaceArray.reduce((acc, workspace) => {
        acc[workspace.id] = workspace
        return acc
      }, {} as Record<string, Workspace>)

      // currentWorkspaceIdが設定されていない、または削除された場合
      if (!currentWorkspaceId.value || !workspaces.value[currentWorkspaceId.value]) {
        const firstWorkspaceId = Object.keys(workspaces.value)[0]
        if (firstWorkspaceId) {
          currentWorkspaceId.value = firstWorkspaceId
        }
      }
    })
  }

  // クリーンアップ
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
    if (!workspaces.value[id]) return

    const oldWorkspace = { ...workspaces.value[id] }
    workspaces.value[id] = { ...workspaces.value[id], ...updates, updatedAt: new Date() }

    try {
      await workspacesApi.update(id, updates)
    } catch (error) {
      console.error('Failed to update workspace in Firestore:', error)
      workspaces.value[id] = oldWorkspace
      throw error
    }
  }

  const deleteWorkspace = async (id: string) => {
    const oldWorkspace = workspaces.value[id]
    delete workspaces.value[id]

    try {
      await workspacesApi.delete(id)
    } catch (error) {
      console.error('Failed to delete workspace in Firestore:', error)
      workspaces.value[id] = oldWorkspace
      throw error
    }
  }

  const setCurrentWorkspace = (id: string) => {
    currentWorkspaceId.value = id
  }

  return {
    workspaces,
    currentWorkspaceId,
    isLoading,
    allWorkspaces,
    currentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    setupFirestoreListener
  }
})
