<template>
  <div class="notes-desk space-y-6">
    <!-- 顶部状态栏 -->
    <div class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md">
      <div class="flex items-start gap-3.5">
        <div class="h-12 w-12 rounded-2xl bg-(--archive-accent)/10 text-(--archive-accent) flex items-center justify-center shrink-0">
          <span class="i-mdi-notebook-outline text-2xl animate-pulse"></span>
        </div>
        <div class="flex flex-col text-left">
          <h3 class="text-lg font-bold text-(--archive-text) tracking-wide">随笔便签管理</h3>
          <p class="text-xs text-(--archive-text)/60 mt-1 leading-relaxed max-w-[48rem]">
            在这里检索、阅读和清理前台「Notes / 随笔便签」页面由您和访客写下的日常小灵感。
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索随笔内容..."
          clearable
          class="archive-input min-w-[200px]"
        >
          <template #prefix>
            <span class="i-mdi-magnify tone-muted"></span>
          </template>
        </n-input>
        <button 
          class="px-4 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          @click="loadNotes"
        >
          <span class="i-mdi-refresh"></span>
          <span>刷新列表</span>
        </button>
      </div>
    </div>

    <!-- 快捷发布随笔卡片 -->
    <NotePublisher
      v-model:newNoteContent="newNoteContent"
      v-model:newNoteMood="newNoteMood"
      :publishing="publishing"
      :mood-options="moodOptions"
      @publish="handlePublish"
    />

    <!-- 随笔卡片列表 -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <n-spin size="large" />
    </div>

    <div v-else-if="paginatedNotes.length === 0" class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-12 text-center shadow-sm">
      <span class="i-mdi-text-box-remove-outline text-5xl tone-muted opacity-30 mb-3 block"></span>
      <p class="text-sm tone-muted">暂无符合搜索条件的便签随笔</p>
    </div>

    <NotesGrid
      v-else
      v-model:page="page"
      v-model:pageSize="pageSize"
      :paginated-notes="paginatedNotes"
      :filtered-notes="filteredNotes"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NInput, NSpin, useDialog, useMessage } from 'naive-ui'
import { getNotesList, createNote, deleteNote } from '@/api/notes'
import type { Note } from '@/interface/love'

// 导入子组件
import NotePublisher from './components/NotePublisher.vue'
import NotesGrid from './components/NotesGrid.vue'

const message = useMessage()
const dialog = useDialog()

// 快捷发布状态
const newNoteContent = ref('')
const newNoteMood = ref('calm')
const publishing = ref(false)

const notes = ref<Note[]>([])
const loading = ref(false)
const searchQuery = ref('')
const page = ref(1)
const pageSize = ref(12)

const moodOptions = [
  { label: '😊 喜悦', value: 'happy' },
  { label: '🌿 平静', value: 'calm' },
  { label: '🥱 疲惫', value: 'tired' },
  { label: '💓 心动', value: 'love' },
  { label: '🍂 忧郁', value: 'blue' }
]

const filteredNotes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return notes.value
  return notes.value.filter(n => n.content.toLowerCase().includes(q))
})

const paginatedNotes = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredNotes.value.slice(start, end)
})

const loadNotes = async () => {
  loading.value = true
  try {
    const response = await getNotesList()
    if (response.data?.code === 200) {
      notes.value = response.data.data
    } else {
      throw new Error(response.data?.msg || 'Failed to load notes')
    }
  } catch (err: any) {
    console.error('Failed to load notes', err)
    message.error(err.message || '加载随笔便签失败，请检查网络或服务状态')
  } finally {
    loading.value = false
  }
}

const handlePublish = async () => {
  if (!newNoteContent.value.trim()) {
    message.warning('请输入随笔内容再贴上墙 📝')
    return
  }

  publishing.value = true
  const payload = {
    content: newNoteContent.value.trim(),
    mood: newNoteMood.value
  }

  try {
    const response = await createNote(payload)
    if (response.data?.code === 200) {
      message.success('随笔贴墙成功！')
      newNoteContent.value = ''
      await loadNotes()
    } else {
      throw new Error(response.data?.msg || '发布失败')
    }
  } catch (err: any) {
    console.error('API publish failed', err)
    message.error(err.message || '随笔发布失败，请检查网络或后端接口服务')
  } finally {
    publishing.value = false
  }
}

const handleDelete = (id: number) => {
  dialog.warning({
    title: '确认删除随笔',
    content: '此操作将永久撕掉该张便签。确定要删除吗？',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteNote(id)
        if (response.data?.code === 200) {
          message.success('随笔已成功撕除')
          await loadNotes()
        } else {
          throw new Error(response.data?.msg || '删除失败')
        }
      } catch (err: any) {
        console.error('API delete failed', err)
        message.error(err.message || '删除随笔失败，请检查网络或后端接口服务')
      }
    }
  })
}

onMounted(() => {
  loadNotes()
})
</script>

<style scoped>
.archive-pagination :deep(.n-pagination-item--active) {
  border-color: var(--archive-accent) !important;
  color: var(--archive-accent) !important;
}
</style>
