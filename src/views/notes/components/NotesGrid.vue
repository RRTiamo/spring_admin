<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="note in paginatedNotes"
        :key="note.id"
        class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-6 shadow-sm flex flex-col justify-between min-h-[180px] hover:shadow-md hover:border-(--archive-accent)/30 transition-all duration-300 relative group"
      >
        <!-- 胶带效果 -->
        <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-yellow-500/10 border-x border-dashed border-yellow-500/20 rotate-1 z-10 pointer-events-none"></div>

        <!-- 便签正文 -->
        <div class="space-y-3">
          <div v-if="note.mood" class="flex">
            <span :class="[getMoodStyle(note.mood), 'px-2 py-0.5 rounded-lg font-bold text-[10px] select-none flex items-center gap-1']">
              <span>{{ getMoodEmoji(note.mood) }}</span>
              <span>{{ translateMood(note.mood) }}</span>
            </span>
          </div>
          <p class="text-sm leading-relaxed text-(--archive-text)/90 whitespace-pre-wrap break-words text-left">
            {{ note.content }}
          </p>
        </div>

        <!-- 底部时间与操作 -->
        <div class="mt-6 pt-4 border-t border-(--archive-border)/50 flex justify-between items-center text-xs font-mono tone-muted">
          <span class="flex items-center gap-1">
            <span class="i-mdi-clock-outline text-sm tone-accent"></span>
            <span>{{ formatTime(note.createTime || note.date) }}</span>
          </span>

          <button
            @click="emit('delete', note.id)"
            class="px-2.5 py-1 text-[11px] text-red-500 hover:text-red-700 font-bold border border-red-500/15 hover:bg-red-500/5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            <span class="i-mdi-trash-can-outline"></span>
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 分页栏 -->
    <div class="flex justify-center pt-4">
      <n-pagination
        v-model:page="currentPage"
        v-model:page-size="size"
        :item-count="filteredNotes.length"
        show-size-picker
        :page-sizes="[6, 9, 12, 24]"
        class="archive-pagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NPagination } from 'naive-ui'
import type { Note } from '@/interface/love'

const props = defineProps<{
  paginatedNotes: Note[]
  filteredNotes: Note[]
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'update:page', val: number): void
  (e: 'update:pageSize', val: number): void
  (e: 'delete', id: number): void
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const size = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val)
})

const getMoodEmoji = (m?: string) => {
  switch (m) {
    case 'happy': return '😊'
    case 'calm': return '🌿'
    case 'tired': return '🥱'
    case 'love': return '💓'
    case 'blue': return '🍂'
    default: return '📝'
  }
}

const translateMood = (m?: string) => {
  switch (m) {
    case 'happy': return '喜悦'
    case 'calm': return '平静'
    case 'tired': return '疲惫'
    case 'love': return '心动'
    case 'blue': return '忧郁'
    default: return '随笔'
  }
}

const getMoodStyle = (m?: string) => {
  switch (m) {
    case 'happy': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    case 'calm': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    case 'tired': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    case 'love': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    case 'blue': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    default: return 'bg-zinc-500/10 text-zinc-600'
  }
}

const formatTime = (timeStr?: string) => {
  if (!timeStr) return ''
  return timeStr.replace('T', ' ').split('.')[0].slice(0, 16)
}
</script>
