<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
import { useProjectStore } from '@/stores/projectStore'
import { validateTaskTitle } from '@/lib/validation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import CalendarDatePicker from '@/components/ui/CalendarDatePicker.vue'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const taskStore = useTaskStore()
const listStore = useListStore()

const title = ref('')
const startDate = ref<Date | null>(null)
const dueDate = ref<Date | null>(null)
const continueCreating = ref(false)
const validationError = ref<string>('')

// モーダルが閉じる時にリセット
watch(() => props.open, (newValue) => {
  if (!newValue) {
    title.value = ''
    startDate.value = null
    dueDate.value = null
    continueCreating.value = false
    validationError.value = ''
  }
})

const handleSubmit = async () => {
  // 入力検証
  const validation = validateTaskTitle(title.value)
  if (!validation.valid) {
    validationError.value = validation.error || '入力が無効です'
    return
  }

  // リストがない場合は作成を試みる
  if (!listStore.currentListId) {
    console.log('No current list, creating default list...')
    // プロジェクトIDが必要
    const projectStore = useProjectStore()
    if (!projectStore.currentProjectId) {
      validationError.value = 'プロジェクトが選択されていません'
      return
    }

    try {
      const defaultList = await listStore.createList({
        name: '最初のタスクリスト',
        projectId: projectStore.currentProjectId,
        order: 0
      })
      listStore.setCurrentList(defaultList.id)
    } catch (error) {
      console.error('Failed to create default list:', error)
      validationError.value = 'リストの作成に失敗しました'
      return
    }
  }

  try {
    await taskStore.createTask({
      title: title.value.trim(),
      status: 'TODO',
      completed: false,
      listId: listStore.currentListId,
      startDate: startDate.value || undefined,
      dueDate: dueDate.value || undefined,
      order: taskStore.allTasks.length
    })

    validationError.value = ''

    if (continueCreating.value) {
      title.value = ''
      startDate.value = null
      dueDate.value = null
    } else {
      emit('close')
    }
  } catch (error) {
    validationError.value = 'タスクの作成に失敗しました'
    console.error('Task creation failed:', error)
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && emit('close')">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>タスクを作成</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 mt-4">
        <!-- タイトル入力 -->
        <div>
          <Input
            v-model="title"
            placeholder="タスクを入力..."
            @keydown="handleKeydown"
            autofocus
            :class="{ 'border-red-500': validationError }"
          />
          <p v-if="validationError" class="text-sm text-red-600 mt-1">
            {{ validationError }}
          </p>
        </div>

        <!-- 開始日 -->
        <CalendarDatePicker
          v-model="startDate"
          label="開始日（任意）"
        />

        <!-- 期日 -->
        <CalendarDatePicker
          v-model="dueDate"
          label="期日（任意）"
        />

        <!-- 続けて作成チェックボックス -->
        <div class="flex items-center gap-2">
          <Checkbox
            id="continue"
            v-model:checked="continueCreating"
          />
          <label
            for="continue"
            class="text-sm text-gray-600 cursor-pointer"
          >
            続けて作成
          </label>
        </div>

        <!-- アクション -->
        <div class="flex gap-2 justify-end pt-2">
          <Button variant="outline" @click="emit('close')">
            キャンセル
          </Button>
          <Button
            @click="handleSubmit"
            :disabled="!title.trim()"
          >
            追加する
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
