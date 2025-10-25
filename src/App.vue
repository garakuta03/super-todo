<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import TaskList from '@/components/task/TaskList.vue'
import TaskModal from '@/components/task/TaskModal.vue'
import LoginPage from '@/components/auth/LoginPage.vue'

const authStore = useAuthStore()
const showCreateModal = ref(false)

const handleOpenCreateModal = () => {
  showCreateModal.value = true
}

onMounted(() => {
  authStore.initAuth()
})
</script>

<template>
  <div v-if="authStore.loading" class="min-h-screen flex items-center justify-center">
    <div class="text-gray-600">読み込み中...</div>
  </div>

  <LoginPage v-else-if="!authStore.isAuthenticated" />

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
