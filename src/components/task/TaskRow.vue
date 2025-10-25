<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDate } from '@/lib/utils'

interface Props {
  task: Task
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle: [id: string]
  click: [task: Task]
}>()

const formattedDate = computed(() =>
  props.task.dueDate ? formatDate(props.task.dueDate) : '-'
)
</script>

<template>
  <div
    class="grid grid-cols-[auto_auto_auto_1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
    @click="emit('click', task)"
  >
    <!-- アバター -->
    <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-sm">
      S
    </div>

    <!-- ドラッグハンドル -->
    <div class="drag-handle text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors select-none p-1">
      ⋮⋮
    </div>

    <!-- チェックボックス -->
    <Checkbox
      :checked="task.completed"
      @update:checked="() => emit('toggle', task.id)"
      @click.stop
    />

    <!-- タスク内容 -->
    <div>
      <div class="flex items-center gap-2">
        <Badge variant="secondary" class="text-xs">
          {{ task.status }}
        </Badge>
        <span
          class="font-medium text-sm"
          :class="{ 'line-through text-gray-400': task.completed }"
        >
          {{ task.title }}
        </span>
      </div>
      <p v-if="task.description" class="text-sm text-gray-500 mt-0.5 line-clamp-1">
        {{ task.description }}
      </p>
    </div>

    <!-- 期限 -->
    <span class="text-sm text-gray-600">{{ formattedDate }}</span>

    <!-- 担当 -->
    <span class="text-sm text-gray-600">-</span>

    <!-- タグ -->
    <span class="text-sm text-gray-600">-</span>

    <!-- メニュー -->
    <button class="text-gray-400 hover:text-gray-600" @click.stop>
      ⋮
    </button>
  </div>
</template>
