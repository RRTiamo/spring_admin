<template>
  <div class="flex flex-col gap-4">
    <!-- 检索与操作栏 -->
    <section class="archive-card p-4 sm:p-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <n-input
            v-model:value="searchQuery"
            clearable
            placeholder="搜索甜蜜瞬间的标题、内容或地点"
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
        <n-button type="primary" class="w-full sm:w-auto" @click="emit('create', 'moment')">
          <template #icon><span class="i-mdi-camera"></span></template>
          记录新瞬间
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
    <section v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="index in 4" :key="index" class="archive-card p-4 flex flex-col gap-3">
        <div class="skeleton-block h-48 w-full rounded-xl"></div>
        <div class="skeleton-line h-4 w-3/5 rounded-full"></div>
        <div class="skeleton-line h-3 w-4/5 rounded-full"></div>
      </div>
    </section>

    <!-- 空列表 -->
    <section v-else-if="filteredMoments.length === 0" class="archive-card p-10 text-center">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-red-500/10 text-red-500">
        <span class="i-mdi-image-broken-variant text-2xl"></span>
      </div>
      <h2 class="m-0 mt-5 text-xl font-760 text-(--archive-text)">这里还没有甜蜜瞬间</h2>
      <p class="mx-auto m-0 mt-2 max-w-md text-sm leading-6 tone-muted">点击上方按钮，记录你们的第一张照片和瞬间吧。</p>
      <n-button type="primary" class="mt-5" @click="emit('create', 'moment')">记录新瞬间</n-button>
    </section>

    <!-- 照片墙网格视图 (拍立得照片风格) -->
    <section v-else class="flex flex-col gap-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <article
          v-for="(note, index) in paginatedMoments"
          :key="note.id"
          class="archive-card overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col article-row"
        >
          <!-- 拍立得照片风格封面 -->
          <div class="relative w-full pt-[75%] overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 border-b border-(--archive-border)/40">
            <img :src="note.cover || getMockCover(index)" :alt="note.title" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] bg-black/60 text-white font-bold backdrop-blur-sm tracking-wider">
              {{ translateMood(note.mood) }}
            </div>
          </div>

          <!-- 照片文字与卡片底部 -->
          <div class="p-4 flex-1 flex flex-col justify-between gap-3 bg-(--archive-bg-card)">
            <div>
              <span class="text-[10px] tone-muted flex items-center gap-1">
                <span class="i-mdi-calendar-range text-xs"></span>
                {{ formatDate(note.date).split(' ')[0] }}
              </span>
              <h4 class="m-0 mt-1.5 text-sm font-750 leading-snug line-clamp-1 text-(--archive-text)">
                {{ note.title }}
              </h4>
              <p v-if="note.location" class="m-0 mt-1 text-[11px] tone-faint flex items-center gap-0.5">
                <span class="i-mdi-map-marker text-[10px]"></span>
                {{ note.location }}
              </p>
            </div>

            <!-- 操作栏 -->
            <div class="flex items-center justify-between border-t border-(--archive-border)/30 pt-3 mt-1">
              <span class="text-[10px] tone-muted uppercase tracking-wider font-semibold">
                {{ note.visibility === 'public' ? '公开' : (note.visibility === 'private' ? '私密' : '隐藏') }}
              </span>
              <n-space size="small">
                <n-button size="tiny" secondary @click="emit('edit', note, 'moment')">编辑</n-button>
                <n-button size="tiny" secondary type="error" @click="emit('delete', note.id)">删除</n-button>
              </n-space>
            </div>
          </div>
        </article>
      </div>

      <!-- 分页 -->
      <div class="archive-card p-4 flex items-center justify-between flex-wrap gap-3 mt-2">
        <div class="flex items-center gap-2 text-xs tone-muted">
          共 <span class="font-700 text-(--archive-text)">{{ filteredMoments.length }}</span> 个甜蜜瞬间
        </div>
        <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :item-count="filteredMoments.length"
          :page-sizes="[8, 12, 16, 24]"
          show-size-picker
          size="medium"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NInput, NButton, NPagination, NSpace } from 'naive-ui'

const props = defineProps<{
  notes: any[]
  loading: boolean
  backendMode: 'api' | 'local'
}>()

const emit = defineEmits(['create', 'edit', 'delete'])

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(8)

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

const filteredMoments = computed(() => {
  const base = props.notes.filter((n) => n.cover && n.cover.trim() !== '')
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return base
  return base.filter(
    (n) =>
      n.title.toLowerCase().includes(query) ||
      (n.content && n.content.toLowerCase().includes(query)) ||
      (n.location && n.location.toLowerCase().includes(query))
  )
})

const paginatedMoments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMoments.value.slice(start, end)
})
</script>
