<script setup lang="ts">
import { ref, computed } from 'vue'
import { useListStore } from '@/stores/listStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { LogOut, Settings } from 'lucide-vue-next'
import UserSettingsDialog from '@/components/settings/UserSettingsDialog.vue'

const listStore = useListStore()
const authStore = useAuthStore()
const emit = defineEmits<{
  openCreateModal: []
}>()

const isSettingsOpen = ref(false)

const userInitial = computed(() => {
  return authStore.user?.displayName?.charAt(0).toUpperCase() ||
         authStore.user?.email?.charAt(0).toUpperCase() ||
         'U'
})

const openSettings = () => {
  isSettingsOpen.value = true
}

const handleSignOut = async () => {
  try {
    await authStore.signOut()
  } catch (error) {
    console.error('Sign out error:', error)
  }
}
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
        <!-- ユーザー情報 -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-sm">
            {{ userInitial }}
          </div>
          <span v-if="authStore.user?.displayName" class="text-sm text-gray-700">
            {{ authStore.user.displayName }}
          </span>
        </div>

        <!-- 追加ボタン -->
        <Button
          @click="emit('openCreateModal')"
          class="bg-primary hover:bg-primary-hover text-white"
        >
          + 追加
        </Button>

        <!-- 設定ボタン -->
        <Button
          @click="openSettings"
          variant="ghost"
          size="sm"
          title="設定"
        >
          <Settings :size="18" />
        </Button>

        <!-- ログアウトボタン -->
        <Button
          @click="handleSignOut"
          variant="ghost"
          size="sm"
          title="ログアウト"
        >
          <LogOut :size="18" />
        </Button>
      </div>
    </div>

    <!-- 設定ダイアログ -->
    <UserSettingsDialog
      :open="isSettingsOpen"
      @close="isSettingsOpen = false"
    />
  </header>
</template>
