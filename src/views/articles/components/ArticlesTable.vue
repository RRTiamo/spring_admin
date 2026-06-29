<template>
  <div class="grid gap-3">
    <article
      v-for="(blog, index) in paginatedBlogs"
      :key="blog.id"
      class="article-row archive-card overflow-hidden p-4 sm:p-5"
    >
      <div class="grid gap-4 md:grid-cols-[132px_1fr_auto] md:items-center">
        <div class="relative h-36 overflow-hidden rounded-[20px] md:h-28">
          <img :src="blog.cover || getArticleImage(index)" :alt="`${blog.title} 封面`" class="life-image" />
          <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(23,33,27,0.28))]"></div>
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 text-xs tone-faint">
            <span>{{ formatDate(blog.createTime) }}</span>
            <span class="h-1 w-1 rounded-full bg-(--archive-faint)"></span>
            <span class="metric-number">{{ blog.views }} 次阅读</span>
            <span v-if="blog.category" class="h-1 w-1 rounded-full bg-(--archive-faint)"></span>
            <span v-if="blog.category" class="font-700 tone-accent uppercase tracking-wider text-[10px]">{{ blog.category }}</span>
            <span v-if="blog.visibility && blog.visibility !== 'public'" class="h-1 w-1 rounded-full bg-(--archive-faint)"></span>
            <span v-if="blog.visibility && blog.visibility !== 'public'" class="text-[9px] px-1 bg-amber-500/10 text-amber-600 rounded border border-amber-500/20 uppercase tracking-widest font-700">{{ blog.visibility }}</span>
          </div>
          <h3 class="m-0 mt-2 text-lg font-760 leading-snug tracking-[-0.02em] text-(--archive-text)">
            {{ blog.title }}
          </h3>
          <p class="m-0 mt-2 line-clamp-2 max-w-3xl text-sm leading-6 tone-muted">
            {{ blog.summary }}
          </p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="tag in splitTags(blog.tags)"
              :key="tag"
              class="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-650"
              :style="tagStyle(blog.tags)"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-(--archive-border) pt-4 md:border-t-0 md:pt-0">
          <n-button size="small" secondary @click="emit('edit', blog)">
            <template #icon>
              <span class="i-mdi-square-edit-outline"></span>
            </template>
            编辑
          </n-button>
          <n-button size="small" secondary type="error" @click="emit('delete', blog.id)">
            <template #icon>
              <span class="i-mdi-delete-outline"></span>
            </template>
            删除
          </n-button>
        </div>
      </div>
    </article>

    <!-- 分页组件 -->
    <div class="archive-card p-4 flex items-center justify-between flex-wrap gap-3 mt-2">
      <div class="flex items-center gap-2 text-xs tone-muted">
        共 <span class="font-700 text-(--archive-text)">{{ filteredBlogs.length }}</span> 篇文章
      </div>
      <n-pagination
        v-model:page="page"
        v-model:page-size="size"
        :item-count="filteredBlogs.length"
        :page-sizes="[5, 10, 15]"
        show-size-picker
        size="medium"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NPagination } from 'naive-ui'
import type { Blog } from '@/interface/love'

const props = defineProps<{
  paginatedBlogs: Blog[]
  filteredBlogs: Blog[]
  currentPage: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'edit', blog: Blog): void
  (e: 'delete', id: number): void
}>()

const page = computed({
  get: () => props.currentPage,
  set: (val) => emit('update:currentPage', val)
})

const size = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val)
})

const getArticleImage = (index: number) => {
  const images = [
    '/assets/writing-tokyo.png',
    '/assets/writing-sea.png',
    '/assets/writing-train.png',
    '/assets/writing-coffee.png'
  ]
  return images[index % images.length]
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').split('.')[0].slice(0, 16)
}

const splitTags = (tagsStr?: string) => {
  if (!tagsStr) return []
  return tagsStr.split(/[,，]/).map(t => t.trim()).filter(Boolean)
}

const tagStyle = (tags?: string) => {
  let hash = 0
  const str = tags || 'tag'
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return {
    backgroundColor: `hsla(${hue}, 40%, 94%, 0.4)`,
    borderColor: `hsla(${hue}, 30%, 80%, 0.5)`,
    color: `hsl(${hue}, 45%, 35%)`
  }
}
</script>
