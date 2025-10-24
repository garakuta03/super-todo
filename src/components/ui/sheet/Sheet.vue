<script setup lang="ts">
// 簡易版Sheet（サイドパネル）コンポーネント
interface Props {
  open: boolean
}

defineProps<Props>()
defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <slot />
</template>
