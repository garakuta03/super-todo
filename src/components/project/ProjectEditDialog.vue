<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Project } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  project: Project | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: { name: string; icon?: string; color?: string }): void
  (e: 'delete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// フォームの状態
const name = ref('')
const icon = ref('')
const color = ref('')

// プロジェクトが変更されたらフォームに反映
watch(() => props.project, (project) => {
  if (project) {
    name.value = project.name
    icon.value = project.icon || ''
    color.value = project.color || ''
  } else {
    name.value = ''
    icon.value = ''
    color.value = ''
  }
}, { immediate: true })

const handleSave = () => {
  if (!name.value.trim()) {
    alert('プロジェクト名を入力してください')
    return
  }

  emit('save', {
    name: name.value.trim(),
    icon: icon.value || undefined,
    color: color.value || undefined,
  })
}

const handleClose = () => {
  emit('close')
}

const handleDelete = () => {
  emit('delete')
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && handleClose()">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>プロジェクトを編集</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- プロジェクト名 -->
        <div class="space-y-2">
          <label class="text-sm font-medium">プロジェクト名</label>
          <Input
            v-model="name"
            placeholder="プロジェクト名を入力"
            @keyup.enter="handleSave"
          />
        </div>

        <!-- アイコン -->
        <div class="space-y-2">
          <label class="text-sm font-medium">アイコン（絵文字）</label>
          <Input
            v-model="icon"
            placeholder="📁"
            maxlength="2"
          />
          <p class="text-xs text-gray-500">絵文字を入力してください（例: 📁, 📂, 💼）</p>
        </div>

        <!-- カラー -->
        <div class="space-y-2">
          <label class="text-sm font-medium">カラー</label>
          <div class="flex gap-2 items-center">
            <Input
              v-model="color"
              type="color"
              class="w-20 h-10 cursor-pointer"
            />
            <Input
              v-model="color"
              placeholder="#3B82F6"
              class="flex-1"
            />
          </div>
          <p class="text-xs text-gray-500">カラーコードを入力してください（例: #3B82F6）</p>
        </div>
      </div>

      <div class="flex justify-between">
        <Button
          variant="outline"
          @click="handleDelete"
          class="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          削除
        </Button>
        <div class="flex gap-2">
          <Button variant="outline" @click="handleClose">
            キャンセル
          </Button>
          <Button @click="handleSave">
            保存
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
