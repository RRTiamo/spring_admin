<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="标签库配置中心"
    class="w-[90vw] max-w-[500px]"
  >
    <div class="space-y-5 text-left">
      <!-- 标签编辑表单 -->
      <div class="border border-(--archive-border) rounded-xl p-4 bg-white/10 dark:bg-white/5 space-y-3">
        <div class="text-xs font-bold text-(--archive-accent) select-none">
          {{ editingTagId ? '编辑当前标签' : '新建反馈分类标签' }}
        </div>
        <div class="grid grid-cols-2 gap-3">
          <n-form-item label="标签名称" required :show-feedback="false">
            <n-input v-model:value="form.name" placeholder="例如: UI界面" />
          </n-form-item>
          <n-form-item label="色彩配置 (Hex)" required :show-feedback="false">
            <div class="flex gap-2 w-full">
              <n-color-picker v-model:value="form.color" :show-alpha="false" class="w-10 shrink-0 animate-fade-in" />
              <n-input v-model:value="form.color" placeholder="#3b82f6" class="flex-1 font-mono" />
            </div>
          </n-form-item>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <n-button v-if="editingTagId" size="small" @click="cancelEditTag">取消修改</n-button>
          <n-button size="small" type="primary" :loading="submittingTag" @click="emit('save-tag')">
            {{ editingTagId ? '确认更新' : '新建标签' }}
          </n-button>
        </div>
      </div>

      <!-- 现存标签池 -->
      <div class="space-y-2">
        <div class="text-xs font-bold tone-muted select-none">现存标签池：</div>
        <div v-if="allTags.length === 0" class="py-6 text-center text-xs italic tone-muted">
          暂无可用标签，请在上方创建。
        </div>
        <div v-else class="flex flex-wrap gap-2.5 max-h-[220px] overflow-y-auto pr-1">
          <div
            v-for="tag in allTags"
            :key="tag.id"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border bg-black/5 dark:bg-white/5 text-xs font-bold"
            :style="{ borderColor: `${tag.color}30` }"
          >
            <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: tag.color }"></span>
            <span :style="{ color: tag.color }">{{ tag.name }}</span>
            <div class="flex items-center gap-1 ml-1.5 pl-1.5 border-l border-(--archive-border)/45">
              <span class="i-mdi-pencil text-xs tone-muted cursor-pointer hover:text-(--archive-accent)" @click="emit('edit-tag', tag)"></span>
              <span class="i-mdi-trash-can-outline text-xs text-red-500 cursor-pointer hover:text-red-700" @click="emit('delete-tag', tag.id)"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NFormItem, NInput, NColorPicker, NButton } from 'naive-ui'
import type { FeedbackTag } from '@/interface/love'

const props = defineProps<{
  showTagManagerModal: boolean
  allTags: FeedbackTag[]
  tagForm: { name: string, color: string }
  submittingTag: boolean
  editingTagId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:showTagManagerModal', visible: boolean): void
  (e: 'update:tagForm', form: { name: string, color: string }): void
  (e: 'save-tag'): void
  (e: 'edit-tag', tag: FeedbackTag): void
  (e: 'delete-tag', id: number): void
  (e: 'cancel-edit'): void
}>()

const visible = computed({
  get: () => props.showTagManagerModal,
  set: (val) => emit('update:showTagManagerModal', val)
})

const form = computed({
  get: () => props.tagForm,
  set: (val) => emit('update:tagForm', val)
})

const cancelEditTag = () => {
  emit('cancel-edit')
}
</script>
