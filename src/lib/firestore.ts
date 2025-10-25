import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from './firebase'
import type { Task, List } from './types'

// コレクション名
const LISTS_COLLECTION = 'lists'
const TASKS_COLLECTION = 'tasks'

// Lists CRUD
export const listsApi = {
  // リスト一覧を取得
  async getAll(): Promise<List[]> {
    const q = query(collection(db, LISTS_COLLECTION), orderBy('order'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as List))
  },

  // リストを作成
  async create(list: List): Promise<void> {
    await setDoc(doc(db, LISTS_COLLECTION, list.id), {
      ...list,
      createdAt: list.createdAt
    })
  },

  // リストを更新
  async update(id: string, updates: Partial<List>): Promise<void> {
    await updateDoc(doc(db, LISTS_COLLECTION, id), { ...updates })
  },

  // リストを削除
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, LISTS_COLLECTION, id))
  },

  // リアルタイムリスナー
  subscribe(callback: (lists: List[]) => void): Unsubscribe {
    const q = query(collection(db, LISTS_COLLECTION), orderBy('order'))
    return onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as List))
      callback(lists)
    })
  }
}

// Tasks CRUD
export const tasksApi = {
  // 全タスクを取得
  async getAll(): Promise<Task[]> {
    const snapshot = await getDocs(collection(db, TASKS_COLLECTION))
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      dueDate: doc.data().dueDate?.toDate() || undefined
    } as Task))
  },

  // リスト別タスクを取得
  async getByListId(listId: string): Promise<Task[]> {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('listId', '==', listId),
      orderBy('order')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      dueDate: doc.data().dueDate?.toDate() || undefined
    } as Task))
  },

  // タスクを作成
  async create(task: Task): Promise<void> {
    await setDoc(doc(db, TASKS_COLLECTION, task.id), {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate || null
    })
  },

  // タスクを更新
  async update(id: string, updates: Partial<Task>): Promise<void> {
    await updateDoc(doc(db, TASKS_COLLECTION, id), {
      ...updates,
      updatedAt: new Date()
    })
  },

  // タスクを削除
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, TASKS_COLLECTION, id))
  },

  // リアルタイムリスナー（全タスク）
  subscribe(callback: (tasks: Task[]) => void): Unsubscribe {
    return onSnapshot(collection(db, TASKS_COLLECTION), (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate() || undefined
      } as Task))
      callback(tasks)
    })
  },

  // リアルタイムリスナー（リスト別）
  subscribeByListId(listId: string, callback: (tasks: Task[]) => void): Unsubscribe {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('listId', '==', listId),
      orderBy('order')
    )
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate() || undefined
      } as Task))
      callback(tasks)
    })
  }
}
