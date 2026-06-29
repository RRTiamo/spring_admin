<template>
  <div class="flex flex-col gap-4">
    <section class="archive-card p-4 sm:p-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <n-input
            v-model:value="searchCategoryQuery"
            clearable
            placeholder="搜索足迹类别名称或编码"
            class="w-full sm:max-w-[420px]"
          >
            <template #prefix>
              <span class="i-mdi-magnify tone-faint text-lg"></span>
            </template>
          </n-input>
        </div>
 
        <n-button type="primary" class="w-full sm:w-auto" @click="openCreateCategory">
          <template #icon>
            <span class="i-mdi-plus"></span>
          </template>
          新增类别
        </n-button>
      </div>
    </section>
 
    <!-- 类别数据表格 -->
    <section class="archive-card p-0 overflow-hidden">
      <n-table :bordered="false" :single-line="false" class="archive-table">
        <thead>
          <tr>
            <th width="80">ID</th>
            <th width="180">类别名称</th>
            <th width="150">类别编码</th>
            <th width="120">类别图标</th>
            <th>更新时间</th>
            <th width="180" class="text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in filteredFootprintCategories" :key="cat.id">
            <td>{{ cat.id }}</td>
            <td class="font-700 text-(--archive-text)">{{ cat.name }}</td>
            <td>
              <span class="px-2 py-0.5 rounded text-[10px] bg-black/10 dark:bg-white/10 font-mono">
                {{ cat.code }}
              </span>
            </td>
            <td>
              <span :class="['text-lg', 'mr-1', getIconClass(cat.icon)]"></span>
              <span class="text-xs font-mono tone-muted">{{ cat.icon }}</span>
            </td>
            <td class="tone-muted text-xs">{{ cat.updateTime ? formatDate(cat.updateTime) : '-' }}</td>
            <td class="text-right">
              <div class="flex justify-end gap-2">
                <n-button size="tiny" secondary @click="openEditCategory(cat)">
                  编辑
                </n-button>
                <n-button size="tiny" secondary type="error" :disabled="['photo', 'love'].includes(cat.code)" @click="handleDeleteCategory(cat.id)">
                  删除
                </n-button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredFootprintCategories.length === 0">
            <td colspan="6" class="text-center tone-muted py-8 text-sm">
              暂无符合条件的足迹类别数据。
            </td>
          </tr>
        </tbody>
      </n-table>
    </section>
 
    <!-- 新增/编辑足迹类别弹窗 -->
    <n-modal
      v-model:show="showCategoryModal"
      preset="card"
      :title="isEditCategory ? '编辑足迹类别' : '新增足迹类别'"
      class="w-[95vw] max-w-[480px]"
    >
      <n-form ref="categoryFormRef" :model="categoryFormModel" :rules="categoryFormRules" label-placement="top">
        <n-form-item label="类别名称" path="name">
          <n-input v-model:value="categoryFormModel.name" placeholder="例如：自驾探索" />
        </n-form-item>
        <n-form-item label="类别编码" path="code">
          <n-input v-model:value="categoryFormModel.code" placeholder="例如：drive (建议英文字符)" :disabled="isEditCategory && ['photo', 'love'].includes(categoryFormModel.code)" />
        </n-form-item>
        <n-form-item label="类别图标" path="icon">
          <n-select v-model:value="categoryFormModel.icon" :options="iconOptions" placeholder="选择在地图与列表中展示的图标" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button size="small" @click="showCategoryModal = false">取消</n-button>
          <n-button size="small" type="primary" :loading="submittingCategory" @click="handleSaveCategory">保存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage, useDialog, NInput, NButton, NTable, NModal, NForm, NFormItem, NSelect } from 'naive-ui'

import { getFootprintCategoryList, createFootprintCategory, updateFootprintCategory, deleteFootprintCategory } from '@/api/gallery'
import type { FootprintCategory } from '@/interface/love'
import { iconOptions, getIconClass } from '@/icon/love'

const message = useMessage()
const dialog = useDialog()

const searchCategoryQuery = ref('')
const showCategoryModal = ref(false)
const isEditCategory = ref(false)
const submittingCategory = ref(false)
const footprintCategories = ref<FootprintCategory[]>([])
const categoryFormRef = ref<any>(null)
const categoryFormModel = ref({
  id: 0,
  name: '',
  code: '',
  icon: 'Camera'
})

const categoryFormRules = {
  name: { required: true, message: '请填写类别名称', trigger: 'blur' },
  code: { required: true, message: '请填写类别编码', trigger: 'blur' }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 16)
}

const filteredFootprintCategories = computed(() => {
  const query = searchCategoryQuery.value.trim().toLowerCase()
  if (!query) return footprintCategories.value
  return footprintCategories.value.filter(
    c => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
  )
})

const fetchFootprintCategories = async () => {
  try {
    const response = await getFootprintCategoryList()
    if (response.data?.data) {
      footprintCategories.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to fetch footprint categories', err)
  }
}

const openCreateCategory = () => {
  isEditCategory.value = false
  categoryFormModel.value = {
    id: 0,
    name: '',
    code: '',
    icon: 'Camera'
  }
  showCategoryModal.value = true
}

const openEditCategory = (cat: FootprintCategory) => {
  isEditCategory.value = true
  categoryFormModel.value = {
    id: cat.id,
    name: cat.name,
    code: cat.code,
    icon: cat.icon
  }
  showCategoryModal.value = true
}

const handleSaveCategory = () => {
  categoryFormRef.value?.validate(async (errors: any) => {
    if (errors) return
    submittingCategory.value = true
    try {
      const response = isEditCategory.value
        ? await updateFootprintCategory(categoryFormModel.value)
        : await createFootprintCategory(categoryFormModel.value)
      
      if (response.data?.code !== 200) {
        throw new Error(response.data?.msg || '保存类别失败')
      }
      message.success(isEditCategory.value ? '足迹类别更新成功！' : '足迹类别添加成功！')
      showCategoryModal.value = false
      fetchFootprintCategories()
    } catch (err: any) {
      console.error('Failed to save category', err)
      message.error(err.message || '保存失败，请检查登录态及后端服务')
    } finally {
      submittingCategory.value = false
    }
  })
}

const handleDeleteCategory = (id: number) => {
  dialog.warning({
    title: '删除警示',
    content: '删除此类别可能会导致关联的前台足迹渲染为默认图标。确定要删除该足迹类别吗？',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteFootprintCategory(id)
        if (response.data?.code !== 200) {
          throw new Error(response.data?.msg || '删除失败')
        }
        message.success('删除成功')
        fetchFootprintCategories()
      } catch (err: any) {
        console.error('Failed to delete category', err)
        message.error(err.message || '删除失败')
      }
    }
  })
}

onMounted(() => {
  fetchFootprintCategories()
})
</script>
