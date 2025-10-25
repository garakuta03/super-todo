<script setup lang="ts">
import { ref, watch } from 'vue'
import type { List } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  open: boolean
  list: List | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: { name: string; icon?: string; color?: string; useStartDate?: boolean }): void
  (e: 'delete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// フォームの状態
const name = ref('')
const icon = ref('')
const color = ref('')
const useStartDate = ref(false)

// リストが変更されたらフォームに反映
watch(() => props.list, (list) => {
  if (list) {
    name.value = list.name
    icon.value = list.icon || ''
    color.value = list.color || ''
    useStartDate.value = list.useStartDate || false
  } else {
    name.value = ''
    icon.value = ''
    color.value = ''
    useStartDate.value = false
  }
}, { immediate: true })

const handleSave = () => {
  if (!name.value.trim()) {
    alert('リスト名を入力してください')
    return
  }

  emit('save', {
    name: name.value.trim(),
    icon: icon.value || undefined,
    color: color.value || undefined,
    useStartDate: useStartDate.value,
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
        <DialogTitle>リストを編集</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- リスト名 -->
        <div class="space-y-2">
          <label class="text-sm font-medium">リスト名</label>
          <Input
            v-model="name"
            placeholder="リスト名を入力"
            @keyup.enter="handleSave"
          />
        </div>

        <!-- アイコン -->
        <div class="space-y-2">
          <label class="text-sm font-medium">アイコン（絵文字）</label>
          <Input
            v-model="icon"
            placeholder="📋"
            maxlength="2"
          />
          <p class="text-xs text-gray-500">絵文字を入力してください（例: 📋, ✅, 📝）</p>
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

        <!-- 開始日を使用する -->
        <div class="flex items-center gap-2 pt-2 border-t">
          <Checkbox
            id="useStartDate"
            v-model:checked="useStartDate"
          />
          <label
            for="useStartDate"
            class="text-sm font-medium cursor-pointer"
          >
            開始日を使用する
          </label>
        </div>
        <p class="text-xs text-gray-500 -mt-2">
          チェックを入れると、このリストのタスクで開始日を設定できるようになります
        </p>
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
