<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, Folder, ListTodo, Plus, Settings, Trash2 } from 'lucide-vue-next'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useProjectStore } from '@/stores/projectStore'
import { useListStore } from '@/stores/listStore'
import WorkspaceEditDialog from '@/components/workspace/WorkspaceEditDialog.vue'
import ProjectEditDialog from '@/components/project/ProjectEditDialog.vue'
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog.vue'
import type { Workspace, Project, List } from '@/lib/types'

const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const listStore = useListStore()

// 編集ダイアログの状態
const isWorkspaceEditOpen = ref(false)
const isProjectEditOpen = ref(false)
const editingWorkspace = ref<Workspace | null>(null)
const editingProject = ref<Project | null>(null)

// 削除確認ダイアログの状態
const isDeleteConfirmOpen = ref(false)
const deleteTarget = ref<{ type: 'workspace' | 'project' | 'list'; item: Workspace | Project | List } | null>(null)

// 現在のワークスペース
const currentWorkspace = computed(() => workspaceStore.currentWorkspace)

// 現在のワークスペースのプロジェクト
const projects = computed(() => projectStore.currentWorkspaceProjects)

// プロジェクトごとのリストを取得
const getProjectLists = (projectId: string) => {
  return listStore.allLists.filter(list => list.projectId === projectId)
}

// プロジェクトを選択
const selectProject = (projectId: string) => {
  projectStore.setCurrentProject(projectId)
}

// リストを選択
const selectList = (listId: string) => {
  listStore.setCurrentList(listId)
}

// 新規プロジェクトを作成
const createNewProject = async () => {
  if (!currentWorkspace.value) return

  const name = prompt('プロジェクト名を入力してください', '新しいプロジェクト')
  if (!name) return

  try {
    await projectStore.createProject({
      name,
      workspaceId: currentWorkspace.value.id,
      order: projects.value.length
    })
  } catch (error) {
    console.error('Failed to create project:', error)
    alert('プロジェクトの作成に失敗しました')
  }
}

// 新規リストを作成
const createNewList = async (projectId: string) => {
  const name = prompt('リスト名を入力してください', '新しいリスト')
  if (!name) return

  try {
    const project = projectStore.projects[projectId]
    if (!project) return

    await listStore.createList({
      name,
      projectId: projectId,
      order: getProjectLists(projectId).length
    })
  } catch (error) {
    console.error('Failed to create list:', error)
    alert('リストの作成に失敗しました')
  }
}

// ワークスペース編集を開く
const openWorkspaceEdit = () => {
  if (!currentWorkspace.value) return
  editingWorkspace.value = currentWorkspace.value
  isWorkspaceEditOpen.value = true
}

// ワークスペース編集を保存
const saveWorkspaceEdit = async (data: { name: string; icon?: string; color?: string }) => {
  if (!editingWorkspace.value) return

  try {
    await workspaceStore.updateWorkspace(editingWorkspace.value.id, data)
    isWorkspaceEditOpen.value = false
    editingWorkspace.value = null
  } catch (error) {
    console.error('Failed to update workspace:', error)
    alert('ワークスペースの更新に失敗しました')
  }
}

// プロジェクト編集を開く
const openProjectEdit = (project: Project) => {
  editingProject.value = project
  isProjectEditOpen.value = true
}

// プロジェクト編集を保存
const saveProjectEdit = async (data: { name: string; icon?: string; color?: string }) => {
  if (!editingProject.value) return

  try {
    await projectStore.updateProject(editingProject.value.id, data)
    isProjectEditOpen.value = false
    editingProject.value = null
  } catch (error) {
    console.error('Failed to update project:', error)
    alert('プロジェクトの更新に失敗しました')
  }
}

// 削除確認ダイアログを開く
const openDeleteConfirm = (type: 'workspace' | 'project' | 'list', item: Workspace | Project | List) => {
  deleteTarget.value = { type, item }
  isDeleteConfirmOpen.value = true
}

// 削除を実行
const handleDelete = async () => {
  if (!deleteTarget.value) return

  const { type, item } = deleteTarget.value

  try {
    if (type === 'workspace') {
      await workspaceStore.deleteWorkspace(item.id)
      isWorkspaceEditOpen.value = false
      editingWorkspace.value = null
    } else if (type === 'project') {
      await projectStore.deleteProject(item.id)
      isProjectEditOpen.value = false
      editingProject.value = null
    } else if (type === 'list') {
      await listStore.deleteList(item.id)
    }
    isDeleteConfirmOpen.value = false
    deleteTarget.value = null
  } catch (error) {
    console.error('Failed to delete:', error)
    alert('削除に失敗しました')
  }
}

