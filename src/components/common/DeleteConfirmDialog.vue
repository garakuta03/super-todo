<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  title?: string
  message?: string
  itemName?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

withDefaults(defineProps<Props>(), {
  title: '削除の確認',
  message: '本当に削除しますか？この操作は取り消せません。',
})

const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && handleClose()">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>

      <div class="py-4">
        <p class="text-sm text-gray-600">{{ message }}</p>
        <p v-if="itemName" class="mt-2 text-sm font-medium text-gray-900">
          「{{ itemName }}」
        </p>
      </div>

      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="handleClose">
          キャンセル
        </Button>
        <Button
          @click="handleConfirm"
          class="bg-red-600 hover:bg-red-700 text-white"
        >
          削除
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
