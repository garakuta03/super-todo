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
  draggable: '.task-row',
  ghostClass: 'opacity-50',
  chosenClass: 'bg-blue-50',
  dragClass: 'opacity-0',
  onEnd: async (event: any) => {
    const { oldIndex, newIndex } = event
    if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
      return
    }

    // 現在の表示順序のコピーを作成
    const currentOrder = [...sortableTasks.value]

    // 手動で並び替えを実行
    const [movedTask] = currentOrder.splice(oldIndex, 1)
    currentOrder.splice(newIndex, 0, movedTask)

    const taskIds = currentOrder.map(t => t.id)

    // Firestoreに並び順を保存
    try {
      await taskStore.reorderTasks(taskIds)
    } catch (error) {
      console.error('Failed to reorder tasks:', error)
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
    <div ref="taskListRef">
      <TaskRow
        v-for="task in sortableTasks"
        :key="task.id"
        :task="task"
        @toggle="handleToggle"
        @click="handleClick"
      />
    </div>

    <!-- 空の状態 -->
    <div v-if="sortableTasks.length === 0" class="text-center py-12 text-gray-500">
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
