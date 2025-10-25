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
    const authStore = useAuthStore()

    if (!authStore.user) {
      console.warn('Cannot setup project listener: user not authenticated')
      return
    }

    unsubscribe = projectsApi.subscribe(authStore.user.uid, (projectArray) => {
      projects.value = projectArray.reduce((acc, project) => {
        acc[project.id] = project
        return acc
      }, {} as Record<string, Project>)
    })
  }

  // 現在のワークスペースが変更されたとき、最初のプロジェクトを選択
  const workspaceStore = useWorkspaceStore()
  watch(
    () => workspaceStore.currentWorkspaceId,
    (newWorkspaceId) => {
      if (!newWorkspaceId) {
        currentProjectId.value = ''
        return
      }

      // 現在のワークスペースに属するプロジェクトを取得
      const workspaceProjects = allProjects.value.filter(
        p => p.workspaceId === newWorkspaceId
      )

      if (workspaceProjects.length > 0) {
        // プロジェクトがある場合は最初のものを選択
        currentProjectId.value = workspaceProjects[0].id
      } else {
        currentProjectId.value = ''
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
    setCurrentProject,
    setupFirestoreListener
  }
})
