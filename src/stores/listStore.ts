import { defineStore } from 'pinia'
import { ref, computed, onUnmounted, watch } from 'vue'
import { nanoid } from 'nanoid'
import type { List } from '@/lib/types'
import { listsApi } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'

export const useListStore = defineStore('list', () => {
  // State
  const lists = ref<Record<string, List>>({})
  const currentListId = ref<string>('')
  const isLoading = ref(false)
  let unsubscribe: (() => void) | null = null

  // Getters
  const allLists = computed(() => Object.values(lists.value))

  const currentList = computed(() =>
    currentListId.value ? lists.value[currentListId.value] : null
  )

  // 現在のプロジェクトに属するリスト
  const currentProjectLists = computed(() => {
    const projectStore = useProjectStore()
    if (!projectStore.currentProjectId) return []

    return allLists.value.filter(
      list => list.projectId === projectStore.currentProjectId
    )
  })

  // Actions
  const createList = async (listData: Omit<List, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const authStore = useAuthStore()

    // ユーザーが認証されていない場合はエラー
    if (!authStore.user) {
      throw new Error('User must be authenticated to create lists')
    }

    const list: List = {
      ...listData,
      id: nanoid(),
      userId: authStore.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    lists.value[list.id] = list

    try {
      await listsApi.create(list)
    } catch (error) {
      console.error('Failed to create list in Firestore:', error)
      delete lists.value[list.id]
      throw error
    }

    return list
  }

  // Firestoreリアルタイムリスナーを設定
  const setupFirestoreListener = () => {
    console.log('[ListStore] setupFirestoreListener called')
    const authStore = useAuthStore()

    console.log('[ListStore] authStore.user:', authStore.user)
    if (!authStore.user) {
      console.warn('[ListStore] Cannot setup list listener: user not authenticated')
      return
    }

    console.log('[ListStore] Setting up Firestore listener for userId:', authStore.user.uid)
    unsubscribe = listsApi.subscribe(authStore.user.uid, (listArray) => {
      console.log('[ListStore] Received lists from Firestore:', {
        count: listArray.length,
        lists: listArray.map(l => ({ id: l.id, name: l.name, projectId: l.projectId, userId: l.userId, order: l.order }))
      })
      lists.value = listArray.reduce((acc, list) => {
        acc[list.id] = list
        return acc
      }, {} as Record<string, List>)
      console.log('[ListStore] Updated lists state:', Object.keys(lists.value).length, 'lists')
    })
  }

  // 現在のプロジェクトが変更されたとき、最初のリストを選択
  const projectStore = useProjectStore()
  watch(
    () => projectStore.currentProjectId,
    (newProjectId) => {
      console.log('[ListStore] Project changed:', newProjectId)
      if (!newProjectId) {
        currentListId.value = ''
        return
      }

      // 現在のプロジェクトに属するリストを取得
      const projectLists = allLists.value.filter(
        l => l.projectId === newProjectId
      )

      console.log('[ListStore] Lists in project:', {
        projectId: newProjectId,
        listCount: projectLists.length,
        lists: projectLists.map(l => ({ id: l.id, name: l.name }))
      })

      if (projectLists.length > 0) {
        // リストがある場合は最初のものを選択
        currentListId.value = projectLists[0].id
        console.log('[ListStore] Selected first list:', projectLists[0].id)
      } else {
        currentListId.value = ''
        console.log('[ListStore] No lists in project')
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

  const updateList = async (id: string, updates: Partial<List>) => {
    if (!lists.value[id]) return

    const oldList = { ...lists.value[id] }
    lists.value[id] = { ...lists.value[id], ...updates }

    try {
      await listsApi.update(id, updates)
    } catch (error) {
      console.error('Failed to update list in Firestore:', error)
      lists.value[id] = oldList
      throw error
    }
  }

  const deleteList = async (id: string) => {
    const oldList = lists.value[id]
    delete lists.value[id]

    try {
      await listsApi.delete(id)
    } catch (error) {
      console.error('Failed to delete list in Firestore:', error)
      lists.value[id] = oldList
      throw error
    }
  }

  const setCurrentList = (id: string) => {
    currentListId.value = id
  }

  // 初期化 - Firestoreリスナーをセットアップ
  setupFirestoreListener()

  return {
    lists,
    currentListId,
    isLoading,
    allLists,
    currentList,
    currentProjectLists,
    createList,
    updateList,
    deleteList,
    setCurrentList
  }
})
