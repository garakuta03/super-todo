import { defineStore } from 'pinia'
import { ref, computed, onUnmounted, watch } from 'vue'
import { nanoid } from 'nanoid'
import type { Project } from '@/lib/types'
import { projectsApi } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref<Record<string, Project>>({})
  const currentProjectId = ref<string>('')
  const isLoading = ref(false)
  let unsubscribe: (() => void) | null = null

  // Getters
  const allProjects = computed(() => Object.values(projects.value))

  const currentProject = computed(() =>
    currentProjectId.value ? projects.value[currentProjectId.value] : null
  )

  // 現在のワークスペースに属するプロジェクト
  const currentWorkspaceProjects = computed(() => {
    const workspaceStore = useWorkspaceStore()
    if (!workspaceStore.currentWorkspaceId) return []

    return allProjects.value.filter(
      project => project.workspaceId === workspaceStore.currentWorkspaceId
    )
  })

  // Actions
  const createProject = async (projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const authStore = useAuthStore()

    // ユーザーが認証されていない場合はエラー
    if (!authStore.user) {
      throw new Error('User must be authenticated to create projects')
    }

    const project: Project = {
      ...projectData,
      id: nanoid(),
      userId: authStore.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    projects.value[project.id] = project

    try {
      await projectsApi.create(project)
    } catch (error) {
      console.error('Failed to create project in Firestore:', error)
      delete projects.value[project.id]
      throw error
    }

    return project
  }

  // Firestoreリアルタイムリスナーを設定
  const setupFirestoreListener = () => {
    console.log('[ProjectStore] setupFirestoreListener called')
    const authStore = useAuthStore()

    console.log('[ProjectStore] authStore.user:', authStore.user)
    if (!authStore.user) {
      console.warn('[ProjectStore] Cannot setup project listener: user not authenticated')
      return
    }

    console.log('[ProjectStore] Setting up Firestore listener for userId:', authStore.user.uid)
    unsubscribe = projectsApi.subscribe(authStore.user.uid, (projectArray) => {
      console.log('[ProjectStore] Received projects from Firestore:', {
        count: projectArray.length,
        projects: projectArray.map(p => ({ id: p.id, name: p.name, workspaceId: p.workspaceId, userId: p.userId, order: p.order }))
      })
      projects.value = projectArray.reduce((acc, project) => {
        acc[project.id] = project
        return acc
      }, {} as Record<string, Project>)
      console.log('[ProjectStore] Updated projects state:', Object.keys(projects.value).length, 'projects')
    })
  }

  // 現在のワークスペースが変更されたとき、最初のプロジェクトを選択
  const workspaceStore = useWorkspaceStore()
  watch(
    () => workspaceStore.currentWorkspaceId,
    (newWorkspaceId) => {
      console.log('[ProjectStore] Workspace changed:', newWorkspaceId)
      if (!newWorkspaceId) {
        currentProjectId.value = ''
        return
      }

      // 現在のワークスペースに属するプロジェクトを取得
      const workspaceProjects = allProjects.value.filter(
        p => p.workspaceId === newWorkspaceId
      )

      console.log('[ProjectStore] Projects in workspace:', {
        workspaceId: newWorkspaceId,
        projectCount: workspaceProjects.length,
        projects: workspaceProjects.map(p => ({ id: p.id, name: p.name }))
      })

      if (workspaceProjects.length > 0) {
        // プロジェクトがある場合は最初のものを選択
        currentProjectId.value = workspaceProjects[0].id
        console.log('[ProjectStore] Selected first project:', workspaceProjects[0].id)
      } else {
        currentProjectId.value = ''
        console.log('[ProjectStore] No projects in workspace')
      }
    },
    { immediate: true }
  )

  // クリーンアップ
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!projects.value[id]) return

    const oldProject = { ...projects.value[id] }
    projects.value[id] = { ...projects.value[id], ...updates, updatedAt: new Date() }

    try {
      await projectsApi.update(id, updates)
    } catch (error) {
      console.error('Failed to update project in Firestore:', error)
      projects.value[id] = oldProject
      throw error
    }
  }

  const deleteProject = async (id: string) => {
    const oldProject = projects.value[id]
    delete projects.value[id]

    try {
      await projectsApi.delete(id)
    } catch (error) {
      console.error('Failed to delete project in Firestore:', error)
      projects.value[id] = oldProject
      throw error
    }
  }

  const setCurrentProject = (id: string) => {
    currentProjectId.value = id
  }

  // 初期化 - Firestoreリスナーをセットアップ
  setupFirestoreListener()

  return {
    projects,
    currentProjectId,
    isLoading,
    allProjects,
    currentProject,
    currentWorkspaceProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject
  }
})
