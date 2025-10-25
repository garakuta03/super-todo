// ユーザープロファイルの型定義
export interface UserProfile {
  uid: string  // Firebase Auth UID
  displayName: string
  email: string
  photoURL?: string
  isInitialized: boolean  // 初期化済みフラグ
  defaultListId?: string  // デフォルトリストID（ログイン時に自動選択）
  createdAt: Date
  updatedAt: Date
}

// ワークスペースの型定義（組織レベル）
export interface Workspace {
  id: string
  name: string
  userId: string  // 作成者・所有者ID
  icon?: string
  color?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// プロジェクトの型定義
export interface Project {
  id: string
  name: string
  workspaceId: string  // 親ワークスペースID
  userId: string  // ユーザーID（セキュリティ必須）
  icon?: string
  color?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// リストの型定義
export interface List {
  id: string
  name: string
  projectId: string  // 親プロジェクトID
  userId: string  // ユーザーID（セキュリティ必須）
  color?: string
  icon?: string
  order: number
  useStartDate?: boolean  // 開始日を使用するか（デフォルト: false）
  createdAt: Date
  updatedAt: Date
}

// タスクの型定義
export interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  completed: boolean
  listId: string
  userId: string  // ユーザーID（セキュリティ必須）
  startDate?: Date  // 開始日
  dueDate?: Date    // 期日
  assignee?: string
  tags?: string[]
  order: number
  createdAt: Date
  updatedAt: Date
}
