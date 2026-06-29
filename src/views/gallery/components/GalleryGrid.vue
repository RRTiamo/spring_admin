<template>
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="photo in paginatedPhotos"
        :key="photo.id"
        class="photo-card archive-card overflow-hidden flex flex-col justify-between"
      >
        <!-- 预览图区 -->
        <div class="relative h-48 w-full overflow-hidden bg-black/5 flex items-center justify-center">
          <video 
            v-if="photo.type === 'video'" 
            :src="photo.src" 
            muted 
            playsinline
            class="w-full h-full object-cover"
          />
          <img 
            v-else 
            :src="photo.src" 
            :alt="photo.title" 
            class="w-full h-full object-cover" 
          />
          <span 
            class="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded bg-black/60 text-white font-700 tracking-widest uppercase"
          >
            {{ photo.type }}
          </span>
        </div>

        <!-- 内容信息 -->
        <div class="p-4 flex-1">
          <div class="flex items-center justify-between text-xs tone-faint mb-1.5">
            <span>{{ formatDate(photo.date) }}</span>
            <span>{{ photo.location }}</span>
          </div>
          <h3 class="m-0 text-base font-750 text-(--archive-text) truncate text-left">
            {{ photo.title }}
          </h3>

          <div class="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-(--archive-text)/80 text-left">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="i-mdi-camera text-sm shrink-0 tone-faint"></span>
              <span class="truncate">{{ photo.camera || '未知相机' }}</span>
            </div>
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="i-mdi-adjust text-sm shrink-0 tone-faint"></span>
              <span class="truncate">{{ photo.settings || '自动' }}</span>
            </div>
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="i-mdi-film text-sm shrink-0 tone-faint"></span>
              <span class="truncate">{{ photo.filmStock || '物理感光' }}</span>
            </div>
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="i-mdi-camera-iris text-sm shrink-0 tone-faint"></span>
              <span class="truncate">{{ photo.lens || '默认镜头' }}</span>
            </div>
          </div>

          <p class="m-0 mt-3 text-xs tone-muted line-clamp-2 leading-relaxed text-left">
            {{ photo.description }}
          </p>
        </div>

        <!-- 操作条 -->
        <div class="border-t border-(--archive-border)/40 p-3 bg-white/10 dark:bg-black/5 flex items-center justify-end gap-2 shrink-0">
          <n-button size="small" secondary @click="emit('edit', photo)">
            <template #icon>
              <span class="i-mdi-square-edit-outline"></span>
            </template>
            编辑
          </n-button>
          <n-button size="small" secondary type="error" @click="emit('delete', photo.id)">
            <template #icon>
              <span class="i-mdi-delete-outline"></span>
            </template>
            删除
          </n-button>
        </div>
      </div>
    </div>

    <!-- 分页组件 -->
    <div class="archive-card p-4 flex items-center justify-between flex-wrap gap-3 mt-2">
      <div class="flex items-center gap-2 text-xs tone-muted">
        共 <span class="font-700 text-(--archive-text)">{{ filteredPhotos.length }}</span> 张影像
      </div>
      <n-pagination
        v-model:page="page"
        v-model:page-size="size"
        :item-count="filteredPhotos.length"
        :page-sizes="[6, 12, 18, 24]"
        show-size-picker
        size="medium"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NPagination } from 'naive-ui'
import type { GalleryPhoto } from '@/interface/love'

const props = defineProps<{
  paginatedPhotos: GalleryPhoto[]
  filteredPhotos: GalleryPhoto[]
  currentPage: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'edit', photo: GalleryPhoto): void
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

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').split('.')[0].slice(0, 10)
}
</script>
