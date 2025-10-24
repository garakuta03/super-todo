<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const classes = computed(() =>
  cn('text-lg font-semibold text-gray-900', props.class)
)
</script>

<template>
  <h2 :class="classes">
    <slot />
  </h2>
</template>
