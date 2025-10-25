<script setup lang="ts">
import { ref, onMounted, watchEffect, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useProjectStore } from '@/stores/projectStore'
import { useListStore } from '@/stores/listStore'
import { useTaskStore } from '@/stores/taskStore'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import TaskList from '@/components/task/TaskList.vue'
import TaskModal from '@/components/task/TaskModal.vue'
import LoginPage from '@/components/auth/LoginPage.vue'
import SetupPage from '@/components/auth/SetupPage.vue'
import { initializeNewUser } from '@/lib/initializeUser'

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const listStore = useListStore()
const taskStore = useTaskStore()
const showCreateModal = ref(false)
const storesInitialized = ref(false)

const handleOpenCreateModal = () => {
  showCreateModal.value = true
}

const handleSetupComplete = async (displayName: string) => {
  if (!authStore.user) return

  try {
    await initializeNewUser(
      authStore.user.uid,
      authStore.user.email || '',
      displayName,
      authStore.user.photoURL || undefined
    )
    authStore.completeSetup()
  } catch (error) {
    console.error('Failed to initialize user:', error)
    throw error
  }
}

onMounted(() => {
  authStore.initAuth()
})

// 認証完了後にストアのリスナーをセットアップ
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated && !authStore.needsSetup && !storesInitialized.value) {
    // 全てのストアのFirestoreリスナーをセットアップ
    workspaceStore.setupFirestoreListener()
    projectStore.setupFirestoreListener()
    listStore.setupFirestoreListener()
    taskStore.setupFirestoreListener()
    storesInitialized.value = true
  }
}, { immediate: true })

// デフォルトリストの自動選択
watchEffect(() => {
  const userProfile = authStore.userProfile
  const defaultListId = userProfile?.defaultListId

  // ユーザープロファイルが読み込まれ、デフォルトリストが設定されている場合
  if (defaultListId && listStore.allLists.length > 0) {
    // デフォルトリストが実際に存在するかチェック
    const defaultListExists = listStore.allLists.some(list => list.id === defaultListId)

    // デフォルトリストが存在し、現在リストが選択されていない場合のみ自動選択
    if (defaultListExists && !listStore.currentListId) {
      listStore.setCurrentList(defaultListId)
    }
  }
})
</script>

<template>
  <div v-if="authStore.loading || authStore.checkingSetup" class="min-h-screen flex items-center justify-center">
    <div class="text-gray-600">読み込み中...</div>
  </div>

  <LoginPage v-else-if="!authStore.isAuthenticated" />

  <SetupPage v-else-if="authStore.needsSetup" @complete="handleSetupComplete" />

  <MainLayout v-else>
    <template #header>
      <AppHeader @open-create-modal="handleOpenCreateModal" />
    </template>

    <TaskList />

    <TaskModal
      :open="showCreateModal"
      @close="showCreateModal = false"
    />
  </MainLayout>
</template>
