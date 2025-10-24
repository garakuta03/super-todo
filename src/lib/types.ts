// タスクの型定義
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

// リストの型定義
export interface List {
  id: string
  name: string
  color?: string
  icon?: string
  order: number
  createdAt: Date
}
