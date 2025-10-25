<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DatePicker } from 'v-calendar'
import { Calendar } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import 'v-calendar/style.css'

interface Props {
  modelValue?: Date | null
  label?: string
}

interface Emits {
  (e: 'update:modelValue', value: Date | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)
const selectedDate = ref<Date | null>(props.modelValue || null)
const timeInput = ref('00:00')

// propsの値が変更されたら同期
watch(() => props.modelValue, (newValue) => {
  selectedDate.value = newValue || null
  if (newValue) {
    const hours = String(newValue.getHours()).padStart(2, '0')
    const minutes = String(newValue.getMinutes()).padStart(2, '0')
    timeInput.value = `${hours}:${minutes}`
  }
}, { immediate: true })

// 表示用のフォーマット
const formattedDisplay = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// 日付選択時
const handleDateSelect = (date: Date) => {
  selectedDate.value = date
  // 時刻を適用
  if (timeInput.value) {
    const [hours, minutes] = timeInput.value.split(':')
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  }
}

// 時刻変更時
const handleTimeChange = () => {
  if (selectedDate.value && timeInput.value) {
    const [hours, minutes] = timeInput.value.split(':')
    const newDate = new Date(selectedDate.value)
    newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    selectedDate.value = newDate
  }
}

// 決定ボタン
const confirm = () => {
  if (selectedDate.value && timeInput.value) {
    const [hours, minutes] = timeInput.value.split(':')
    const finalDate = new Date(selectedDate.value)
    finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    emit('update:modelValue', finalDate)
  } else if (selectedDate.value) {
    emit('update:modelValue', selectedDate.value)
  }
  isOpen.value = false
}

// リセット
const clear = () => {
  selectedDate.value = null
  timeInput.value = '00:00'
  emit('update:modelValue', null)
  isOpen.value = false
}

// クイックアクション用のヘルパー
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  result.setHours(0, 0, 0, 0)
  return result
}

const getWeekendDate = (): Date => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  // 次の土曜日
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7
  return addDays(today, daysUntilSaturday)
}

// クイックアクション
const setToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  selectedDate.value = today
  timeInput.value = '00:00'
}

const setTomorrow = () => {
  selectedDate.value = addDays(new Date(), 1)
  timeInput.value = '00:00'
}

const setThisWeekend = () => {
  selectedDate.value = getWeekendDate()
  timeInput.value = '00:00'
}

const setEndOfMonth = () => {
  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  lastDay.setHours(0, 0, 0, 0)
  selectedDate.value = lastDay
  timeInput.value = '00:00'
}
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="text-sm font-medium">{{ label }}</label>

    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          class="w-full justify-start text-left font-normal"
          :class="{ 'text-gray-400': !selectedDate }"
        >
          <Calendar :size="16" class="mr-2" />
          {{ formattedDisplay || '日付を選択' }}
        </Button>
      </PopoverTrigger>

      <PopoverContent class="w-auto p-0" align="start">
        <!-- カレンダー -->
        <DatePicker
          v-model="selectedDate"
          mode="date"
          locale="ja"
          :min-date="new Date(new Date().setHours(0, 0, 0, 0))"
          @update:model-value="handleDateSelect"
          transparent
          borderless
        />

        <!-- クイックアクション（カレンダーの下） -->
        <div class="p-3 border-t border-b bg-gray-50">
          <div class="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="setToday"
              class="text-sm"
            >
              今日
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="setTomorrow"
              class="text-sm"
            >
              明日
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="setThisWeekend"
              class="text-sm"
            >
              今週末
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="setEndOfMonth"
              class="text-sm"
            >
              月末
            </Button>
          </div>
        </div>

        <!-- 時刻選択 -->
        <div class="p-3 border-t">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">時刻:</span>
            <Input
              v-model="timeInput"
              type="time"
              class="flex-1"
              autocomplete="off"
              @change="handleTimeChange"
            />
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="p-3 border-t flex justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            @click="clear"
            class="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            リセットする
          </Button>
          <Button size="sm" @click="confirm">
            決定する
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<style>
/* v-calendar のスタイル調整 */
:root {
  --vc-accent-50: #eff6ff;
  --vc-accent-100: #dbeafe;
  --vc-accent-200: #bfdbfe;
  --vc-accent-300: #93c5fd;
  --vc-accent-400: #60a5fa;
  --vc-accent-500: #3b82f6;
  --vc-accent-600: #2563eb;
}
</style>
