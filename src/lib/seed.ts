import type { Task, List } from './types'

// サンプルデータを作成
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
