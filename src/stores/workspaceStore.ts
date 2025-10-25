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
    console.log('[WorkspaceStore] createWorkspace called with:', workspaceData)
    const authStore = useAuthStore()

    // ユーザーが認証されていない場合はエラー
    if (!authStore.user) {
      console.error('[WorkspaceStore] Cannot create workspace: user not authenticated')
      throw new Error('User must be authenticated to create workspaces')
    }

    const workspace: Workspace = {
      ...workspaceData,
      id: nanoid(),
      userId: authStore.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('[WorkspaceStore] Creating workspace:', { id: workspace.id, name: workspace.name, userId: workspace.userId })
    workspaces.value[workspace.id] = workspace

    try {
      await workspacesApi.create(workspace)
      console.log('[WorkspaceStore] Workspace created successfully in Firestore:', workspace.id)
    } catch (error) {
      console.error('[WorkspaceStore] Failed to create workspace in Firestore:', error)
      delete workspaces.value[workspace.id]
      throw error
    }

    return workspace
  }

  // Firestoreリアルタイムリスナーを設定
  const setupFirestoreListener = () => {
    console.log('[WorkspaceStore] setupFirestoreListener called')
    const authStore = useAuthStore()

    console.log('[WorkspaceStore] authStore.user:', authStore.user)
    if (!authStore.user) {
      console.warn('[WorkspaceStore] Cannot setup workspace listener: user not authenticated')
      return
    }

    console.log('[WorkspaceStore] Setting up Firestore listener for userId:', authStore.user.uid)
    unsubscribe = workspacesApi.subscribe(authStore.user.uid, (workspaceArray) => {
      console.log('[WorkspaceStore] Received workspaces from Firestore:', {
        count: workspaceArray.length,
        workspaces: workspaceArray.map(w => ({ id: w.id, name: w.name, userId: w.userId, order: w.order }))
      })
      workspaces.value = workspaceArray.reduce((acc, workspace) => {
        acc[workspace.id] = workspace
        return acc
      }, {} as Record<string, Workspace>)

      console.log('[WorkspaceStore] Updated workspaces state:', Object.keys(workspaces.value).length, 'workspaces')

      // currentWorkspaceIdが設定されていない、または削除された場合
      if (!currentWorkspaceId.value || !workspaces.value[currentWorkspaceId.value]) {
        const firstWorkspaceId = Object.keys(workspaces.value)[0]
        console.log('[WorkspaceStore] Setting current workspace:', firstWorkspaceId || 'none')
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

  // 初期化 - Firestoreリスナーをセットアップ
  setupFirestoreListener()

  return {
    workspaces,
    currentWorkspaceId,
    isLoading,
    allWorkspaces,
    currentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace
  }
})
