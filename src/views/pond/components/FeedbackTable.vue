<template>
  <div class="w-full lg:w-[42%] flex flex-col border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) shadow-sm overflow-hidden select-none shrink-0">
    <!-- 状态选择 Tabs -->
    <div class="border-b border-(--archive-border) p-3 shrink-0">
      <n-tabs v-model:value="currentTab" type="segment" size="small" @update:value="emit('tab-change', $event)">
        <n-tab-pane name="all" tab="全部" />
        <n-tab-pane name="pending" tab="待审" />
        <n-tab-pane name="approved" tab="公开" />
        <n-tab-pane name="rejected" tab="拒绝" />
        <n-tab-pane name="adopted" tab="采纳" />
        <n-tab-pane name="done" tab="已完成" />
      </n-tabs>
    </div>

    <!-- 列表滚动区 -->
    <div class="grow overflow-y-auto p-4 space-y-3 relative min-h-[300px]">
      <div v-if="loading" class="absolute inset-0 flex justify-center items-center bg-white/40 dark:bg-black/40 z-20">
        <n-spin size="large" />
      </div>

      <div v-if="filteredFeedbacks.length === 0 && !loading" class="py-16 text-center">
        <span class="i-mdi-fish-off text-4xl tone-muted opacity-30 mb-2 block"></span>
        <p class="text-xs tone-muted">信夹空空如也，暂无相关反馈 🎏</p>
      </div>

      <div class="space-y-3">
        <div
          v-for="fb in paginatedFeedbacks"
          :key="fb.id"
          class="mailbox-card border border-(--archive-border) rounded-xl p-4 cursor-pointer relative transition-all duration-300 text-left flex flex-col justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] animate-card"
          :class="[
            currentFeedback?.id === fb.id 
              ? 'border-(--archive-accent) bg-(--archive-accent)/5 shadow-sm ring-1 ring-(--archive-accent)/20' 
              : 'bg-white/35 dark:bg-black/10 hover:border-(--archive-accent)/45'
          ]"
          @click="emit('select', fb)"
        >
          <!-- 左侧类别颜色竖线 -->
          <div class="absolute left-0 top-3 bottom-3 w-1 rounded-r-md" :class="getCategoryColorClass(fb.category)"></div>

          <div class="pl-2 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-(--archive-text)">{{ fb.nickname }}</span>
                <span v-if="fb.isAnonymous" class="text-[8px] px-1 rounded bg-black/10 text-(--archive-muted) scale-90">匿名</span>
                <span v-if="fb.isPinned" class="text-gold text-xs i-mdi-pin" title="已置顶"></span>
              </div>
              <span :class="[getStatusStyle(fb.status), 'text-[8.5px] px-1.5 py-0.2 rounded-full border scale-95 font-mono uppercase']">
                {{ translateStatus(fb.status) }}
              </span>
            </div>

            <p class="text-[12px] text-(--archive-text)/75 line-clamp-2 leading-relaxed font-light break-all pr-2">
              {{ fb.content }}
            </p>

            <div class="flex items-center justify-between text-[9.5px] tone-muted font-mono pt-1">
              <span>{{ formatTime(fb.createdAt) }}</span>
              <div class="flex items-center gap-1.5">
                <span class="flex items-center gap-0.5"><span class="i-mdi-heart-outline"></span>{{ fb.likeCount }}</span>
                <span class="flex items-center gap-0.5"><span class="i-mdi-message-outline"></span>{{ fb.replyCount }}</span>
              </div>
            </div>

            <!-- 快捷是否公开展示 -->
            <div class="flex items-center justify-between pt-2 border-t border-(--archive-border)/40 mt-1 select-none" @click.stop>
              <span class="text-[10px] text-(--archive-text)/50 font-bold flex items-center gap-1">
                <span class="i-mdi-eye-outline text-emerald-600 text-xs"></span>前台公开展示
              </span>
              <n-switch
                :value="fb.status === 'approved' || fb.status === 'adopted' || fb.status === 'done'"
                size="small"
                @update:value="(val: boolean) => emit('toggle-public', fb, val)"
              >
                <template #checked>展示</template>
                <template #unchecked>隐藏</template>
              </n-switch>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部分页 -->
    <div class="p-3 border-t border-(--archive-border) flex justify-center shrink-0">
      <n-pagination
        v-model:page="currentPage"
        :page-size="pageSize"
        :item-count="filteredFeedbacks.length"
        size="small"
        @update:page="emit('page-change', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NTabs, NTabPane, NSpin, NSwitch, NPagination } from 'naive-ui'
import type { Feedback } from '@/interface/love'

const props = defineProps<{
  paginatedFeedbacks: Feedback[]
  filteredFeedbacks: Feedback[]
  currentFeedback: Feedback | null
  activeTab: string
  page: number
  pageSize: number
  loading: boolean
  allTypes: any[]
}>()

const emit = defineEmits<{
  (e: 'update:page', val: number): void
  (e: 'select', fb: Feedback): void
  (e: 'toggle-public', fb: Feedback, val: boolean): void
  (e: 'tab-change', val: string): void
  (e: 'page-change', val: number): void
}>()

const currentTab = computed({
  get: () => props.activeTab,
  set: (val) => emit('tab-change', val)
})

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const getCategoryColorClass = (cat: string) => {
  const match = props.allTypes.find(t => t.value === cat)
  const color = match?.color || 'zinc'
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    pink: 'bg-pink-500',
    stone: 'bg-stone-500'
  }
  return colorMap[color] || 'bg-zinc-500'
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
    case 'approved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/5'
    case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/5'
    case 'adopted': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/5'
    case 'done': return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/5'
    default: return 'bg-zinc-100 text-zinc-600 border-zinc-200'
  }
}

const translateStatus = (s: string) => {
  switch (s) {
    case 'pending': return '待审'
    case 'approved': return '公开'
    case 'rejected': return '拒绝'
    case 'adopted': return '已采纳'
    case 'done': return '已完成'
    default: return s
  }
}

const formatTime = (timeStr?: string) => {
  if (!timeStr) return ''
  return timeStr.replace('T', ' ').split('.')[0].slice(0, 16)
}
</script>
