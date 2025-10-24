<script setup lang="ts">
import { useListStore } from '@/stores/listStore'
import { Button } from '@/components/ui/button'

const listStore = useListStore()
const emit = defineEmits<{
  openCreateModal: []
}>()
</script>

<template>
  <header class="border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- リスト名 -->
      <h1 class="text-xl font-bold text-gray-900">
        {{ listStore.currentList?.name || '最初のタスクリスト' }}
      </h1>

      <!-- 右側のアクション -->
      <div class="flex items-center gap-3">
        <!-- アバター -->
        <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-sm">
          S
        </div>

        <!-- 追加ボタン -->
        <Button
          @click="emit('openCreateModal')"
          class="bg-primary hover:bg-primary-hover text-white"
        >
          + 追加
        </Button>

        <!-- リストボタン -->
        <Button variant="outline" size="sm">
          ⊞ リスト
        </Button>
      </div>
    </div>
  </header>
</template>
