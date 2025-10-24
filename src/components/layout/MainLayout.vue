<script setup lang="ts">
// メインレイアウトコンポーネント
// ヘッダーとコンテンツエリアを提供
</script>

<template>
  <div class="min-h-screen bg-white">
    <slot name="header" />
    <main class="p-6">
      <slot />
    </main>
  </div>
</template>
