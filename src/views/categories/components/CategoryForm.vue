<template>
  <div class="bg-(--archive-bg-card)/50 border border-(--archive-border) rounded-3xl p-5 shadow-sm backdrop-blur-md">
    <div class="mb-4 pb-3 border-b border-(--archive-border)/40 flex items-center justify-between">
      <h2 class="text-lg font-750 m-0">{{ isEdit ? '修改分类参数' : '建立新分类' }}</h2>
      <button 
        v-if="isEdit" 
        @click="emit('cancel')"
        class="text-xs font-semibold px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
      >
        取消修改
      </button>
    </div>

    <n-form ref="formRef" :model="formModel" :rules="formRules" label-placement="top" class="space-y-4">
      <!-- 关系定位 -->
      <n-form-item v-if="!isEdit" label="所处层级关系" path="relationType">
        <n-radio-group v-model:value="formModel.relationType">
          <n-space>
            <n-radio value="top">顶级分类</n-radio>
            <n-radio value="existing">已有父分类子级</n-radio>
            <n-radio value="new">新建父分类子级</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      <!-- 已有父级选择 -->
      <n-form-item v-if="!isEdit && formModel.relationType === 'existing'" label="选择父级分类" path="parentId">
        <n-tree-select 
          v-model:value="formModel.parentId" 
          :options="parentCategoryOptions"
          placeholder="请选择上级节点"
          clearable
        />
      </n-form-item>

      <!-- 编辑时的父级节点展示 -->
      <n-form-item v-if="isEdit" label="上级分类 (不可直接修改层级)" path="parentId">
        <n-tree-select 
          v-model:value="formModel.parentId" 
          :options="parentCategoryOptions"
          placeholder="顶级节点"
          disabled
        />
      </n-form-item>

      <!-- 直接链式创建新父分类的输入 -->
      <div v-if="!isEdit && formModel.relationType === 'new'" class="bg-black/5 dark:bg-white/5 border border-(--archive-border)/30 rounded-2xl p-4 space-y-4 mb-2">
        <h4 class="text-xs font-bold m-0 tone-accent flex items-center gap-1">
          <span class="i-mdi-folder-plus-outline text-sm"></span>
          新父级分类信息
        </h4>
        <n-form-item label="父分类名称" path="newParentName" :show-require-mark="true">
          <n-input v-model:value="formModel.newParentName" placeholder="如：技术" @input="handleNewParentNameInput" />
        </n-form-item>
        <n-form-item label="父分类别名 (Slug)" path="newParentSlug" :show-require-mark="true">
          <n-input v-model:value="formModel.newParentSlug" placeholder="如：tech (英文短横线/下划线)" />
        </n-form-item>
        <div class="space-y-1.5">
          <label class="text-xs font-600">父分类图标匹配</label>
          <div class="flex items-center gap-2">
            <span :class="[formModel.newParentIcon, 'text-xl tone-accent border border-(--archive-border)/50 p-1.5 rounded-lg']"></span>
            <span class="text-xs tone-muted">将与当前分类保持相同的图标</span>
          </div>
        </div>
      </div>

      <!-- 当前分类信息 -->
      <n-form-item label="分类名称" path="name">
        <n-input v-model:value="formModel.name" placeholder="如：日常随笔" @input="handleNameInput" />
      </n-form-item>

      <n-form-item label="别名 (Slug)" path="slug">
        <n-input v-model:value="formModel.slug" placeholder="如：daily-notes (在URL中渲染，需唯一)" />
      </n-form-item>

      <div class="space-y-2">
        <label class="text-xs font-600 block">选择展示图标</label>
        <div class="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-black/5 dark:bg-white/5 border border-(--archive-border)/20 p-3 rounded-2xl max-h-[140px] overflow-y-auto">
          <button 
            v-for="icon in availableIcons" 
            :key="icon.class"
            type="button"
            class="flex items-center justify-center p-2 rounded-xl transition-all border text-lg hover:scale-105"
            :class="[
              formModel.icon === icon.class 
                ? 'bg-(--archive-accent)/15 border-(--archive-accent)/30 text-(--archive-accent) scale-105' 
                : 'border-transparent hover:bg-black/10 dark:hover:bg-white/10 tone-muted'
            ]"
            @click="selectIcon(icon.class)"
            :title="icon.name"
          >
            <span :class="icon.class"></span>
          </button>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-3 border-t border-(--archive-border)/40 mt-6">
        <button 
          v-if="isEdit" 
          type="button" 
          class="archive-btn bg-black/5 dark:bg-white/5 border border-(--archive-border)/50 tone-muted text-xs font-bold px-4 py-2 hover:bg-black/10"
          @click="emit('cancel')"
        >
          取消
        </button>
        <button 
          type="button" 
          class="archive-btn bg-(--archive-accent) text-white text-xs font-bold px-5 py-2 hover:bg-(--archive-accent)/90 flex items-center gap-1.5 disabled:opacity-50"
          :disabled="submitting"
          @click="handleSave"
        >
          <span v-if="submitting" class="i-mdi-loading text-base animate-spin"></span>
          <span v-else class="i-mdi-check-bold text-base"></span>
          <span>{{ isEdit ? '保存更新' : '添加分类' }}</span>
        </button>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NForm, NFormItem, NInput, NRadio, NRadioGroup, NSpace, NTreeSelect } from 'naive-ui'

const props = defineProps<{
  isEdit: boolean
  submitting: boolean
  formModel: any
  parentCategoryOptions: any[]
  availableIcons: any[]
  formRules: any
  slugDictionary: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
  (e: 'update:formModel', model: any): void
}>()

const formRef = ref<any>(null)
const isSlugManuallyEdited = ref(false)
const isParentSlugManuallyEdited = ref(false)

const selectIcon = (iconClass: string) => {
  const model = { ...props.formModel, icon: iconClass }
  if (model.relationType === 'new') {
    model.newParentIcon = iconClass
  }
  emit('update:formModel', model)
}

const translateToSlug = (value: string): string => {
  const cleanName = value.trim()
  if (props.slugDictionary[cleanName]) {
    return props.slugDictionary[cleanName]
  }

  const englishMatch = cleanName.match(/[a-zA-Z0-9\s-_]+/g)
  if (englishMatch) {
    return englishMatch.join('')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
  }
  return cleanName ? 'cat-' + Math.floor(Math.random() * 1000) : ''
}

const handleNameInput = (value: string) => {
  if (isSlugManuallyEdited.value) return
  const model = { ...props.formModel, slug: translateToSlug(value) }
  emit('update:formModel', model)
}

const handleNewParentNameInput = (value: string) => {
  if (isParentSlugManuallyEdited.value) return
  const model = { ...props.formModel, newParentSlug: translateToSlug(value) }
  emit('update:formModel', model)
}

watch(() => props.formModel.slug, (val) => {
  if (val && val !== '') {
    const autoSlug = translateToSlug(props.formModel.name)
    if (val !== autoSlug) {
      isSlugManuallyEdited.value = true
    }
  }
})

watch(() => props.formModel.newParentSlug, (val) => {
  if (val && val !== '') {
    const autoSlug = translateToSlug(props.formModel.newParentName)
    if (val !== autoSlug) {
      isParentSlugManuallyEdited.value = true
    }
  }
})

const handleSave = () => {
  formRef.value?.validate((errors: any) => {
    if (errors) return
    emit('save')
  })
}

defineExpose({
  restoreValidation: () => formRef.value?.restoreValidation()
})
</script>
