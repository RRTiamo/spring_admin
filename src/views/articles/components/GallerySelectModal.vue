<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="从图册中选择封面"
    class="w-[90vw] max-w-[640px]"
  >
    <div v-if="galleryLoading" class="flex justify-center items-center py-12">
      <n-spin size="large" />
    </div>

    <div v-else-if="galleryList.length === 0" class="py-12 text-center">
      <span class="i-mdi-image-off-outline text-4xl tone-muted block mb-2"></span>
      <span class="text-xs tone-muted">图册中目前没有任何照片</span>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
      <div 
        v-for="photo in galleryList" 
        :key="photo.id"
        class="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-(--archive-accent)"
        @click="handleSelect(photo.src)"
      >
        <img :src="photo.src" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span class="text-xs text-white font-bold px-2 py-1 bg-black/60 rounded-lg">选择此图</span>
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-4 mt-2 border-t border-(--archive-border)/50">
      <n-button size="small" round @click="visible = false">取消</n-button>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NSpin, NButton } from 'naive-ui'

const props = defineProps<{
  showGallerySelectModal: boolean
  galleryList: any[]
  galleryLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:showGallerySelectModal', visible: boolean): void
  (e: 'select', src: string): void
}>()

const visible = computed({
  get: () => props.showGallerySelectModal,
  set: (val) => emit('update:showGallerySelectModal', val)
})

const handleSelect = (src: string) => {
  emit('select', src)
  visible.value = false
}
</script>
