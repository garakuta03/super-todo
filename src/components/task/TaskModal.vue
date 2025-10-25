<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
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
const continueCreating = ref(false)
const validationError = ref<string>('')

// モーダルが閉じる時にリセット
watch(() => props.open, (newValue) => {
  if (!newValue) {
    title.value = ''
    continueCreating.value = false
    validationError.value = ''
  }
})

const handleSubmit = () => {
  // 入力検証
  const validation = validateTaskTitle(title.value)
  if (!validation.valid) {
    validationError.value = validation.error || '入力が無効です'
    return
  }

  if (!listStore.currentListId) {
    validationError.value = 'リストが選択されていません'
    return
  }

  try {
    taskStore.createTask({
      title: title.value.trim(),
      status: 'TODO',
      completed: false,
      listId: listStore.currentListId,
      order: taskStore.allTasks.length
    })

    validationError.value = ''

    if (continueCreating.value) {
      title.value = ''
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
        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center gap-2">
            <button class="text-sm text-gray-600 hover:text-gray-900">
              👤 担当者を追加
            </button>
            <button class="text-sm text-gray-600 hover:text-gray-900">
              📅
            </button>
          </div>

          <div class="flex gap-2">
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
      </div>
    </DialogContent>
  </Dialog>
</template>
