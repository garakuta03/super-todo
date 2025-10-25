<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  modelValue?: Date | null
  label?: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: Date | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 日付と時刻の入力値
const dateInput = ref('')
const timeInput = ref('')

// 日付を YYYY-MM-DD 形式に変換
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 時刻を HH:mm 形式に変換
const formatTimeForInput = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// propsの値が変更されたら入力フィールドを更新
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue)
    dateInput.value = formatDateForInput(date)
    timeInput.value = formatTimeForInput(date)
  } else {
    dateInput.value = ''
    timeInput.value = ''
  }
}, { immediate: true })

// 入力値が変更されたら親に通知
const handleDateTimeChange = () => {
  if (!dateInput.value) {
    emit('update:modelValue', null)
    return
  }

  const date = new Date(dateInput.value)

  if (timeInput.value) {
    const [hours, minutes] = timeInput.value.split(':')
    date.setHours(parseInt(hours), parseInt(minutes))
  } else {
    date.setHours(0, 0, 0, 0)
  }

  emit('update:modelValue', date)
}

// クイックアクション: 今日
const setToday = () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // 0:00に設定
  dateInput.value = formatDateForInput(now)
  timeInput.value = formatTimeForInput(now)
  handleDateTimeChange()
}

// クイックアクション: 明日
const setTomorrow = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0) // 0:00に設定
  dateInput.value = formatDateForInput(tomorrow)
  timeInput.value = formatTimeForInput(tomorrow)
  handleDateTimeChange()
}

// クイックアクション: 週末（次の土曜日）
const setWeekend = () => {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=日曜, 6=土曜
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7 // 次の土曜日までの日数
  const saturday = new Date()
  saturday.setDate(now.getDate() + daysUntilSaturday)
  saturday.setHours(0, 0, 0, 0) // 0:00に設定
  dateInput.value = formatDateForInput(saturday)
  timeInput.value = formatTimeForInput(saturday)
  handleDateTimeChange()
}

// クイックアクション: 月末
const setEndOfMonth = () => {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  lastDay.setHours(0, 0, 0, 0) // 0:00に設定
  dateInput.value = formatDateForInput(lastDay)
  timeInput.value = formatTimeForInput(lastDay)
  handleDateTimeChange()
}

// クイックアクション: 来週
const setNextWeek = () => {
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(0, 0, 0, 0) // 0:00に設定
  dateInput.value = formatDateForInput(nextWeek)
  timeInput.value = formatTimeForInput(nextWeek)
  handleDateTimeChange()
}

// クリア
const clear = () => {
  dateInput.value = ''
  timeInput.value = ''
  emit('update:modelValue', null)
}

// 現在の値を日本語表示用にフォーマット
const formattedDisplay = computed(() => {
  if (!props.modelValue) return ''
  const date = new Date(props.modelValue)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="text-sm font-medium">{{ label }}</label>

    <!-- 現在の値の表示 -->
    <div v-if="formattedDisplay" class="text-sm text-gray-600 mb-2">
      {{ formattedDisplay }}
    </div>

    <!-- 日付と時刻の入力 -->
    <div class="flex gap-2">
      <Input
        v-model="dateInput"
        type="date"
        class="flex-1"
        :placeholder="placeholder || '日付を選択'"
        autocomplete="off"
        @change="handleDateTimeChange"
      />
      <Input
        v-model="timeInput"
        type="time"
        class="w-32"
        placeholder="時刻"
        autocomplete="off"
        @change="handleDateTimeChange"
      />
    </div>

    <!-- クイックアクション -->
    <div class="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        @click="setToday"
        class="text-xs"
      >
        今日
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        @click="setTomorrow"
        class="text-xs"
      >
        明日
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        @click="setNextWeek"
        class="text-xs"
      >
        来週
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        @click="setWeekend"
        class="text-xs"
      >
        週末
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        @click="setEndOfMonth"
        class="text-xs"
      >
        月末
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        @click="clear"
        class="text-xs text-red-600 hover:text-red-700"
      >
        クリア
      </Button>
    </div>
  </div>
</template>
