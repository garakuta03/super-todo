import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { nanoid } from 'nanoid'
import type { List } from '@/lib/types'
import { listsApi } from '@/lib/firestore'
import { useAuthStore } from '@/stores/authStore'

// Firestoreを使用するかどうか（環境変数で制御）
const USE_FIRESTORE = (import.meta.env.VITE_USE_FIRESTORE || 'false') === 'true'

export const useListStore = defineStore('list', () => {
  // State
  const lists = ref<Record<string, List>>({})
  const currentListId = ref<string>('')
  const isLoading = ref(false)
  let unsubscribe: (() => void) | null = null

  // LocalStorageから読み込み
  const loadFromStorage = () => {
    const stored = localStorage.getItem('tone-lists')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Date オブジェクトに変換
      Object.keys(parsed).forEach((key) => {
        parsed[key].createdAt = new Date(parsed[key].createdAt)
      })
      lists.value = parsed
    }

    // デフォルトリストがなければ作成（LocalStorageモードのみ）
    if (Object.keys(lists.value).length === 0 && !USE_FIRESTORE) {
      const authStore = useAuthStore()
      const defaultList: List = {
        name: '最初のタスクリスト',
        userId: authStore.user?.uid || 'anonymous',  // userIdを追加
        order: 0,
        id: nanoid(),
        createdAt: new Date()
      }
      lists.value[defaultList.id] = defaultList
      saveToStorage()
      currentListId.value = defaultList.id
    } else if (Object.keys(lists.value).length > 0) {
      currentListId.value = Object.keys(lists.value)[0]
    }
  }

  // LocalStorageに保存
  const saveToStorage = () => {
    localStorage.setItem('tone-lists', JSON.stringify(lists.value))
  }

  // Firestoreから読み込み
  const loadFromFirestore = async () => {
    if (!USE_FIRESTORE) return

    isLoading.value = true
    try {
      const listArray = await listsApi.getAll()
      lists.value = listArray.reduce((acc, list) => {
        acc[list.id] = list
        return acc
      }, {} as Record<string, List>)

      // デフォルトリストがなければ作成
      if (Object.keys(lists.value).length === 0) {
        const defaultList = await createList({ name: '最初のタスクリスト', order: 0 })
        currentListId.value = defaultList.id
      } else {
        currentListId.value = Object.keys(lists.value)[0]
      }
    } catch (error) {
      console.error('Failed to load lists from Firestore:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Firestoreリアルタイムリスナーを設定
  const setupFirestoreListener = () => {
    if (!USE_FIRESTORE) return

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

    if (USE_FIRESTORE) {
      try {
        await listsApi.create(list)
      } catch (error) {
        console.error('Failed to create list in Firestore:', error)
        delete lists.value[list.id]
        throw error
      }
    } else {
      saveToStorage()
    }

    return list
  }

  const updateList = async (id: string, updates: Partial<List>) => {
    if (!lists.value[id]) return

    const oldList = { ...lists.value[id] }
    lists.value[id] = { ...lists.value[id], ...updates }

    if (USE_FIRESTORE) {
      try {
        await listsApi.update(id, updates)
      } catch (error) {
        console.error('Failed to update list in Firestore:', error)
        lists.value[id] = oldList
        throw error
      }
    } else {
      saveToStorage()
    }
  }

  const deleteList = async (id: string) => {
    const oldList = lists.value[id]
    delete lists.value[id]

    if (USE_FIRESTORE) {
      try {
        await listsApi.delete(id)
      } catch (error) {
        console.error('Failed to delete list in Firestore:', error)
        lists.value[id] = oldList
        throw error
      }
    } else {
      saveToStorage()
    }
  }

  const setCurrentList = (id: string) => {
    currentListId.value = id
  }

  // 初期化
  if (USE_FIRESTORE) {
    setupFirestoreListener()
  } else {
    loadFromStorage()
  }

  return {
    lists,
    currentListId,
    isLoading,
    allLists,
    currentList,
    createList,
    updateList,
    deleteList,
    setCurrentList,
    loadFromStorage,
    loadFromFirestore
  }
})
