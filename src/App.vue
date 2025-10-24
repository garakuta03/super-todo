<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import TaskList from '@/components/task/TaskList.vue'
import TaskModal from '@/components/task/TaskModal.vue'

const showCreateModal = ref(false)

const handleOpenCreateModal = () => {
  showCreateModal.value = true
}
</script>

<template>
  <MainLayout>
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
