<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'

const taskStore = useTaskStore()
const listStore = useListStore()

const tasks = computed(() => {
  if (!listStore.currentListId) return []
  return taskStore.getTasksByListId(listStore.currentListId)
})
</script>

<template>
  <div class="max-w-6xl">
    <!-- フィルタエリア -->
    <div class="mb-4">
      <button class="text-sm text-gray-600 hover:text-gray-900">
        + フィルタを追加
      </button>
    </div>

    <!-- 空の状態 -->
    <div v-if="tasks.length === 0" class="text-center py-12 text-gray-500">
      タスクがありません。「+ 追加」ボタンから作成してください。
    </div>

    <!-- タスク一覧（後で実装） -->
    <div v-else class="text-center py-12 text-gray-500">
      {{ tasks.length }}件のタスクがあります
    </div>
  </div>
</template>
