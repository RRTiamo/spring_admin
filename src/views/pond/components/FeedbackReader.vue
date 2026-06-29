<template>
  <div class="flex-grow flex flex-col border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) shadow-sm overflow-hidden min-w-0">
    <!-- 空白桌子，未选择信件 -->
    <div v-if="!currentFeedback" class="flex-grow flex flex-col items-center justify-center py-20 px-6 text-center select-none bg-stone-500/5">
      <div class="relative w-28 h-20 mb-4 border border-(--archive-border) bg-(--archive-bg-card) rounded-xl flex items-center justify-center shadow-inner rotate-[-3deg]">
        <span class="i-mdi-email-outline text-4xl text-(--archive-accent)/45"></span>
        <span class="absolute -right-2 -bottom-2 i-mdi-fish text-2xl text-(--archive-accent) animate-bounce"></span>
      </div>
      <h4 class="text-sm font-bold text-(--archive-text)/70">展信台空置</h4>
      <p class="text-xs text-(--archive-text)/50 mt-1 max-w-70 leading-relaxed">
        请在左侧点击信件卡片，在桌面上翻开其详细来信档案 🎏。
      </p>
    </div>

    <!-- 展信详情台 (Minimal Oat Portfolio) -->
    <div v-else class="flex-grow flex flex-col min-h-0 text-left bg-stone-500/5 dark:bg-[#121413] p-4 md:p-5 transition-all duration-300">
      <!-- 详情滚动主体 -->
      <div class="flex-grow overflow-y-auto space-y-5 pr-1">
        
        <!-- 核心信件纸张卡片 -->
        <div class="relative bg-[#FBF9F6] dark:bg-[#1D201E] border border-[#E7E2D5] dark:border-[#2D302E] rounded-2xl p-6 md:p-7 shadow-[0_8px_24px_-8px_rgba(139,120,90,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all">
          <!-- 信纸头部元数据 -->
          <div class="space-y-4 border-b border-stone-500/10 pb-4 select-none">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-[#2C2C2A] dark:text-[#E2E2E0]">{{ currentFeedback.nickname }}</span>
                <span class="text-[9px] text-stone-500/60 px-1.5 py-0.5 rounded-md bg-stone-500/5 dark:bg-white/5 border border-stone-500/10 font-mono">
                  #{{ currentFeedback.id }}
                </span>
                <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-md', getCategoryClass(currentFeedback.category)]">
                  {{ getCategoryLabel(currentFeedback.category) }}
                </span>
              </div>
              <span class="text-[10px] font-mono text-stone-500/50">
                {{ formatFullTime(currentFeedback.createdAt) }}
              </span>
            </div>

            <!-- 联系方式精细药丸徽章流 (Pill Badges Grid) -->
            <div class="flex flex-wrap items-center gap-2 text-[10px] text-stone-500/80 dark:text-stone-400/80 font-mono">
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-500/5 dark:bg-white/5 border border-stone-500/8">
                <span class="i-mdi-email-outline text-xs"></span>
                <span>{{ currentFeedback.email || '未留邮箱' }}</span>
              </div>
              <div v-if="currentFeedback.website" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-500/5 dark:bg-white/5 border border-stone-500/8 hover:border-(--archive-accent) transition-colors">
                <span class="i-mdi-link-variant text-xs"></span>
                <a :href="currentFeedback.website" target="_blank" class="hover:underline truncate max-w-[150px]">
                  {{ currentFeedback.website }}
                </a>
              </div>
              <div v-else class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-500/5 dark:bg-white/5 border border-stone-500/8 italic opacity-60">
                <span class="i-mdi-link-variant text-xs"></span>
                <span>无站点</span>
              </div>
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-500/5 dark:bg-white/5 border border-stone-500/8 ml-auto">
                <span class="i-mdi-ip text-xs"></span>
                <span>{{ currentFeedback.ip || '0.0.0.0' }}</span>
              </div>
            </div>
          </div>

          <!-- 信件主体正文 (舒展无横线，清爽字色与行高) -->
          <div class="py-6 min-h-[140px] text-sm leading-relaxed text-[#2F2F2D] dark:text-[#E2E2E0] whitespace-pre-wrap font-serif tracking-wide select-text">
            {{ currentFeedback.content }}
          </div>

          <!-- 信件底部绑定标签库情况 -->
          <div class="border-t border-stone-500/10 pt-4 select-none">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-stone-500/50">归档标签:</span>
                <template v-if="currentFeedback.tags && currentFeedback.tags.length">
                  <span 
                    v-for="t in currentFeedback.tags" 
                    :key="t.id" 
                    class="text-[9px] font-bold px-2 py-0.5 rounded-md border"
                    :style="{ 
                      backgroundColor: `${t.color}15`, 
                      borderColor: `${t.color}35`, 
                      color: t.color 
                    }"
                  >
                    {{ t.name }}
                  </span>
                </template>
                <span v-else class="text-[9px] font-medium text-stone-500/40 italic">未归档标签</span>
              </div>
              <n-button 
                size="tiny" 
                secondary 
                class="archive-btn"
                @click="showTagSelector = !showTagSelector"
              >
                {{ showTagSelector ? '收起打标' : '分类打标' }}
              </n-button>
            </div>

            <!-- 内嵌快捷打标选板 -->
            <div 
              v-if="showTagSelector" 
              class="mt-3 p-3 bg-stone-500/5 dark:bg-stone-500/10 border border-stone-500/10 rounded-xl space-y-3"
            >
              <n-checkbox-group v-model:value="computedSelectedTagIds">
                <div class="flex flex-wrap gap-2.5">
                  <n-checkbox 
                    v-for="tag in allTags" 
                    :key="tag.id" 
                    :value="tag.id"
                    class="archive-checkbox text-xs"
                  >
                    <span 
                      class="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                      :style="{ backgroundColor: tag.color }"
                    >
                      {{ tag.name }}
                    </span>
                  </n-checkbox>
                </div>
              </n-checkbox-group>
              <div class="flex justify-end">
                <n-button 
                  size="tiny" 
                  type="primary" 
                  :loading="savingTags"
                  @click="emit('bind-tags')"
                >
                  确认绑定
                </n-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 历史博主追加的回复列表 (极简线性时间轴卡片设计) -->
        <div v-if="currentFeedback.replies && currentFeedback.replies.length" class="space-y-3 pt-2">
          <div class="text-[10px] font-bold text-stone-500/55 tracking-wider uppercase pl-1 select-none">
            博主追加回复历史 ({{ currentFeedback.replies.length }})
          </div>
          
          <div 
            v-for="rep in currentFeedback.replies" 
            :key="rep.id" 
            class="relative border border-[#E7E2D5] dark:border-[#2D302E] rounded-xl bg-stone-500/4 dark:bg-white/4 p-4 pl-5 shadow-sm hover:shadow transition-all duration-300 select-text"
          >
            <!-- 左侧高亮馆长印记 Accent 竖条线 -->
            <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-(--archive-accent) rounded-l-xl"></div>
            
            <div class="flex items-center justify-between text-[11px] mb-2 select-none">
              <span class="font-bold text-(--archive-accent) flex items-center gap-1.5">
                <span class="i-mdi-shield-crown-outline text-xs"></span>
                馆长管理员答复
              </span>
              <span class="font-mono text-[9px] text-stone-500/50">
                {{ formatFullTime(rep.createdAt) }}
              </span>
            </div>
            <div class="text-xs text-[#2F2F2D] dark:text-[#E2E2E0] leading-relaxed font-sans pl-1">
              {{ rep.content }}
            </div>
          </div>
        </div>

        <!-- 建议已采纳的展示 (平整卡片) -->
        <div 
          v-if="currentFeedback.status === 'adopted'" 
          class="border border-[#CBE5D0] dark:border-[#253D2A] bg-emerald-500/5 dark:bg-[#1B231D] rounded-xl p-4 pl-5 relative shadow-sm select-text"
        >
          <!-- 左侧高亮采纳竖线 -->
          <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 rounded-l-xl"></div>
          
          <div class="flex items-center justify-between text-[11px] mb-2 select-none">
            <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span class="i-mdi-lightbulb-on-outline text-xs animate-bounce"></span>
              该来信建议已在前台采纳归档
            </span>
          </div>
          <div v-if="currentFeedback.adoptedNote" class="text-xs text-[#2F2F2D] dark:text-[#E2E2E0] leading-relaxed font-sans pl-1">
            <strong class="text-(--archive-text)">博主采纳附言：</strong>{{ currentFeedback.adoptedNote }}
          </div>
        </div>
      </div>

      <!-- 底部工作流操作与追加回复输入面板 (莫兰迪灰调控制面板) -->
      <div class="border border-(--archive-border) bg-white/50 dark:bg-stone-900/40 backdrop-blur-md p-4 rounded-2xl space-y-4 shrink-0 select-none mt-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- 审核工作流变更 -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-stone-500/70 font-bold">审核状态:</span>
            <n-switch 
              :value="currentFeedback.status !== 'pending' && currentFeedback.status !== 'rejected'"
              @update:value="emit('toggle-public', currentFeedback, $event)"
              size="small"
              class="archive-switch"
            />
            <span class="text-xs font-bold" :class="currentFeedback.status !== 'pending' && currentFeedback.status !== 'rejected' ? 'text-(--archive-success)' : 'text-stone-500'">
              {{ currentFeedback.status !== 'pending' && currentFeedback.status !== 'rejected' ? '公开展示中' : '审核隐藏中' }}
            </span>
          </div>

          <!-- 工作流流转按钮 (一体化莫兰迪按键排版) -->
          <div class="flex items-center gap-2">
            <n-button 
              v-if="currentFeedback.status !== 'rejected'"
              size="small" 
              type="error"
              secondary
              class="!rounded-xl"
              @click="emit('action', 'rejected')"
            >
              封禁隐藏
            </n-button>
            <n-button 
              v-if="currentFeedback.status === 'pending' || currentFeedback.status === 'rejected'"
              size="small" 
              type="success"
              secondary
              class="!rounded-xl"
              @click="emit('action', 'approved')"
            >
              审核通过
            </n-button>
            <n-button 
              v-if="currentFeedback.status === 'approved' || currentFeedback.status === 'adopted'"
              size="small" 
              type="warning"
              secondary
              class="!rounded-xl"
              @click="showAdoptPanel = !showAdoptPanel"
            >
              采纳归档
            </n-button>
            <n-button 
              v-if="currentFeedback.status === 'approved' || currentFeedback.status === 'adopted'"
              size="small" 
              type="primary"
              secondary
              class="!rounded-xl"
              @click="emit('action', 'done')"
            >
              标记已完成
            </n-button>
          </div>
        </div>

        <!-- 采纳归档面板 -->
        <div 
          v-if="showAdoptPanel" 
          class="p-3 border border-stone-500/10 rounded-xl bg-stone-500/5 space-y-3"
        >
          <div class="text-xs font-bold text-(--archive-text) flex items-center gap-1">
            <span class="i-mdi-lightbulb-on-outline tone-warning"></span>
            采纳反馈归档记录
          </div>
          <n-input 
            :value="adoptNote" 
            @update:value="emit('update:adoptNote', $event)"
            type="textarea" 
            :rows="2" 
            placeholder="写下关于采纳该建议的实施备忘或致谢语..."
            class="archive-input"
          />
          <div class="flex justify-end gap-2">
            <n-button size="tiny" secondary class="!rounded-lg" @click="showAdoptPanel = false">取消</n-button>
            <n-button 
              size="tiny" 
              type="primary" 
              :loading="submittingAdopt"
              class="!rounded-lg"
              @click="emit('adopt')"
            >
              确认采纳
            </n-button>
          </div>
        </div>

        <!-- 追加博主回复输入板 -->
        <div class="space-y-2">
          <div class="text-xs font-bold text-stone-500/70 flex items-center gap-1.5">
            <span class="i-mdi-reply tone-accent"></span>
            追加博主正式答复
          </div>
          <div class="flex gap-3 items-end">
            <n-input 
              :value="replyContent" 
              @update:value="emit('update:replyContent', $event)"
              type="textarea" 
              :rows="2" 
              placeholder="写下作为博主的官方答复，提交后将永久展示在前台来信底部..."
              class="archive-input flex-1"
            />
            <n-button 
              type="primary" 
              :loading="submittingReply"
              class="h-[54px] px-5 !rounded-xl"
              @click="emit('reply')"
            >
              提交回复
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NSwitch, NInput, NCheckboxGroup, NCheckbox } from 'naive-ui'
import type { Feedback, FeedbackTag } from '@/interface/love'

