import {
  collection,
  doc,
  getDocs,
  getDoc,
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
import type { Task, List, Workspace, Project, UserProfile } from './types'

// コレクション名
const USERS_COLLECTION = 'users'
const WORKSPACES_COLLECTION = 'workspaces'
const PROJECTS_COLLECTION = 'projects'
const LISTS_COLLECTION = 'lists'
const TASKS_COLLECTION = 'tasks'

// Users CRUD
export const usersApi = {
  // ユーザープロファイルを取得
  async get(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, USERS_COLLECTION, uid)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return {
      ...docSnap.data(),
      uid: docSnap.id,
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
    } as UserProfile
  },

  // ユーザープロファイルを作成
  async create(profile: UserProfile): Promise<void> {
    await setDoc(doc(db, USERS_COLLECTION, profile.uid), {
      ...profile,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    })
  },

  // ユーザープロファイルを更新
  async update(uid: string, updates: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      ...updates,
      updatedAt: new Date()
    })
  }
}

// Workspaces CRUD
export const workspacesApi = {
  // ワークスペース一覧を取得（ユーザーIDでフィルタ）
  async getAll(userId: string): Promise<Workspace[]> {
    const q = query(
      collection(db, WORKSPACES_COLLECTION),
      where('userId', '==', userId),
      orderBy('order')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    } as Workspace))
  },

  // ワークスペースを作成
  async create(workspace: Workspace): Promise<void> {
    await setDoc(doc(db, WORKSPACES_COLLECTION, workspace.id), {
      ...workspace,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    })
  },

  // ワークスペースを更新
  async update(id: string, updates: Partial<Workspace>): Promise<void> {
    // Firestoreはundefinedを扱えないので、オプションフィールドはnullに変換
    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    }

    // オプションフィールドがundefinedの場合、nullに変換
    if ('icon' in updates && updates.icon === undefined) {
      updateData.icon = null
    }
    if ('color' in updates && updates.color === undefined) {
      updateData.color = null
    }

    await updateDoc(doc(db, WORKSPACES_COLLECTION, id), updateData)
  },

  // ワークスペースを削除
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, WORKSPACES_COLLECTION, id))
  },

  // リアルタイムリスナー（ユーザーIDでフィルタ）
  subscribe(userId: string, callback: (workspaces: Workspace[]) => void): Unsubscribe {
    const q = query(
      collection(db, WORKSPACES_COLLECTION),
      where('userId', '==', userId),
      orderBy('order')
    )
    return onSnapshot(q, (snapshot) => {
      const workspaces = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Workspace))
      callback(workspaces)
    })
  }
}

// Projects CRUD
export const projectsApi = {
  // プロジェクト一覧を取得（ユーザーIDでフィルタ）
  async getAll(userId: string): Promise<Project[]> {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('order')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    } as Project))
  },

  // ワークスペース別プロジェクトを取得
  async getByWorkspaceId(workspaceId: string): Promise<Project[]> {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('workspaceId', '==', workspaceId),
      orderBy('order')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    } as Project))
  },

  // プロジェクトを作成
  async create(project: Project): Promise<void> {
    await setDoc(doc(db, PROJECTS_COLLECTION, project.id), {
      ...project,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    })
  },

  // プロジェクトを更新
  async update(id: string, updates: Partial<Project>): Promise<void> {
    // Firestoreはundefinedを扱えないので、オプションフィールドはnullに変換
    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    }

    // オプションフィールドがundefinedの場合、nullに変換
    if ('icon' in updates && updates.icon === undefined) {
      updateData.icon = null
    }
    if ('color' in updates && updates.color === undefined) {
      updateData.color = null
    }

    await updateDoc(doc(db, PROJECTS_COLLECTION, id), updateData)
  },

  // プロジェクトを削除
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, PROJECTS_COLLECTION, id))
  },

  // リアルタイムリスナー（全プロジェクト、ユーザーIDでフィルタ）
  subscribe(userId: string, callback: (projects: Project[]) => void): Unsubscribe {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('order')
    )
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Project))
      callback(projects)
    })
  },

  // リアルタイムリスナー（ワークスペース別）
  subscribeByWorkspaceId(workspaceId: string, callback: (projects: Project[]) => void): Unsubscribe {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('workspaceId', '==', workspaceId),
      orderBy('order')
    )
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Project))
      callback(projects)
    })
  }
}

