<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-vue-next'

const emit = defineEmits<{
  complete: [displayName: string]
}>()

const displayName = ref('')
const isLoading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  const name = displayName.value.trim()

  if (!name) {
    error.value = '名前を入力してください'
    return
  }

  if (name.length > 50) {
    error.value = '名前は50文字以内で入力してください'
    return
  }

  error.value = ''
  isLoading.value = true

  try {
    emit('complete', name)
  } catch (err) {
    console.error('Setup failed:', err)
    error.value = 'セットアップに失敗しました。もう一度お試しください。'
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- ヘッダー -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <span class="text-3xl">👋</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            ようこそ！
          </h1>
          <p class="text-gray-600">
            始める前に、あなたの名前を教えてください
          </p>
        </div>

        <!-- フォーム -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
              表示名
            </label>
            <Input
              id="displayName"
              v-model="displayName"
              type="text"
              placeholder="山田 太郎"
              :disabled="isLoading"
              class="w-full"
              autocomplete="name"
              autofocus
            />
            <p v-if="error" class="mt-2 text-sm text-red-600">
              {{ error }}
            </p>
          </div>

          <Button
            type="submit"
            :disabled="isLoading || !displayName.trim()"
            class="w-full"
          >
            <Loader2
              v-if="isLoading"
              :size="16"
              class="mr-2 animate-spin"
            />
            <span v-if="isLoading">セットアップ中...</span>
            <span v-else>始める</span>
          </Button>
        </form>

        <!-- フッター -->
        <div class="mt-6 text-center text-sm text-gray-500">
          <p>アカウントの初期設定を行います</p>
          <p class="mt-1">ワークスペースとプロジェクトが自動作成されます</p>
        </div>
      </div>
    </div>
  </div>
</template>
