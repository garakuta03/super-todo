# Tone Clone POC - 実装指示書 (Vue.js版)

**生成日時**: 2025-10-24
**対象**: Claude Code
**バージョン**: 2.0 (Vue.js)

---

## 📊 実装状況（2025-10-24 完了）

### ✅ 全Priority完了

| Priority | 内容 | 状態 | 完了日時 |
|---------|------|------|----------|
| Priority 1 | プロジェクト初期化 | ✅ 完了 | 2025-10-24 |
| Priority 2 | 型定義とストア | ✅ 完了 | 2025-10-24 |
| Priority 3 | 基本レイアウト | ✅ 完了 | 2025-10-24 |
| Priority 4 | タスクリスト表示 | ✅ 完了 | 2025-10-24 |
| Priority 5 | タスク作成モーダル | ✅ 完了 | 2025-10-24 |
| Priority 6 | タスク詳細パネル | ✅ 完了 | 2025-10-24 |
| Priority 7 | サンプルデータ作成 | ✅ 完了 | 2025-10-24 |

### 📝 実装メモ

- **Tailwind CSS**: v4ではなくv3.4（安定版）を使用
- **shadcn-vue**: 手動でコンポーネントを作成（CLIツールは使用せず）
- **LocalStorage**: 正常に動作、データ永続化OK
- **開発サーバー**: http://localhost:5173/ で正常起動

### 🎯 動作確認済み

- [x] `npm run dev` で起動
- [x] http://localhost:5173 にアクセス可能
- [x] TypeScriptエラーなし
- [x] Tailwind CSSが効いている
- [x] タスク作成が動作
- [x] タスク編集が動作
- [x] チェックボックスで完了切り替えが動作
- [x] LocalStorageでデータ永続化が動作

---