// Lists CRUD
export const listsApi = {
  // リスト一覧を取得（ユーザーIDでフィルタ）
  async getAll(userId: string): Promise<List[]> {
    const q = query(
      collection(db, LISTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('order')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    } as List))
  },

  // プロジェクト別リストを取得
  async getByProjectId(projectId: string): Promise<List[]> {
    const q = query(
      collection(db, LISTS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('order')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    } as List))
  },

  // リストを作成
  async create(list: List): Promise<void> {
    await setDoc(doc(db, LISTS_COLLECTION, list.id), {
      ...list,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt
    })
  },

  // リストを更新
  async update(id: string, updates: Partial<List>): Promise<void> {
    // Firestoreはundefinedを扱えないので、オプションフィールドはnullに変換
    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    }

    // オプションフィールドがundefinedの場合、nullに変換
    if ('icon' in updates && updates.icon === undefined) {
      updateData.icon = null
    }
    if ('color' in updates && updates.color === undefined) {
      updateData.color = null
    }

    await updateDoc(doc(db, LISTS_COLLECTION, id), updateData)
  },

  // リストを削除
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, LISTS_COLLECTION, id))
  },

  // リアルタイムリスナー（全リスト、ユーザーIDでフィルタ）
  subscribe(userId: string, callback: (lists: List[]) => void): Unsubscribe {
    const q = query(
      collection(db, LISTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('order')
    )
    return onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as List))
      callback(lists)
    })
  },

  // リアルタイムリスナー（プロジェクト別）
  subscribeByProjectId(projectId: string, callback: (lists: List[]) => void): Unsubscribe {
    const q = query(
      collection(db, LISTS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('order')
    )
    return onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as List))
      callback(lists)
    })
  }
}

// Tasks CRUD
export const tasksApi = {
  // 全タスクを取得（ユーザーIDでフィルタ）
  async getAll(userId: string): Promise<Task[]> {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      startDate: doc.data().startDate?.toDate() || undefined,
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
      startDate: doc.data().startDate?.toDate() || undefined,
      dueDate: doc.data().dueDate?.toDate() || undefined
    } as Task))
  },

  // タスクを作成
  async create(task: Task): Promise<void> {
    await setDoc(doc(db, TASKS_COLLECTION, task.id), {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      startDate: task.startDate || null,
      dueDate: task.dueDate || null
    })
  },

  // タスクを更新
  async update(id: string, updates: Partial<Task>): Promise<void> {
    // Firestoreはundefinedを扱えないので、日付フィールドはnullに変換
    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    }

    // startDateが明示的に渡されている場合（undefinedでも）、nullに変換
    if ('startDate' in updates) {
      updateData.startDate = updates.startDate || null
    }

    // dueDateが明示的に渡されている場合（undefinedでも）、nullに変換
    if ('dueDate' in updates) {
      updateData.dueDate = updates.dueDate || null
    }

    await updateDoc(doc(db, TASKS_COLLECTION, id), updateData)
  },

  // タスクを削除
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, TASKS_COLLECTION, id))
  },

  // リアルタイムリスナー（全タスク、ユーザーIDでフィルタ）
  subscribe(userId: string, callback: (tasks: Task[]) => void): Unsubscribe {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('userId', '==', userId)
    )
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        startDate: doc.data().startDate?.toDate() || undefined,
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
        startDate: doc.data().startDate?.toDate() || undefined,
        dueDate: doc.data().dueDate?.toDate() || undefined
      } as Task))
      callback(tasks)
    })
  }
}
