<template>
  <div class="flex flex-col gap-4">
    <!-- 检索与操作栏 -->
    <section class="archive-card p-4 sm:p-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <n-input
            v-model:value="searchQuery"
            clearable
            placeholder="搜索纪念日、大事件或地点"
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
        <n-button type="primary" class="w-full sm:w-auto" @click="emit('create', 'event')">
          <template #icon><span class="i-mdi-calendar-plus"></span></template>
          记录纪念事件
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
    <section v-if="loading" class="archive-card p-6">
      <div class="skeleton-line h-4 w-32 rounded-full mb-6"></div>
      <div class="flex gap-4 mb-4" v-for="i in 3" :key="i">
        <div class="skeleton-block h-6 w-6 rounded-full shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton-line h-4 w-1/4 rounded-full"></div>
          <div class="skeleton-line h-3 w-1/2 rounded-full"></div>
        </div>
      </div>
    </section>

    <!-- 空列表 -->
    <section v-else-if="filteredChronicle.length === 0" class="archive-card p-10 text-center">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-purple-500/10 text-purple-500">
        <span class="i-mdi-timeline-outline text-2xl"></span>
      </div>
      <h2 class="m-0 mt-5 text-xl font-760 text-(--archive-text)">编年史空空如也</h2>
      <p class="mx-auto m-0 mt-2 max-w-md text-sm leading-6 tone-muted">记录下恋爱时光流沙里的每一个闪光点，串成时间链条。</p>
      <n-button type="primary" class="mt-5" @click="emit('create', 'event')">记录纪念事件</n-button>
    </section>

    <!-- 时间线视图 -->
    <section v-else class="archive-card p-5 sm:p-7">
      <div class="timeline-container px-2 py-4">
        <n-timeline size="large">
          <n-timeline-item
            v-for="note in paginatedChronicle"
            :key="note.id"
            :type="note.mood === 'romantic' ? 'error' : (note.mood === 'playful' ? 'warning' : 'info')"
            :title="note.title"
            :time="formatDate(note.date).split(' ')[0]"
          >
            <template #default>
              <div class="mt-2 text-sm text-(--archive-text)/90 bg-[color-mix(in_srgb,var(--archive-bg-card))]/40 p-4 rounded-2xl border border-(--archive-border)/40 w-full">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <!-- 缩略图预览 -->
                  <div v-if="note.cover" class="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden border border-(--archive-border)/50 bg-black/5">
                    <img :src="note.cover" class="w-full h-full object-cover" />
                  </div>
                  
                  <!-- 文字描述 -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-1.5 text-[11px] tone-faint">
                      <span v-if="note.location" class="flex items-center gap-0.5"><span class="i-mdi-map-marker text-xs"></span>{{ note.location }}</span>
                      <span class="h-1 w-1 rounded-full bg-(--archive-faint)" v-if="note.location"></span>
                      <span class="px-1.5 py-0.2 rounded bg-neutral-500/10 text-[10px] text-neutral-600 dark:text-neutral-400 font-semibold">{{ translateMood(note.mood) }}</span>
                      <span class="h-1 w-1 rounded-full bg-(--archive-faint)"></span>
                      <span class="text-[10px] uppercase font-bold tracking-wider tone-muted">{{ note.visibility }}</span>
                    </div>
                    <p class="m-0 mt-2 text-xs leading-relaxed tone-muted line-clamp-3">
                      {{ note.content || '暂无详细事件描述。' }}
                    </p>
                  </div>
                </div>

                <!-- 操作栏 -->
                <div class="flex justify-end gap-2 border-t border-(--archive-border)/30 pt-3 mt-3">
                  <n-button size="tiny" secondary @click="emit('edit', note, 'event')">编辑事件</n-button>
                  <n-button size="tiny" secondary type="error" @click="emit('delete', note.id)">删除事件</n-button>
                </div>
              </div>
            </template>
          </n-timeline-item>
        </n-timeline>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between flex-wrap gap-3 mt-4 border-t border-(--archive-border)/30 pt-4">
        <div class="flex items-center gap-2 text-xs tone-muted">
          共 <span class="font-700 text-(--archive-text)">{{ filteredChronicle.length }}</span> 个事件节点
        </div>
        <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :item-count="filteredChronicle.length"
          :page-sizes="[10, 15, 20, 30]"
          show-size-picker
          size="medium"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NInput, NButton, NPagination, NTimeline, NTimelineItem } from 'naive-ui'

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

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 16)
}

const filteredChronicle = computed(() => {
  const base = props.notes
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return base
  return base.filter(
    (n) =>
      n.title.toLowerCase().includes(query) ||
      (n.content && n.content.toLowerCase().includes(query)) ||
      (n.location && n.location.toLowerCase().includes(query))
  )
})

const paginatedChronicle = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredChronicle.value.slice(start, end)
})
</script>