// ワークスペース削除（編集ダイアログから）
const deleteWorkspaceFromDialog = () => {
  if (!editingWorkspace.value) return
  openDeleteConfirm('workspace', editingWorkspace.value)
}

// プロジェクト削除（編集ダイアログから）
const deleteProjectFromDialog = () => {
  if (!editingProject.value) return
  openDeleteConfirm('project', editingProject.value)
}
</script>

<template>
  <aside class="w-64 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto">
    <!-- ワークスペースセレクター -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center gap-1">
        <button
          class="flex-1 flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors min-w-0"
          @click="() => {}"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span
              v-if="currentWorkspace?.icon"
              class="text-lg flex-shrink-0"
            >{{ currentWorkspace.icon }}</span>
            <span class="font-medium truncate">{{ currentWorkspace?.name || 'ワークスペース' }}</span>
          </div>
          <ChevronDown :size="16" class="text-gray-500 flex-shrink-0" />
        </button>
        <button
          @click="openWorkspaceEdit"
          class="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
          title="ワークスペースを編集"
        >
          <Settings :size="16" class="text-gray-600" />
        </button>
      </div>
    </div>

    <!-- プロジェクト一覧 -->
    <div class="p-2">
      <div class="flex items-center justify-between px-2 py-2 mb-1">
        <span class="text-xs font-semibold text-gray-500 uppercase">プロジェクト</span>
        <button
          @click="createNewProject"
          class="p-1 hover:bg-gray-200 rounded transition-colors"
          title="新しいプロジェクト"
        >
          <Plus :size="14" class="text-gray-600" />
        </button>
      </div>

      <div class="space-y-1">
        <div
          v-for="project in projects"
          :key="project.id"
          class="space-y-0.5"
        >
          <!-- プロジェクト名 -->
          <button
            @click="selectProject(project.id)"
            class="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
            :class="{
              'bg-blue-50 hover:bg-blue-100': projectStore.currentProjectId === project.id
            }"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <Folder
                :size="16"
                :class="{
                  'text-blue-600': projectStore.currentProjectId === project.id,
                  'text-gray-500': projectStore.currentProjectId !== project.id
                }"
              />
              <span
                class="text-sm truncate"
                :class="{
                  'font-medium text-blue-900': projectStore.currentProjectId === project.id,
                  'text-gray-700': projectStore.currentProjectId !== project.id
                }"
              >{{ project.name }}</span>
            </div>
            <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
              <button
                @click.stop="openProjectEdit(project)"
                class="p-0.5 hover:bg-gray-200 rounded"
                title="プロジェクトを編集"
              >
                <Settings :size="12" class="text-gray-600" />
              </button>
              <button
                @click.stop="createNewList(project.id)"
                class="p-0.5 hover:bg-gray-200 rounded"
                title="新しいリスト"
              >
                <Plus :size="12" class="text-gray-600" />
              </button>
            </div>
          </button>

          <!-- プロジェクト内のリスト -->
          <div
            v-if="projectStore.currentProjectId === project.id"
            class="ml-6 space-y-0.5"
          >
            <button
              v-for="list in getProjectLists(project.id)"
              :key="list.id"
              @click="selectList(list.id)"
              class="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors group"
              :class="{
                'bg-blue-100 hover:bg-blue-200': listStore.currentListId === list.id
              }"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <ListTodo
                  :size="14"
                  :class="{
                    'text-blue-600': listStore.currentListId === list.id,
                    'text-gray-400': listStore.currentListId !== list.id
                  }"
                />
                <span
                  class="text-sm truncate"
                  :class="{
                    'font-medium text-blue-900': listStore.currentListId === list.id,
                    'text-gray-600': listStore.currentListId !== list.id
                  }"
                >{{ list.name }}</span>
              </div>
              <button
                @click.stop="openDeleteConfirm('list', list)"
                class="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all flex-shrink-0"
                title="リストを削除"
              >
                <Trash2 :size="12" class="text-red-600" />
              </button>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 編集ダイアログ -->
    <WorkspaceEditDialog
      :open="isWorkspaceEditOpen"
      :workspace="editingWorkspace"
      @close="isWorkspaceEditOpen = false"
      @save="saveWorkspaceEdit"
      @delete="deleteWorkspaceFromDialog"
    />
    <ProjectEditDialog
      :open="isProjectEditOpen"
      :project="editingProject"
      @close="isProjectEditOpen = false"
      @save="saveProjectEdit"
      @delete="deleteProjectFromDialog"
    />

    <!-- 削除確認ダイアログ -->
    <DeleteConfirmDialog
      :open="isDeleteConfirmOpen"
      :item-name="deleteTarget?.item.name"
      @close="isDeleteConfirmOpen = false"
      @confirm="handleDelete"
    />
  </aside>
</template>
