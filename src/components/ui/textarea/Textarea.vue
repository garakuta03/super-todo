<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue?: string
  class?: HTMLAttributes['class']
  placeholder?: string
  disabled?: boolean
}>()

const emits = defineEmits<{
  'update:modelValue': [value: string]
}>()

const classes = computed(() =>
  cn(
    'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.class
  )
)
</script>

<template>
  <textarea
    :class="classes"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="emits('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
