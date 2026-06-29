<template>
  <section class="archive-card p-4 sm:p-5">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <n-input
          v-model:value="query"
          clearable
          placeholder="搜索文章标题、标签或分类"
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

      <n-button type="primary" class="w-full sm:w-auto" @click="emit('create')">
        <template #icon>
          <span class="i-mdi-plus"></span>
        </template>
        新建文章
      </n-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NInput, NButton } from 'naive-ui'

const props = defineProps<{
  searchQuery: string
  statusColor: string
  statusIcon: string
  statusText: string
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'create'): void
}>()

const query = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val)
})
</script>
