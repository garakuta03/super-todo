<script setup lang="ts">
import { DialogRoot, type DialogRootEmits, type DialogRootProps } from 'radix-vue'

interface Props extends DialogRootProps {}

defineProps<Props>()

const emit = defineEmits<DialogRootEmits>()
</script>

<template>
  <DialogRoot v-bind="$props" @update:open="(value) => emit('update:open', value)">
    <slot />
  </DialogRoot>
</template>
