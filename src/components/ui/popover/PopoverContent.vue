<script setup lang="ts">
import { PopoverContent, type PopoverContentProps, PopoverPortal } from 'radix-vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<PopoverContentProps & { class?: string }>(),
  {
    align: 'center',
    sideOffset: 4,
  }
)

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      v-bind="delegatedProps"
      :class="cn(
        'z-50 w-72 rounded-md border border-gray-200 bg-white p-4 text-gray-950 shadow-md outline-none',
        props.class
      )"
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
