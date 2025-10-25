// タスクの型定義
export interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  completed: boolean
  listId: string
  userId: string  // ユーザーID（セキュリティ必須）
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
  userId: string  // ユーザーID（セキュリティ必須）
  color?: string
  icon?: string
  order: number
  createdAt: Date
}
