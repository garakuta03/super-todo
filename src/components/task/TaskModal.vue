<script setup lang="ts">
// タスク作成モーダル（後で実装）
interface Props {
  open: boolean
}

defineProps<Props>()
defineEmits<{
  close: []
}>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h2 class="text-lg font-bold mb-4">タスク作成</h2>
      <p class="text-gray-600 text-sm">後で実装します...</p>
      <button
        @click="$emit('close')"
        class="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        閉じる
      </button>
    </div>
  </div>
</template>
