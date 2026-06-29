<template>
  <div class="flex flex-col gap-4">
    <!-- 检索与操作栏 -->
    <section class="archive-card p-4 sm:p-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <n-input
            v-model:value="searchQuery"
            clearable
            placeholder="搜索日记的标题、内容或发生地点"
            class="w-full sm:max-w-[420px]"
          >
            <template #prefix>
              <span class="i-mdi-magnify tone-faint text-lg"></span>
            </template>
          </n-input>
          <span class="status-chip w-fit" :style="{ color: statusColor }">
            <span :class="statusIcon"></span>
            {{ statusText }}
          </span>
        </div>
        <n-button type="primary" class="w-full sm:w-auto" @click="emit('create', 'diary')">
          <template #icon><span class="i-mdi-pencil"></span></template>
          撰写恋爱日记
        </n-button>
      </div>
    </section>

    <!-- 离线测试提醒 -->
    <section v-if="backendMode === 'local'" class="soft-panel flex items-start gap-3 p-4">
      <span class="i-mdi-wifi-off tone-accent mt-0.5 text-lg"></span>
      <div>
        <p class="m-0 text-sm font-700 text-(--archive-text)">当前使用本地预览数据</p>
        <p class="m-0 mt-1 text-xs leading-5 tone-muted">后端服务恢复后，列表会继续尝试读取真实接口。</p>
      </div>
    </section>

    <!-- 加载中 -->
    <section v-if="loading" class="grid gap-3">
      <div v-for="index in 2" :key="index" class="archive-card p-5">
        <div class="skeleton-line h-4 w-32 rounded-full"></div>
        <div class="skeleton-line mt-4 h-5 w-3/5 rounded-full"></div>
        <div class="skeleton-line mt-3 h-3 w-4/5 rounded-full"></div>
      </div>
    </section>

    <!-- 空列表 -->
    <section v-else-if="filteredDiaries.length === 0" class="archive-card p-10 text-center">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-pink-500/10 text-pink-500">
        <span class="i-mdi-book-open-page-variant text-2xl"></span>
      </div>
      <h2 class="m-0 mt-5 text-xl font-760 text-(--archive-text)">恋爱日记本空空如也</h2>
      <p class="mx-auto m-0 mt-2 max-w-md text-sm leading-6 tone-muted">开始写下第一篇日记，把岁月的物理温度永久珍藏。</p>
      <n-button type="primary" class="mt-5" @click="emit('create', 'diary')">撰写恋爱日记</n-button>
    </section>

    <!-- 日记列表视图 -->
    <section v-else class="grid gap-3">
      <article
        v-for="(note, index) in paginatedDiaries"
        :key="note.id"
        class="article-row archive-card overflow-hidden p-4 sm:p-5 hover:border-[color-mix(in_srgb,var(--archive-accent)_30%,transparent)] transition-all duration-300"
      >
        <div class="grid gap-4 md:grid-cols-[132px_1fr_auto] md:items-center">
          <div class="relative h-24 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0">
            <img :src="note.cover || getMockCover(index)" :alt="`${note.title} 封面`" class="life-image w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2 text-xs tone-faint">
              <span>{{ formatDate(note.date) }}</span>
              <span v-if="note.location" class="h-1 w-1 rounded-full bg-(--archive-faint)"></span>
              <span v-if="note.location" class="inline-flex items-center gap-1">
                <span class="i-mdi-map-marker text-xs"></span>
                {{ note.location }}
              </span>
              <span class="h-1 w-1 rounded-full bg-(--archive-faint)"></span>
              <span class="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-700 text-[10px]">
                {{ translateMood(note.mood) }}
              </span>
              <span v-if="note.visibility && note.visibility !== 'public'" class="h-1 w-1 rounded-full bg-(--archive-faint)"></span>
              <span v-if="note.visibility && note.visibility !== 'public'" class="text-[9px] px-1 bg-amber-500/10 text-amber-600 rounded border border-amber-500/20 uppercase tracking-widest font-700">
                {{ note.visibility }}
              </span>
            </div>
            <h3 class="m-0 mt-2 text-lg font-760 leading-snug tracking-[-0.01em] text-(--archive-text)">
              {{ note.title }}
            </h3>
            <p class="m-0 mt-2 line-clamp-2 max-w-3xl text-sm leading-6 tone-muted">
              {{ note.content }}
            </p>
          </div>

          <div class="flex items-center justify-end gap-2 border-t border-(--archive-border) pt-4 md:border-t-0 md:pt-0">
            <n-button size="small" secondary @click="emit('edit', note, 'diary')">
              <template #icon><span class="i-mdi-square-edit-outline"></span></template>
              编辑日记
            </n-button>
            <n-button size="small" secondary type="error" @click="emit('delete', note.id)">
              <template #icon><span class="i-mdi-delete-outline"></span></template>
              删除
            </n-button>
          </div>
        </div>
      </article>

      <!-- 分页 -->
      <div class="archive-card p-4 flex items-center justify-between flex-wrap gap-3 mt-2">
        <div class="flex items-center gap-2 text-xs tone-muted">
          共 <span class="font-700 text-(--archive-text)">{{ filteredDiaries.length }}</span> 篇恋爱日记
        </div>
        <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :item-count="filteredDiaries.length"
          :page-sizes="[5, 10, 15, 20]"
          show-size-picker
          size="medium"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NInput, NButton, NPagination } from 'naive-ui'

const props = defineProps<{
  notes: any[]
  loading: boolean
  backendMode: 'api' | 'local'
}>()

const emit = defineEmits(['create', 'edit', 'delete'])

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

watch(searchQuery, () => {
  currentPage.value = 1
})

const statusColor = computed(() => (props.backendMode === 'api' ? 'var(--archive-success)' : 'var(--archive-accent)'))
const statusIcon = computed(() => (props.backendMode === 'api' ? 'i-mdi-wifi' : 'i-mdi-wifi-off'))
const statusText = computed(() => (props.backendMode === 'api' ? '已接通数据库' : '本地离线预览'))

const translateMood = (mood: string) => {
  const map: Record<string, string> = {
    romantic: '浪漫',
    playful: '俏皮',
    peaceful: '宁静',
    quiet: '安静',
    happy: '开心',
    joyful: '欣喜'
  }
  return map[mood] || mood
}

const getMockCover = (idx: number) => {
  const covers = [
    '/assets/love-anniversary.png',
    '/assets/love-cooking.png',
    '/assets/love-museum.png'
  ]
  return covers[idx % covers.length]
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 16)
}

const filteredDiaries = computed(() => {
  const base = props.notes.filter((n) => n.content && n.content.trim() !== '')
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return base
  return base.filter(
    (n) =>
      n.title.toLowerCase().includes(query) ||
      (n.content && n.content.toLowerCase().includes(query)) ||
      (n.location && n.location.toLowerCase().includes(query))
  )
})

const paginatedDiaries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDiaries.value.slice(start, end)
})
</script>
