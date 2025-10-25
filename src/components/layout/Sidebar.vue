<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown, Folder, ListTodo, Plus } from 'lucide-vue-next'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useProjectStore } from '@/stores/projectStore'
import { useListStore } from '@/stores/listStore'

const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const listStore = useListStore()

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
</script>

<template>
  <aside class="w-64 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto">
    <!-- ワークスペースセレクター -->
    <div class="p-4 border-b border-gray-200">
      <button
        class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
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
            <button
              @click.stop="createNewList(project.id)"
              class="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all flex-shrink-0"
              title="新しいリスト"
            >
              <Plus :size="12" class="text-gray-600" />
            </button>
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
              class="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              :class="{
                'bg-blue-100 hover:bg-blue-200': listStore.currentListId === list.id
              }"
            >
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
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
