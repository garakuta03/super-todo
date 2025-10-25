import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { nanoid } from 'nanoid'
import type { List } from '@/lib/types'
import { listsApi } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'

export const useListStore = defineStore('list', () => {
  // State
  const lists = ref<Record<string, List>>({})
  const currentListId = ref<string>('')
  const isLoading = ref(false)
  let unsubscribe: (() => void) | null = null

  // Firestoreリアルタイムリスナーを設定
  const setupFirestoreListener = () => {
    unsubscribe = listsApi.subscribe((listArray) => {
      lists.value = listArray.reduce((acc, list) => {
        acc[list.id] = list
        return acc
      }, {} as Record<string, List>)

      // currentListIdが設定されていない、または削除された場合
      if (!currentListId.value || !lists.value[currentListId.value]) {
        const firstListId = Object.keys(lists.value)[0]
        if (firstListId) {
          currentListId.value = firstListId
        } else {
          // リストがない場合は新規作成
          createList({ name: '最初のタスクリスト', order: 0 }).then(list => {
            currentListId.value = list.id
          })
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

  // Getters
  const allLists = computed(() => Object.values(lists.value))

  const currentList = computed(() =>
    currentListId.value ? lists.value[currentListId.value] : null
  )

  // Actions
  const createList = async (listData: Omit<List, 'id' | 'userId' | 'createdAt'>) => {
    const authStore = useAuthStore()

    // ユーザーが認証されていない場合はエラー
    if (!authStore.user) {
      throw new Error('User must be authenticated to create lists')
    }

    const list: List = {
      ...listData,
      id: nanoid(),
      userId: authStore.user.uid,  // 現在のユーザーIDを設定
      createdAt: new Date()
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
    createList,
    updateList,
    deleteList,
    setCurrentList
  }
})
