<script setup lang="ts">
import { ref, watch } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import CalendarDatePicker from '@/components/ui/CalendarDatePicker.vue'

interface Props {
  task: Task
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  delete: []
}>()

const taskStore = useTaskStore()
const title = ref(props.task.title)
const description = ref(props.task.description || '')
const selectedStatus = ref(props.task.status)
const startDate = ref<Date | null>(props.task.startDate || null)
const dueDate = ref<Date | null>(props.task.dueDate || null)

watch(() => props.task, (newTask) => {
  title.value = newTask.title
  description.value = newTask.description || ''
  selectedStatus.value = newTask.status
  startDate.value = newTask.startDate || null
  dueDate.value = newTask.dueDate || null
}, { immediate: true })

const handleUpdateTitle = () => {
  if (!title.value.trim()) {
    title.value = props.task.title // 空の場合は元に戻す
    return
  }
  taskStore.updateTask(props.task.id, {
    title: title.value.trim()
  })
}

const handleUpdateDescription = () => {
  taskStore.updateTask(props.task.id, {
    description: description.value
  })
}

const handleUpdateStatus = (e: Event) => {
  const target = e.target as HTMLSelectElement
  const status = target.value as Task['status']
  selectedStatus.value = status
  taskStore.updateTask(props.task.id, {
    status
  })
}

const handleUpdateStartDate = (date: Date | null) => {
  startDate.value = date
  taskStore.updateTask(props.task.id, {
    startDate: date || undefined
  })
}

const handleUpdateDueDate = (date: Date | null) => {
  dueDate.value = date
  taskStore.updateTask(props.task.id, {
    dueDate: date || undefined
  })
}

const handleDelete = () => {
  emit('delete')
}
</script>

<template>
  <Sheet :open="open" @update:open="(val) => !val && emit('close')">
    <SheetContent v-if="open" @close="emit('close')">
      <SheetHeader>
        <SheetTitle>タスクの編集</SheetTitle>
      </SheetHeader>

      <div class="space-y-6 mt-6">
        <!-- タスク名 -->
        <div>
          <h3 class="text-sm font-medium mb-2">タスク名</h3>
          <Input
            v-model="title"
            @blur="handleUpdateTitle"
            placeholder="タスク名を入力..."
          />
        </div>
        <!-- メタデータ -->
        <div class="space-y-3">
          <!-- ステータス -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">ステータス</span>
            <select
              :value="selectedStatus"
              @change="handleUpdateStatus"
              class="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">進行中</option>
              <option value="DONE">完了</option>
            </select>
          </div>

          <!-- 開始日 -->
          <CalendarDatePicker
            :model-value="startDate"
            label="開始日"
            @update:model-value="handleUpdateStartDate"
          />

          <!-- 期日 -->
          <CalendarDatePicker
            :model-value="dueDate"
            label="期日"
            @update:model-value="handleUpdateDueDate"
          />

          <!-- 担当 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">担当</span>
            <span class="text-sm">指定なし</span>
          </div>

          <!-- タグ -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">タグ</span>
            <span class="text-sm">指定なし</span>
          </div>

          <!-- タスクID -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">タスクID</span>
            <span class="text-sm font-mono text-xs">{{ task.id }}</span>
          </div>
        </div>

        <!-- 説明 -->
        <div>
          <h3 class="text-sm font-medium mb-2">説明</h3>
          <Textarea
            v-model="description"
            @blur="handleUpdateDescription"
            placeholder="説明を入力..."
            class="min-h-[200px]"
          />
        </div>

        <!-- サブタスク -->
        <div>
          <h3 class="text-sm font-medium mb-2">サブタスク</h3>
          <p class="text-sm text-gray-500">
            タスクを小さな単位に分割して管理できます。<br />
            サブタスクを追加して、作業を整理しましょう。
          </p>
        </div>

        <!-- 削除ボタン -->
        <div class="pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            @click="handleDelete"
            class="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
          >
            <Trash2 :size="16" class="mr-2" />
            タスクを削除
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