## 📋 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [デザイン仕様](#2-デザイン仕様)
3. [画面構成](#3-画面構成)
4. [データ構造](#4-データ構造)
5. [ファイル構成](#5-ファイル構成)
6. [実装の優先順位](#6-実装の優先順位)
7. [実装しないこと](#7-実装しないこと)
8. [動作確認](#8-動作確認)

---

## 1. プロジェクト概要

### 目的
tone-task.comのUIを参考にしたシンプルなタスク管理ツールのPOCを作成

### 技術スタック
```
- Vue 3 (Composition API)
- TypeScript
- Vite
- Tailwind CSS
- shadcn-vue
- Pinia（状態管理）
- LocalStorage（データ永続化）
- Git（バージョン管理）
```

### 品質基準
- **POCレベル**: 動作確認が最優先
- **デザイン精度**: 80-85%（だいたい似てればOK）
- **実装期間**: 1-2週間

---

## 2. デザイン仕様

### 2.1 カラーパレット

```css
:root {
  /* Primary - 青系 */
  --primary: #0EA5E9;
  --primary-hover: #0284C7;
  
  /* Purple - アバター */
  --purple: #A855F7;
  --purple-light: #E9D5FF;
  
  /* Background */
  --background: #FFFFFF;
  --surface: #F9FAFB;
  --surface-hover: #F3F4F6;
  
  /* Text */
  --text: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  
  /* Border */
  --border: #E5E7EB;
  --border-light: #F3F4F6;
  
  /* Badge */
  --badge-todo: #F3F4F6;
  --badge-todo-text: #6B7280;
}
```

### 2.2 タイポグラフィ

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
             "Hiragino Sans", "Hiragino Kaku Gothic ProN", 
             "Noto Sans JP", sans-serif;

/* フォントサイズ */
--text-xs: 12px;
--text-sm: 13px;
--text-base: 14px;
--text-lg: 16px;
--text-xl: 20px;
```

---

## 3. 画面構成

### 3.1 メイン画面（リスト表示）

```
┌─────────────────────────────────────────────────────────────┐
│  最初のタスクリスト                    [S] [+ 追加] [⊞ リスト] │
├─────────────────────────────────────────────────────────────┤
│  + フィルタを追加                                            │
├─────────────────────────────────────────────────────────────┤
│  [□] [⋮] TODO  初めてのタスクを作成する     2025/10/25  -  -│
│              右上の作成ボタンか、キーボードので...            │
├─────────────────────────────────────────────────────────────┤
│  [□] [⋮] TODO  初めてのリストを作成する     2025/10/25  -  -│
└─────────────────────────────────────────────────────────────┘
```

---

## 4. データ構造

### 4.1 Task

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  completed: boolean;
  listId: string;
  dueDate?: Date;
  assignee?: string;
  tags?: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 List

```typescript
interface List {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  order: number;
  createdAt: Date;
}
```

---

## 5. ファイル構成

```
tone-clone-vue/
├── public/
├── src/
│   ├── main.ts                  # エントリーポイント
│   ├── App.vue                  # ルートコンポーネント
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.vue   # メインレイアウト
│   │   │   └── AppHeader.vue    # ヘッダー
│   │   │
│   │   ├── task/
│   │   │   ├── TaskRow.vue      # タスク1行
│   │   │   ├── TaskList.vue     # タスクリスト
│   │   │   ├── TaskModal.vue    # タスク作成モーダル
│   │   │   └── TaskPanel.vue    # タスク詳細パネル
│   │   │
│   │   └── ui/                  # shadcn-vue components
│   │       ├── button/
│   │       ├── dialog/
│   │       ├── input/
│   │       ├── checkbox/
│   │       ├── badge/
│   │       └── avatar/
│   │
│   ├── stores/
│   │   ├── taskStore.ts         # タスクストア（Pinia）
│   │   └── listStore.ts         # リストストア（Pinia）
│   │
│   ├── composables/
│   │   ├── useLocalStorage.ts   # LocalStorageコンポーザブル
│   │   └── useTasks.ts          # タスク操作
│   │
│   ├── lib/
│   │   ├── types.ts             # 型定義
│   │   └── utils.ts             # ユーティリティ
│   │
│   └── assets/
│       └── main.css             # グローバルスタイル
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 6. 実装の優先順位

### Priority 1: プロジェクト初期化（30分）

```bash
# Vueプロジェクト作成
npm create vue@latest tone-clone-vue

# 選択オプション:
# ✅ TypeScript
# ✅ Pinia
# ❌ Router (不要)
# ❌ Vitest (不要)
# ❌ ESLint (お好みで)

cd tone-clone-vue

# Gitリポジトリ初期化
git add .
git commit -m "initial: Vue プロジェクト作成"

# Tailwind CSS インストール
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# tailwind.config.js 設定
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0EA5E9',
          hover: '#0284C7',
        },
        purple: {
          DEFAULT: '#A855F7',
          light: '#E9D5FF',
        },
      },
    },
  },
  plugins: [],
}
EOF

# src/assets/main.css に Tailwind追加
cat > src/assets/main.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #0EA5E9;
  --primary-hover: #0284C7;
  --purple: #A855F7;
  --purple-light: #E9D5FF;
  --background: #FFFFFF;
  --surface: #F9FAFB;
  --surface-hover: #F3F4F6;
  --text: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --border: #E5E7EB;
  --border-light: #F3F4F6;
  --badge-todo: #F3F4F6;
  --badge-todo-text: #6B7280;
}
EOF

git add .
git commit -m "chore: Tailwind CSS を設定"

# 必要なパッケージインストール
npm install date-fns nanoid lucide-vue-next

git add package.json package-lock.json
git commit -m "chore: 基本パッケージをインストール"

# shadcn-vue インストール
npx shadcn-vue@latest init

# コンポーネント追加
npx shadcn-vue@latest add button
npx shadcn-vue@latest add dialog
npx shadcn-vue@latest add input
npx shadcn-vue@latest add checkbox
npx shadcn-vue@latest add badge
npx shadcn-vue@latest add avatar

git add .
git commit -m "feat: shadcn-vue コンポーネントを追加"
```

**確認事項**:
- [ ] `npm run dev` で起動
- [ ] http://localhost:5173 にアクセス可能
- [ ] TypeScriptエラーなし
- [ ] Tailwind CSSが効いている

---

### Priority 2: 型定義とストア（1時間）

**ファイル作成**:

```typescript
// src/lib/types.ts
export interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  completed: boolean
  listId: string
  dueDate?: Date
  assignee?: string
  tags?: string[]
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface List {
  id: string
  name: string
  color?: string
  icon?: string
  order: number
  createdAt: Date
}
```

```typescript
// src/stores/taskStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import type { Task } from '@/lib/types'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Record<string, Task>>({})
  
  // LocalStorageから読み込み
  const loadFromStorage = () => {
    const stored = localStorage.getItem('tone-tasks')
    if (stored) {
      tasks.value = JSON.parse(stored)
    }
  }
  
  // LocalStorageに保存
  const saveToStorage = () => {
    localStorage.setItem('tone-tasks', JSON.stringify(tasks.value))
  }
  
  // Getters
  const allTasks = computed(() => Object.values(tasks.value))
  
  const getTasksByListId = (listId: string) => {
    return allTasks.value.filter(task => task.listId === listId)
  }
  
  // Actions
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...taskData,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    tasks.value[task.id] = task
    saveToStorage()
    return task
  }
  
  const updateTask = (id: string, updates: Partial<Task>) => {
    if (tasks.value[id]) {
      tasks.value[id] = {
        ...tasks.value[id],
        ...updates,
        updatedAt: new Date()
      }
      saveToStorage()
    }
  }
  
  const deleteTask = (id: string) => {
    delete tasks.value[id]
    saveToStorage()
  }
  
  const toggleTask = (id: string) => {
    if (tasks.value[id]) {
      tasks.value[id].completed = !tasks.value[id].completed
      saveToStorage()
    }
  }
  
  // 初期化時にローカルストレージから読み込み
  loadFromStorage()
  
  return {
    tasks,
    allTasks,
    getTasksByListId,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    loadFromStorage
  }
})
```

```typescript
// src/stores/listStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import type { List } from '@/lib/types'

export const useListStore = defineStore('list', () => {
  const lists = ref<Record<string, List>>({})
  const currentListId = ref<string>('')
  
  const loadFromStorage = () => {
    const stored = localStorage.getItem('tone-lists')
    if (stored) {
      lists.value = JSON.parse(stored)
    }
    
    // デフォルトリストがなければ作成
    if (Object.keys(lists.value).length === 0) {
      const defaultList = createList({ name: '最初のタスクリスト', order: 0 })
      currentListId.value = defaultList.id
    } else {
      currentListId.value = Object.keys(lists.value)[0]
    }
  }
  
  const saveToStorage = () => {
    localStorage.setItem('tone-lists', JSON.stringify(lists.value))
  }
  
  const allLists = computed(() => Object.values(lists.value))
  
  const currentList = computed(() => 
    currentListId.value ? lists.value[currentListId.value] : null
  )
  
  const createList = (listData: Omit<List, 'id' | 'createdAt'>) => {
    const list: List = {
      ...listData,
      id: nanoid(),
      createdAt: new Date()
    }
    
    lists.value[list.id] = list
    saveToStorage()
    return list
  }
  
  const updateList = (id: string, updates: Partial<List>) => {
    if (lists.value[id]) {
      lists.value[id] = { ...lists.value[id], ...updates }
      saveToStorage()
    }
  }
  
  const deleteList = (id: string) => {
    delete lists.value[id]
    saveToStorage()
  }
  
  const setCurrentList = (id: string) => {
    currentListId.value = id
  }
  
  loadFromStorage()
  
  return {
    lists,
    currentListId,
    allLists,
    currentList,
    createList,
    updateList,
    deleteList,
    setCurrentList
  }
})
```

**Gitコミット**:
```bash
git add src/lib/ src/stores/
git commit -m "feat: 型定義とPiniaストアを実装"
```

**確認事項**:
- [ ] ブラウザのDevToolsでPiniaストアが確認できる
- [ ] LocalStorageへの保存が動く

---

### Priority 3: 基本レイアウト（2時間）

**ファイル作成**:

```vue
<!-- src/components/layout/AppHeader.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useListStore } from '@/stores/listStore'
import { Button } from '@/components/ui/button'

const listStore = useListStore()
const emit = defineEmits<{
  openCreateModal: []
}>()
</script>

<template>
  <header class="border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- リスト名 -->
      <h1 class="text-xl font-bold text-gray-900">
        {{ listStore.currentList?.name || '最初のタスクリスト' }}
      </h1>
      
      <!-- 右側のアクション -->
      <div class="flex items-center gap-3">
        <!-- アバター -->
        <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-sm">
          S
        </div>
        
        <!-- 追加ボタン -->
        <Button 
          @click="emit('openCreateModal')"
          class="bg-primary hover:bg-primary-hover text-white"
        >
          + 追加
        </Button>
        
        <!-- リストボタン -->
        <Button variant="outline" size="sm">
          ⊞ リスト
        </Button>
      </div>
    </div>
  </header>
</template>
```

```vue
<!-- src/components/layout/MainLayout.vue -->
<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-white">
    <slot name="header" />
    <main class="p-6">
      <slot />
    </main>
  </div>
</template>
```

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import TaskList from '@/components/task/TaskList.vue'
import TaskModal from '@/components/task/TaskModal.vue'

const showCreateModal = ref(false)

const handleOpenCreateModal = () => {
  showCreateModal.value = true
}
</script>

<template>
  <MainLayout>
    <template #header>
      <AppHeader @open-create-modal="handleOpenCreateModal" />
    </template>
    
    <TaskList />
    
    <TaskModal 
      :open="showCreateModal" 
      @close="showCreateModal = false" 
    />
  </MainLayout>
</template>
```

**Gitコミット**:
```bash
git add src/components/layout/ src/App.vue
git commit -m "feat: 基本レイアウトとヘッダーを実装"
```

---

### Priority 4: タスクリスト表示（3時間）

```vue
<!-- src/components/task/TaskRow.vue -->
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
    <button class="text-gray-400 hover:text-gray-600 cursor-grab">
      ⋮⋮
    </button>
    
    <!-- チェックボックス -->
    <Checkbox
      :checked="task.completed"
      @update:checked="emit('toggle', task.id)"
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
```

```vue
<!-- src/components/task/TaskList.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
import TaskRow from './TaskRow.vue'
import TaskPanel from './TaskPanel.vue'
import type { Task } from '@/lib/types'

const taskStore = useTaskStore()
const listStore = useListStore()

const selectedTask = ref<Task | null>(null)
const showPanel = ref(false)

const tasks = computed(() => {
  if (!listStore.currentListId) return []
  return taskStore.getTasksByListId(listStore.currentListId)
})

const handleToggle = (id: string) => {
  taskStore.toggleTask(id)
}

const handleClick = (task: Task) => {
  selectedTask.value = task
  showPanel.value = true
}

const handleClosePanel = () => {
  showPanel.value = false
  selectedTask.value = null
}
</script>

<template>
  <div class="max-w-6xl">
    <!-- フィルタエリア -->
    <div class="mb-4">
      <button class="text-sm text-gray-600 hover:text-gray-900">
        + フィルタを追加
      </button>
    </div>
    
    <!-- テーブルヘッダー -->
    <div class="grid grid-cols-[auto_auto_auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-600">
      <div></div>
      <div></div>
      <div></div>
      <div>タイトル</div>
      <div>期間</div>
      <div>担当</div>
      <div>タグ</div>
      <div></div>
    </div>
    
    <!-- タスク一覧 -->
    <div v-if="tasks.length > 0">
      <TaskRow
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="handleToggle"
        @click="handleClick"
      />
    </div>
    
    <!-- 空の状態 -->
    <div v-else class="text-center py-12 text-gray-500">
      タスクがありません。「+ 追加」ボタンから作成してください。
    </div>
    
    <!-- タスク詳細パネル -->
    <TaskPanel
      v-if="selectedTask"
      :task="selectedTask"
      :open="showPanel"
      @close="handleClosePanel"
    />
  </div>
</template>
```

```typescript
// src/lib/utils.ts
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}
```

**Gitコミット**:
```bash
git add src/components/task/TaskRow.vue src/components/task/TaskList.vue src/lib/utils.ts
git commit -m "feat: タスクリスト表示機能を実装"
```

---

### Priority 5: タスク作成モーダル（3時間）

```vue
<!-- src/components/task/TaskModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const taskStore = useTaskStore()
const listStore = useListStore()

const title = ref('')
const continueCreating = ref(false)

// モーダルが閉じる時にリセット
watch(() => props.open, (newValue) => {
  if (!newValue) {
    title.value = ''
    continueCreating.value = false
  }
})

const handleSubmit = () => {
  if (!title.value.trim()) return
  if (!listStore.currentListId) return
  
  taskStore.createTask({
    title: title.value.trim(),
    status: 'TODO',
    completed: false,
    listId: listStore.currentListId,
    order: taskStore.allTasks.length
  })
  
  if (continueCreating.value) {
    title.value = ''
  } else {
    emit('close')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && emit('close')">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>タスクを作成</DialogTitle>
      </DialogHeader>
      
      <div class="space-y-4 mt-4">
        <!-- タイトル入力 -->
        <Input
          v-model="title"
          placeholder="タスクを入力..."
          @keydown="handleKeydown"
          autofocus
        />
        
        <!-- 続けて作成チェックボックス -->
        <div class="flex items-center gap-2">
          <Checkbox
            id="continue"
            v-model:checked="continueCreating"
          />
          <label 
            for="continue" 
            class="text-sm text-gray-600 cursor-pointer"
          >
            続けて作成
          </label>
        </div>
        
        <!-- アクション -->
        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center gap-2">
            <button class="text-sm text-gray-600 hover:text-gray-900">
              👤 担当者を追加
            </button>
            <button class="text-sm text-gray-600 hover:text-gray-900">
              📅
            </button>
          </div>
          
          <div class="flex gap-2">
            <Button variant="outline" @click="emit('close')">
              キャンセル
            </Button>
            <Button 
              @click="handleSubmit"
              :disabled="!title.trim()"
            >
              追加する
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
```

**Gitコミット**:
```bash
git add src/components/task/TaskModal.vue
git commit -m "feat: タスク作成モーダルを実装"
```

---

### Priority 6: タスク詳細パネル（3時間）

```vue
<!-- src/components/task/TaskPanel.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/utils'

interface Props {
  task: Task
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const taskStore = useTaskStore()
const description = ref(props.task.description || '')

watch(() => props.task, (newTask) => {
  description.value = newTask.description || ''
}, { immediate: true })

const handleUpdateDescription = () => {
  taskStore.updateTask(props.task.id, {
    description: description.value
  })
}

const handleUpdateStatus = (status: string) => {
  taskStore.updateTask(props.task.id, {
    status: status as Task['status']
  })
}
</script>

<template>
  <Sheet :open="open" @update:open="(val) => !val && emit('close')">
    <SheetContent class="w-[480px]">
      <SheetHeader>
        <SheetTitle>{{ task.title }}</SheetTitle>
      </SheetHeader>
      
      <div class="space-y-6 mt-6">
        <!-- メタデータ -->
        <div class="space-y-3">
          <!-- ステータス -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">ステータス</span>
            <Select 
              :model-value="task.status" 
              @update:model-value="handleUpdateStatus"
            >
              <SelectTrigger class="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">TODO</SelectItem>
                <SelectItem value="IN_PROGRESS">進行中</SelectItem>
                <SelectItem value="DONE">完了</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- 期間 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">期間</span>
            <span class="text-sm">
              {{ task.dueDate ? formatDate(task.dueDate) : '指定なし' }}
            </span>
          </div>
          
          <!-- 担当 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">担当</span>
            <span class="text-sm">指定なし</span>
          </div>
          
          <!-- タグ -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">タグ</span>
            <span class="text-sm">指定なし</span>
          </div>
          
          <!-- タスクID -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">タスクID</span>
            <span class="text-sm font-mono text-xs">{{ task.id }}</span>
          </div>
        </div>
        
        <!-- 説明 -->
        <div>
          <h3 class="text-sm font-medium mb-2">説明</h3>
          <Textarea
            v-model="description"
            @blur="handleUpdateDescription"
            placeholder="説明を入力..."
            class="min-h-[200px]"
          />
        </div>
        
        <!-- サブタスク -->
        <div>
          <h3 class="text-sm font-medium mb-2">サブタスク</h3>
          <p class="text-sm text-gray-500">
            タスクを小さな単位に分割して管理できます。<br />
            サブタスクを追加して、作業を整理しましょう。
          </p>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
```

**Gitコミット**:
```bash
git add src/components/task/TaskPanel.vue
git commit -m "feat: タスク詳細パネルを実装"
```

---

### Priority 7: サンプルデータ作成（30分）

```typescript
// src/lib/seed.ts
import type { Task, List } from './types'

export function createSampleData() {
  // デフォルトリスト
  const defaultList: List = {
    id: 'list-default',
    name: '最初のタスクリスト',
    order: 0,
    createdAt: new Date()
  }
  
  // サンプルタスク
  const sampleTasks: Task[] = [
    {
      id: 'task-1',
      title: '初めてのタスクを作成する',
      description: '右上の作成ボタンか、キーボードの T でタスクを作成できます。',
      status: 'TODO',
      completed: false,
      listId: 'list-default',
      dueDate: new Date('2025-10-25'),
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-2',
      title: '初めてのリストを作成する',
      description: 'サイドバーに新しいリストが作成されてみよう。',
      status: 'TODO',
      completed: false,
      listId: 'list-default',
      dueDate: new Date('2025-10-25'),
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-3',
      title: 'チームメンバーを招待する',
      description: 'チームメンバーを招待することで、チームで...',
      status: 'TODO',
      completed: false,
      listId: 'list-default',
      dueDate: new Date('2025-10-25'),
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
  
  // LocalStorageに保存
  localStorage.setItem('tone-lists', JSON.stringify({ 
    [defaultList.id]: defaultList 
  }))
  
  localStorage.setItem('tone-tasks', JSON.stringify(
    Object.fromEntries(sampleTasks.map(t => [t.id, t]))
  ))
}

// デバッグ用：データをリセットして再作成
export function resetData() {
  localStorage.removeItem('tone-tasks')
  localStorage.removeItem('tone-lists')
  createSampleData()
  window.location.reload()
}
```

```typescript
// src/main.ts に追加
import { createSampleData } from './lib/seed'

// 開発時のみ：LocalStorageが空ならサンプルデータ作成
if (!localStorage.getItem('tone-tasks')) {
  createSampleData()
}
```

**Gitコミット**:
```bash
git add src/lib/seed.ts src/main.ts
git commit -m "feat: サンプルデータ作成機能を追加"
```

---

## 7. 実装しないこと（POCでは不要）

- ❌ サイドバー（リスト切り替え）
- ❌ フィルター機能
- ❌ 検索機能
- ❌ ドラッグ&ドロップ
- ❌ 担当者機能
- ❌ タグ機能
- ❌ サブタスク機能
- ❌ リッチテキストエディタ
- ❌ テンプレート機能
- ❌ キーボードショートカット
- ❌ Firebase連携
- ❌ 認証機能
- ❌ テストコード

---

## 8. 動作確認

### 基本機能チェックリスト

- [ ] タスクが一覧表示される
- [ ] 「+ 追加」ボタンでモーダルが開く
- [ ] タスクを作成できる
- [ ] タスクをクリックで詳細パネルが開く
- [ ] チェックボックスで完了切り替え
- [ ] 説明を編集できる
- [ ] ブラウザをリロードしてもデータが残る

### Vue DevTools確認

```javascript
// ブラウザのコンソールで
localStorage.getItem('tone-tasks')
localStorage.getItem('tone-lists')
```

---

## 9. Gitコミットメッセージ規約

**Prefix**:
- `feat:` - 新機能追加
- `fix:` - バグ修正
- `refactor:` - リファクタリング
- `style:` - デザイン調整
- `chore:` - 環境設定
- `docs:` - ドキュメント

**日本語での例**:
```bash
✅ git commit -m "feat: タスク削除機能を実装"
✅ git commit -m "fix: チェックボックスの状態が保存されない問題を修正"
✅ git commit -m "style: タスクカードの余白を調整"
```

---

## 10. トラブルシューティング

### shadcn-vueのコンポーネントが動かない

```bash
# 再インストール
npx shadcn-vue@latest add dialog
npx shadcn-vue@latest add sheet
```

### Piniaストアが動かない

```typescript
// main.ts で Pinia が正しくインストールされているか確認
import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)
```

### Tailwind CSSが効かない

```javascript
// tailwind.config.js の content が正しいか確認
content: [
  "./index.html",
  "./src/**/*.{vue,js,ts,jsx,tsx}",
]
```

---

**この実装指示書をClaude Codeにコピペして実装を開始してください。**

**Vue.js (Composition API) + TypeScript + Pinia でクリーンな実装を目指します！**

---

生成日時: 2025-10-24
バージョン: 2.0 (Vue.js版)