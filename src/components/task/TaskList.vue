<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
import TaskRow from './TaskRow.vue'
import TaskPanel from './TaskPanel.vue'
import type { Task } from '@/lib/types'

const taskStore = useTaskStore()
const listStore = useListStore()

const selectedTask = ref<Task | null>(null)
const showPanel = ref(false)

const tasks = computed(() => {
  if (!listStore.currentListId) return []
  return taskStore.getTasksByListId(listStore.currentListId)
})

const handleToggle = (id: string) => {
  taskStore.toggleTask(id)
}

const handleClick = (task: Task) => {
  selectedTask.value = task
  showPanel.value = true
}

const handleClosePanel = () => {
  showPanel.value = false
  selectedTask.value = null
}
</script>

<template>
  <div class="max-w-6xl">
    <!-- フィルタエリア -->
    <div class="mb-4">
      <button class="text-sm text-gray-600 hover:text-gray-900">
        + フィルタを追加
      </button>
    </div>

    <!-- テーブルヘッダー -->
    <div class="grid grid-cols-[auto_auto_auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-600">
      <div></div>
      <div></div>
      <div></div>
      <div>タイトル</div>
      <div>期間</div>
      <div>担当</div>
      <div>タグ</div>
      <div></div>
    </div>

    <!-- タスク一覧 -->
    <div v-if="tasks.length > 0">
      <TaskRow
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="handleToggle"
        @click="handleClick"
      />
    </div>

    <!-- 空の状態 -->
    <div v-else class="text-center py-12 text-gray-500">
      タスクがありません。「+ 追加」ボタンから作成してください。
    </div>

    <!-- タスク詳細パネル -->
    <TaskPanel
      v-if="selectedTask"
      :task="selectedTask"
      :open="showPanel"
      @close="handleClosePanel"
    />
  </div>
</template>
