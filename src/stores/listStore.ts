import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import type { List } from '@/lib/types'

export const useListStore = defineStore('list', () => {
  // State
  const lists = ref<Record<string, List>>({})
  const currentListId = ref<string>('')

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

    // デフォルトリストがなければ作成
    if (Object.keys(lists.value).length === 0) {
      const defaultList = createList({ name: '最初のタスクリスト', order: 0 })
      currentListId.value = defaultList.id
    } else {
      currentListId.value = Object.keys(lists.value)[0]
    }
  }

  // LocalStorageに保存
  const saveToStorage = () => {
    localStorage.setItem('tone-lists', JSON.stringify(lists.value))
  }

  // Getters
  const allLists = computed(() => Object.values(lists.value))

  const currentList = computed(() =>
    currentListId.value ? lists.value[currentListId.value] : null
  )

  // Actions
  const createList = (listData: Omit<List, 'id' | 'createdAt'>) => {
    const list: List = {
      ...listData,
      id: nanoid(),
      createdAt: new Date()
    }

    lists.value[list.id] = list
    saveToStorage()
    return list
  }

  const updateList = (id: string, updates: Partial<List>) => {
    if (lists.value[id]) {
      lists.value[id] = { ...lists.value[id], ...updates }
      saveToStorage()
    }
  }

  const deleteList = (id: string) => {
    delete lists.value[id]
    saveToStorage()
  }

  const setCurrentList = (id: string) => {
    currentListId.value = id
  }

  // 初期化
  loadFromStorage()

  return {
    lists,
    currentListId,
    allLists,
    currentList,
    createList,
    updateList,
    deleteList,
    setCurrentList
  }
})
