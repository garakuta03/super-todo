<script setup lang="ts">
import Sidebar from './Sidebar.vue'

// メインレイアウトコンポーネント
// ヘッダーとサイドバー、コンテンツエリアを提供
</script>

<template>
  <div class="min-h-screen bg-white flex">
    <!-- 左サイドバー -->
    <Sidebar />

    <!-- メインコンテンツエリア -->
    <div class="flex-1 flex flex-col min-w-0">
      <slot name="header" />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
