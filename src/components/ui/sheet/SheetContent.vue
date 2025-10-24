<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  close: []
}>()

const classes = computed(() =>
  cn(
    'fixed right-0 top-0 z-50 h-full w-[480px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out border-l border-gray-200 overflow-y-auto',
    props.class
  )
)
</script>

<template>
  <!-- Overlay -->
  <div
    class="fixed inset-0 z-40 bg-black/50"
    @click="emit('close')"
  />

  <!-- Panel -->
  <div :class="classes">
    <button
      @click="emit('close')"
      class="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
    >
      <X class="h-4 w-4" />
      <span class="sr-only">Close</span>
    </button>
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>
