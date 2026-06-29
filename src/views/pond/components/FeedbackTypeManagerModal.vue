<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="反馈类型配置中心"
    class="w-[90vw] max-w-[550px]"
  >
    <div class="space-y-5 text-left select-none">
      <!-- 反馈类型编辑表单 -->
      <div class="border border-(--archive-border) rounded-xl p-4 bg-white/10 dark:bg-white/5 space-y-3">
        <div class="text-xs font-bold text-(--archive-accent)">
          {{ editingTypeId ? '编辑反馈类型' : '新建反馈类型分类' }}
        </div>
        <div class="grid grid-cols-2 gap-3">
          <n-form-item label="类型名称" required :show-feedback="false">
            <n-input v-model:value="form.label" placeholder="例如: 建议反馈" />
          </n-form-item>
          <n-form-item label="标识值 (小写英文)" required :show-feedback="false">
            <n-input v-model:value="form.value" placeholder="例如: suggestion" :disabled="!!editingTypeId" />
          </n-form-item>
          <n-form-item label="图标 (Icon)" :show-feedback="false">
            <n-select v-model:value="form.icon" :options="iconOptions" placeholder="请选择分类图标" />
          </n-form-item>
          <n-form-item label="配色样式" :show-feedback="false">
            <n-select v-model:value="form.color" :options="colorOptions" />
          </n-form-item>
          <n-form-item label="排序顺序" :show-feedback="false" class="col-span-2">
            <n-input-number v-model:value="form.sortOrder" :min="0" class="w-full" />
          </n-form-item>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <n-button v-if="editingTypeId" size="small" @click="cancelEdit">取消修改</n-button>
          <n-button size="small" type="primary" :loading="submitting" @click="emit('save-type')">
            {{ editingTypeId ? '确认更新' : '新建分类' }}
          </n-button>
        </div>
      </div>

      <!-- 现存类型列表 -->
      <div class="space-y-2">
        <div class="text-xs font-bold tone-muted">现存类型列表：</div>
        <div v-if="allTypes.length === 0" class="py-6 text-center text-xs italic tone-muted">
          暂无可用分类类型，请在上方创建。
        </div>
        <div v-else class="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          <div
            v-for="item in allTypes"
            :key="item.id"
            class="flex items-center justify-between p-3 rounded-xl border bg-black/5 dark:bg-white/5 text-xs font-bold"
            :style="{ borderColor: `var(--archive-border)` }"
          >
            <div class="flex items-center gap-3">
              <span :class="[item.icon || 'i-mdi-tag', `text-base text-${item.color}-500`]"></span>
              <div class="flex flex-col text-left">
                <span class="text-xs font-bold">{{ item.label }}</span>
                <span class="text-[10px] font-mono tone-muted">value: {{ item.value }} | 排序: {{ item.sortOrder }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 pl-3 border-l border-(--archive-border)/45">
              <span class="i-mdi-pencil text-xs tone-muted cursor-pointer hover:text-(--archive-accent)" @click="emit('edit-type', item)"></span>
              <span class="i-mdi-trash-can-outline text-xs text-red-500 cursor-pointer hover:text-red-700" @click="item.id !== undefined && emit('delete-type', item.id)"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NFormItem, NInput, NInputNumber, NSelect, NButton } from 'naive-ui'

export interface FeedbackType {
  id?: number
  value: string
  label: string
  icon?: string
  color?: string
  sortOrder?: number
}

const props = defineProps<{
  showTypeManagerModal: boolean
  allTypes: FeedbackType[]
  typeForm: FeedbackType
  submitting: boolean
  editingTypeId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:showTypeManagerModal', visible: boolean): void
  (e: 'update:typeForm', form: FeedbackType): void
  (e: 'save-type'): void
  (e: 'edit-type', type: FeedbackType): void
  (e: 'delete-type', id: number): void
  (e: 'cancel-edit'): void
}>()

const visible = computed({
  get: () => props.showTypeManagerModal,
  set: (val) => emit('update:showTypeManagerModal', val)
})

const form = computed({
  get: () => props.typeForm,
  set: (val) => emit('update:typeForm', val)
})

const iconOptions = [
  { label: '💬 讨论交流 (comment)', value: 'i-mdi-comment-text-outline' },
  { label: '💡 改进建议 (suggestion)', value: 'i-mdi-lightbulb-outline' },
  { label: '🐛 Bug反馈 (bug)', value: 'i-mdi-bug-outline' },
  { label: '💖 夸夸作者 (praise)', value: 'i-mdi-heart-outline' },
  { label: '⚡ 灵感火花 (idea)', value: 'i-mdi-flash-outline' },
  { label: '🍃 吐槽倾听 (complaint)', value: 'i-mdi-chat-processing-outline' },
  { label: '✉️ 普通来信 (email)', value: 'i-mdi-email-outline' },
  { label: '🏷️ 默认标签 (tag)', value: 'i-mdi-tag-outline' }
]

const colorOptions = [
  { label: '翡翠绿 (Emerald)', value: 'emerald' },
  { label: '天空蓝 (Sky)', value: 'sky' },
  { label: '琥珀黄 (Amber)', value: 'amber' },
  { label: '玫瑰红 (Rose)', value: 'rose' },
  { label: '珊瑚粉 (Pink)', value: 'pink' },
  { label: '锌钛灰 (Stone)', value: 'stone' }
]

const cancelEdit = () => {
  emit('cancel-edit')
}
</script>
