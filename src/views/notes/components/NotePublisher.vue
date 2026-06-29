<template>
  <div class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-5 shadow-sm space-y-4">
    <h4 class="text-xs font-bold flex items-center gap-1.5 text-(--archive-text) select-none">
      <span class="i-mdi-pencil-plus-outline text-(--archive-accent) text-base"></span>
      <span>记录瞬时灵感 (Scratch Memos)</span>
    </h4>
    <div class="flex flex-col gap-3">
      <n-input
        v-model:value="content"
        type="textarea"
        :rows="3"
        placeholder="今天有什么日常感悟或摄影闪念？写在这里..."
        class="archive-input"
      />
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div class="flex items-center gap-2">
          <span class="text-xs tone-muted select-none">当下心情：</span>
          <n-select
            v-model:value="mood"
            :options="moodOptions"
            class="archive-select min-w-[140px]"
            size="small"
          />
        </div>
        <button
          class="px-5 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          :disabled="publishing"
          @click="emit('publish')"
        >
          <span v-if="publishing" class="i-mdi-loading animate-spin"></span>
          <span v-else class="i-mdi-send-outline"></span>
          <span>贴在碎碎念墙上</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NInput, NSelect } from 'naive-ui'

const props = defineProps<{
  newNoteContent: string
  newNoteMood: string
  publishing: boolean
  moodOptions: any[]
}>()

const emit = defineEmits<{
  (e: 'update:newNoteContent', val: string): void
  (e: 'update:newNoteMood', val: string): void
  (e: 'publish'): void
}>()

const content = computed({
  get: () => props.newNoteContent,
  set: (val) => emit('update:newNoteContent', val)
})

const mood = computed({
  get: () => props.newNoteMood,
  set: (val) => emit('update:newNoteMood', val)
})
</script>
