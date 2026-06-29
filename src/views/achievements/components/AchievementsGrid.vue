<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="achievement in paginatedAchievements"
        :key="achievement.id"
        class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-5 shadow-sm flex flex-col justify-between min-h-[220px] hover:shadow-md hover:border-(--archive-accent)/30 transition-all duration-300 relative group"
      >
        <div class="space-y-4">
          <!-- 头部元数据 -->
          <div class="flex items-center justify-between">
            <span :class="[getCategoryStyle(achievement.category), 'px-2 py-0.5 rounded-lg font-bold text-[10px] select-none']">
              {{ translateCategory(achievement.category) }}
            </span>
            <span :class="[getLevelStyle(achievement.level), 'px-2 py-0.5 rounded-lg font-bold text-[10px] select-none']">
              {{ translateLevel(achievement.level) }}
            </span>
          </div>

          <!-- 图标与标题 -->
          <div class="flex items-start gap-3">
            <span :class="[getIconClass(achievement.icon), 'text-3xl text-(--archive-accent) shrink-0 mt-0.5']"></span>
            <div class="min-w-0 text-left">
              <h4 class="text-sm font-bold text-(--archive-text) leading-snug truncate">
                {{ achievement.title }}
              </h4>
              <span class="text-[10px] font-mono tone-muted">
                达成于：{{ formatDate(achievement.achieveDate) }}
              </span>
            </div>
          </div>

          <!-- 配图预览 (如果有) -->
          <div v-if="achievement.cover" class="relative h-28 w-full overflow-hidden rounded-xl bg-black/5 flex items-center justify-center border border-(--archive-border)/50">
            <img :src="achievement.cover" :alt="achievement.title" class="w-full h-full object-cover" />
          </div>

          <!-- 故事描述 -->
          <p class="text-xs leading-relaxed tone-muted text-left line-clamp-3">
            {{ achievement.description }}
          </p>
        </div>

        <!-- 底部操作按钮 -->
        <div class="mt-4 pt-3 border-t border-(--archive-border)/50 flex justify-end gap-2 text-xs">
          <button
            @click="emit('edit', achievement)"
            class="px-2.5 py-1 text-[11px] tone-accent border border-(--archive-accent)/15 hover:bg-(--archive-accent)/5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            <span class="i-mdi-square-edit-outline"></span>
            <span>编辑</span>
          </button>
          <button
            @click="emit('delete', achievement.id)"
            class="px-2.5 py-1 text-[11px] text-red-500 hover:text-red-700 font-bold border border-red-500/15 hover:bg-red-500/5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            <span class="i-mdi-trash-can-outline"></span>
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Achievement, AchievementMeta } from '@/interface/love'

const props = defineProps<{
  paginatedAchievements: Achievement[]
  metas: AchievementMeta[]
}>()

const emit = defineEmits<{
  (e: 'edit', achievement: Achievement): void
  (e: 'delete', id: number): void
}>()

const translateCategory = (code: string) => {
  const meta = props.metas.find(m => m.type === 'category' && m.code === code)
  return meta ? meta.name : code
}

const translateLevel = (code: string) => {
  const meta = props.metas.find(m => m.type === 'level' && m.code === code)
  return meta ? meta.name : code
}

const getCategoryStyle = (code: string) => {
  if (code === 'milestone') {
    return 'bg-(--archive-accent)/10 text-(--archive-accent)'
  }
  return 'bg-black/5 dark:bg-white/10 tone-muted'
}



const getLevelStyle = (code: string) => {
  const map: Record<string, string> = {
    gold: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    silver: 'bg-slate-400/15 text-slate-500 dark:text-slate-400',
    bronze: 'bg-yellow-700/10 text-yellow-700 dark:text-yellow-600'
  }
  return map[code] || 'bg-black/5 dark:bg-white/10 tone-muted'
}

const getIconClass = (icon?: string) => {
  const map: Record<string, string> = {
    Trophy: 'i-mdi-trophy-outline',
    Medal: 'i-mdi-medal-outline',
    Certificate: 'i-mdi-certificate-outline',
    Camera: 'i-mdi-camera-outline',
    Book: 'i-mdi-book-open-page-variant-outline',
    Heart: 'i-mdi-heart-outline',
    Star: 'i-mdi-star-outline',
    Flag: 'i-mdi-flag-outline',
    Rocket: 'i-mdi-rocket-launch-outline'
  }
  return map[icon || ''] || 'i-mdi-trophy-outline'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 16)
}
</script>
