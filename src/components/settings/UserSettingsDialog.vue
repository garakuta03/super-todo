<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useListStore } from '@/stores/listStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const listStore = useListStore()

// フォームの状態
const defaultListId = ref<string>('')

// 全てのリストを取得
const allLists = computed(() => listStore.allLists)

// ユーザープロファイルが変更されたらフォームに反映
watch(() => authStore.userProfile, (profile) => {
  if (profile) {
    defaultListId.value = profile.defaultListId || ''
  } else {
    defaultListId.value = ''
  }
}, { immediate: true })

// ダイアログが開かれたらフォームをリセット
watch(() => props.open, (isOpen) => {
  if (isOpen && authStore.userProfile) {
    defaultListId.value = authStore.userProfile.defaultListId || ''
  }
})

const handleSave = async () => {
  try {
    await authStore.updateUserProfile({
      defaultListId: defaultListId.value || undefined
    })
    alert('設定を保存しました')
    emit('close')
  } catch (error) {
    console.error('Failed to save settings:', error)
    alert('設定の保存に失敗しました')
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && handleClose()">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>ユーザー設定</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- デフォルトリスト -->
        <div class="space-y-2">
          <label class="text-sm font-medium">デフォルトリスト</label>
          <select
            v-model="defaultListId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">なし</option>
            <option
              v-for="list in allLists"
              :key="list.id"
              :value="list.id"
            >
              {{ list.icon ? `${list.icon} ` : '' }}{{ list.name }}
            </option>
          </select>
          <p class="text-xs text-gray-500">
            ログイン時に自動的に選択されるリストを設定できます
          </p>
        </div>

        <!-- ユーザー情報（読み取り専用） -->
        <div class="space-y-2 pt-4 border-t">
          <label class="text-sm font-medium">ユーザー情報</label>
          <div class="text-sm space-y-1">
            <p><span class="text-gray-500">表示名:</span> {{ authStore.userProfile?.displayName }}</p>
            <p><span class="text-gray-500">メール:</span> {{ authStore.userProfile?.email }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="handleClose">
          キャンセル
        </Button>
        <Button @click="handleSave">
          保存
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
