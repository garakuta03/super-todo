import { nanoid } from 'nanoid'
import type { UserProfile, Workspace, Project, List } from './types'
import { usersApi, workspacesApi, projectsApi, listsApi } from './firestore'

/**
 * 新規ユーザーの初期化処理
 * - ユーザープロファイルを作成
 * - デフォルトワークスペースを作成
 * - デフォルトプロジェクトを作成
 * - デフォルトリストを作成
 */
export async function initializeNewUser(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<void> {
  const now = new Date()

  try {
    // 1. ユーザープロファイルを作成
    const userProfile: UserProfile = {
      uid,
      email,
      displayName,
      photoURL,
      isInitialized: true,
      createdAt: now,
      updatedAt: now
    }
    await usersApi.create(userProfile)

    // 2. デフォルトワークスペースを作成
    const workspace: Workspace = {
      id: nanoid(),
      name: `${displayName}のワークスペース`,
      userId: uid,
      icon: '🏢',
      order: 0,
      createdAt: now,
      updatedAt: now
    }
    await workspacesApi.create(workspace)

    // 3. デフォルトプロジェクトを作成
    const project: Project = {
      id: nanoid(),
      name: '最初のプロジェクト',
      workspaceId: workspace.id,
      userId: uid,
      icon: '📁',
      order: 0,
      createdAt: now,
      updatedAt: now
    }
    await projectsApi.create(project)

    // 4. デフォルトリストを作成
    const list: List = {
      id: nanoid(),
      name: 'ToDoリスト',
      projectId: project.id,
      userId: uid,
      icon: '📝',
      order: 0,
      createdAt: now,
      updatedAt: now
    }
    await listsApi.create(list)

    console.log('User initialization completed successfully')
  } catch (error) {
    console.error('Failed to initialize user:', error)
    throw new Error('ユーザーの初期化に失敗しました')
  }
}

/**
 * ユーザーが初期化済みかどうかを確認
 */
export async function isUserInitialized(uid: string): Promise<boolean> {
  try {
    const profile = await usersApi.get(uid)
    return profile?.isInitialized ?? false
  } catch (error) {
    console.error('Failed to check user initialization:', error)
    return false
  }
}