const props = defineProps<{
  currentFeedback: Feedback | null
  allTags: FeedbackTag[]
  selectedTagIds: number[]
  replyContent: string
  adoptNote: string
  savingTags: boolean
  submittingReply: boolean
  submittingAdopt: boolean
  allTypes: any[]
}>()

const emit = defineEmits<{
  (e: 'update:selectedTagIds', val: number[]): void
  (e: 'update:replyContent', val: string): void
  (e: 'update:adoptNote', val: string): void
  (e: 'toggle-public', fb: Feedback, val: boolean): void
  (e: 'bind-tags'): void
  (e: 'reply'): void
  (e: 'adopt'): void
  (e: 'action', status: string): void
}>()

const showTagSelector = ref(false)
const showAdoptPanel = ref(false)

const computedSelectedTagIds = computed({
  get: () => props.selectedTagIds,
  set: (val) => emit('update:selectedTagIds', val)
})

const getCategoryLabel = (category: string) => {
  const match = props.allTypes.find(t => t.value === category)
  if (match) {
    // 配合图标生成
    const emojiMap: Record<string, string> = {
      comment: '💬',
      suggestion: '💡',
      bug: '🐛',
      praise: '✨',
      idea: '🔥',
      complaint: '🍃'
    }
    const emoji = emojiMap[category] || '💬'
    return `${emoji} ${match.label}`
  }
  return '💬 普通来信'
}

const getCategoryClass = (category: string) => {
  const match = props.allTypes.find(t => t.value === category)
  const color = match?.color || 'sky'
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    stone: 'bg-stone-500/10 text-stone-600 dark:text-stone-400'
  }
  return colorMap[color] || 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
}

const formatFullTime = (timeStr?: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.feedback-reader-paper {
  perspective: 1000px;
  transform-style: preserve-3d;
}
</style>
