<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
import { useSortable } from '@vueuse/integrations/useSortable'
import TaskRow from './TaskRow.vue'
import TaskPanel from './TaskPanel.vue'
import type { Task } from '@/lib/types'

const taskStore = useTaskStore()
const listStore = useListStore()

const selectedTask = ref<Task | null>(null)
const showPanel = ref(false)
const taskListRef = ref<HTMLDivElement | null>(null)

// ドラッグ&ドロップ用のタスクリスト（ref）
const sortableTasks = ref<Task[]>([])

// 現在のリストのタスクを取得（computed）
const tasks = computed(() => {
  if (!listStore.currentListId) return []
  return taskStore.getTasksByListId(listStore.currentListId)
})

// tasksが変更されたらsortableTasksを更新
watch(tasks, (newTasks) => {
  sortableTasks.value = [...newTasks]
}, { immediate: true })

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

// ドラッグ&ドロップの設定
useSortable(taskListRef, sortableTasks, {
  animation: 150,
  handle: '.drag-handle',
  ghostClass: 'opacity-50',
  onStart: () => {
    console.log('[TaskList] Drag started')
  },
  onEnd: async (event: any) => {
    console.log('[TaskList] Drag end:', { oldIndex: event.oldIndex, newIndex: event.newIndex })
    const { oldIndex, newIndex } = event
    if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
      console.log('[TaskList] No reorder needed')
      return
    }

    // sortableTasksは自動的に並び替えられているので、そのIDリストを取得
    const taskIds = sortableTasks.value.map(t => t.id)
    console.log('[TaskList] New task order:', taskIds)

    // Firestoreに並び順を保存
    try {
      await taskStore.reorderTasks(taskIds)
      console.log('[TaskList] Reorder successful')
    } catch (error) {
      console.error('[TaskList] Failed to reorder tasks:', error)
      // エラー時は元に戻す
      sortableTasks.value = [...tasks.value]
    }
  }
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
    <div v-if="sortableTasks.length > 0" ref="taskListRef">
      <TaskRow
        v-for="task in sortableTasks"
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
