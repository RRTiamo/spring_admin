<template>
  <div class="bg-(--archive-bg-card)/50 border border-(--archive-border) rounded-3xl p-5 shadow-sm backdrop-blur-md">
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-(--archive-border)/40">
      <div>
        <h2 class="text-lg font-750 m-0">档案分类目录</h2>
        <p class="text-xs tone-muted m-0 mt-1">分门别类，理清思绪。点击右侧的操作可增减子分类或修改参数。</p>
      </div>
      <!-- 刷新按钮 -->
      <button 
        class="icon-button h-8 w-8 flex items-center justify-center shrink-0"
        @click="emit('refresh')" 
        :disabled="loading"
        aria-label="刷新分类"
      >
        <span class="i-mdi-refresh text-base" :class="{ 'animate-spin': loading }"></span>
      </button>
    </div>

    <div v-if="loading && renderList.length === 0" class="py-12 flex flex-col items-center justify-center">
      <span class="i-mdi-loading text-3xl animate-spin tone-accent"></span>
      <span class="text-xs tone-muted mt-3">正在拉取分类结构...</span>
    </div>

    <div v-else-if="renderList.length === 0" class="py-12 text-center">
      <span class="i-mdi-folder-open-outline text-4xl tone-muted"></span>
      <p class="text-sm tone-muted mt-3">暂无任何分类，在右侧创建你的第一个分类吧</p>
    </div>

    <div v-else class="category-tree-container overflow-hidden rounded-2xl border border-(--archive-border)/30 bg-white/10 dark:bg-black/5 divide-y divide-(--archive-border)/20">
      <div 
        v-for="item in renderList" 
        :key="item.id"
        class="category-node-row flex items-center justify-between py-3.5 px-4 transition-all duration-300 hover:bg-white/40 dark:hover:bg-white/5"
        :style="{ paddingLeft: `${item.depth * 28 + 16}px` }"
      >
        <div class="flex items-center gap-3 min-w-0">
          <!-- 缩进引导线 -->
          <span 
            v-if="item.depth > 0" 
            class="w-4 h-[1px] bg-(--archive-border)/60 relative -left-1 shrink-0"
          ></span>

          <!-- 折叠/展开指示器 (如果该节点有子节点才显示) -->
          <button 
            v-if="item.hasChildren"
            @click="toggleExpand(item.id)"
            class="w-5 h-5 flex items-center justify-center rounded hover:bg-white/60 dark:hover:bg-white/10 transition-colors shrink-0"
            type="button"
          >
            <span 
              :class="isExpanded(item.id) ? 'i-mdi-chevron-down' : 'i-mdi-chevron-right'" 
              class="text-sm"
            ></span>
          </button>
          <span v-else class="w-5 shrink-0"></span>

          <!-- 选定图标或智能匹配图标 -->
          <span 
            :class="item.icon || getCategoryIcon(item.name, item.slug)" 
            class="text-base shrink-0 transition-transform duration-300"
          ></span>

          <!-- 分类名称和Slug -->
          <div class="flex items-baseline gap-2 min-w-0">
            <span class="text-sm font-700 truncate text-(--archive-text)">{{ item.name }}</span>
            <span class="text-[10px] tone-muted uppercase tracking-wider font-mono truncate">/ {{ item.slug }}</span>
          </div>
        </div>

        <!-- 操作按钮组 -->
        <div class="flex items-center gap-1.5 opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <!-- 添加子分类 -->
          <n-tooltip v-if="item.depth < 1" trigger="hover" placement="top">
            <template #trigger>
              <button 
                @click="emit('add-child', item)"
                class="action-btn-sm"
                aria-label="添加子分类"
              >
                <span class="i-mdi-plus text-xs"></span>
              </button>
            </template>
            添加子分类
          </n-tooltip>

          <!-- 编辑分类 -->
          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <button 
                @click="emit('start-edit', item)"
                class="action-btn-sm"
                aria-label="编辑分类"
              >
                <span class="i-mdi-pencil-outline text-xs"></span>
              </button>
            </template>
            修改参数
          </n-tooltip>

          <!-- 删除分类 -->
          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <button 
                @click="emit('delete', item)"
                class="action-btn-sm hover:text-(--archive-danger)"
                aria-label="删除分类"
              >
                <span class="i-mdi-trash-can-outline text-xs"></span>
              </button>
            </template>
            删除分类
          </n-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NTooltip } from 'naive-ui'

interface RenderItem {
  id: number
  name: string
  slug: string
  parentId: number
  icon: string
  depth: number
  hasChildren: boolean
}

const props = defineProps<{
  loading: boolean
  renderList: RenderItem[]
  expandedIds: Set<number>
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'add-child', item: RenderItem): void
  (e: 'start-edit', item: RenderItem): void
  (e: 'delete', item: RenderItem): void
  (e: 'update:expandedIds', ids: Set<number>): void
}>()

const toggleExpand = (id: number) => {
  const newIds = new Set(props.expandedIds)
  if (newIds.has(id)) {
    newIds.delete(id)
  } else {
    newIds.add(id)
  }
  emit('update:expandedIds', newIds)
}

const isExpanded = (id: number) => props.expandedIds.has(id)

const getCategoryIcon = (name: string, slug: string) => {
  const text = (name + slug).toLowerCase()
  if (text.includes('love') || text.includes('恋') || text.includes('爱')) return 'i-mdi-heart-outline text-(--archive-danger)'
  if (text.includes('code') || text.includes('码') || text.includes('tech') || text.includes('后端') || text.includes('vue') || text.includes('java')) return 'i-mdi-code-tags text-(--archive-info)'
  if (text.includes('thoughts') || text.includes('思') || text.includes('想') || text.includes('感')) return 'i-mdi-head-lightbulb-outline text-(--archive-warning)'
  if (text.includes('travel') || text.includes('旅') || text.includes('行')) return 'i-mdi-wallet-travel text-teal-500'
  if (text.includes('photo') || text.includes('摄') || text.includes('影') || text.includes('画') || text.includes('图')) return 'i-mdi-camera-outline text-amber-500'
  if (text.includes('daily') || text.includes('常') || text.includes('碎') || text.includes('记') || text.includes('diary')) return 'i-mdi-notebook-outline text-indigo-500'
  return 'i-mdi-folder-outline tone-muted'
}
</script>

<style scoped>
.action-btn-sm {
  @apply h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/70 dark:hover:bg-white/10 text-(--archive-text) transition-all shrink-0;
}
.category-node-row {
  @apply group;
}
</style>
