<template>
  <div class="flex flex-col gap-4">
    <section class="archive-card p-4 sm:p-5">
      <div class="flex items-center justify-between">
        <h3 class="m-0 text-lg font-760 text-(--archive-text) flex items-center gap-1.5">
          <span class="i-mdi-target text-xl tone-accent"></span>
          百事打卡清单
        </h3>
        <n-button type="primary" @click="openCreateBucket">
          <template #icon><span class="i-mdi-plus"></span></template>
          添加清单项
        </n-button>
      </div>
    </section>

    <!-- 列表表格 -->
    <section class="archive-card p-4 sm:p-5">
      <n-table :bordered="false" :single-line="false" class="w-full">
        <thead>
          <tr>
            <th width="45%">愿望/任务名称</th>
            <th width="15%">分类</th>
            <th width="15%">完成状态</th>
            <th width="15%">完成日期</th>
            <th width="10%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in bucketItems" :key="item.id">
            <td class="font-700 text-(--archive-text)">
              <span :class="{ 'line-through text-neutral-400 dark:text-neutral-500': item.completed }">
                {{ item.title }}
              </span>
            </td>
            <td>
              <n-tag :type="getCategoryTagType(item.category)" size="small" round>
                {{ translateCategory(item.category) }}
              </n-tag>
            </td>
            <td>
              <n-switch
                :value="item.completed"
                @update:value="(val) => handleToggleBucketComplete(item, val)"
              >
                <template #checked>已点亮</template>
                <template #unchecked>待打卡</template>
              </n-switch>
            </td>
            <td class="tone-muted text-xs">
              {{ item.completedDate || '-' }}
            </td>
            <td>
              <n-space>
                <n-button size="tiny" secondary @click="openEditBucket(item)">编辑</n-button>
                <n-button size="tiny" secondary type="error" @click="handleDeleteBucket(item.id)">删除</n-button>
              </n-space>
            </td>
          </tr>
          <tr v-if="bucketItems.length === 0">
            <td colspan="5" class="text-center tone-muted py-6">还没有清单项，快来规划几件有意义的事吧！</td>
          </tr>
        </tbody>
      </n-table>
    </section>

    <!-- 百事清单编辑模态框 -->
    <n-modal
      v-model:show="showBucketModal"
      preset="card"
      :title="isEditBucket ? '编辑清单项' : '添加清单项'"
      class="w-[90vw] max-w-[500px]"
    >
      <n-form ref="bucketFormRef" :model="bucketForm" label-placement="top">
        <n-form-item label="愿望/事件标题" path="title" required>
          <n-input v-model:value="bucketForm.title" placeholder="如：一起坐一次热气球" />
        </n-form-item>
        <n-form-item label="分类" path="category">
          <n-select v-model:value="bucketForm.category" :options="categoryOptions" />
        </n-form-item>
        <div class="flex items-center gap-4 py-2">
          <span class="text-xs tone-muted">标记为已完成：</span>
          <n-switch v-model:value="bucketForm.completed" />
        </div>
        <div v-if="bucketForm.completed" class="space-y-4 pt-2">
          <n-form-item label="完成日期" path="completedDate">
            <n-input v-model:value="bucketForm.completedDate" placeholder="如：2026-05-20" />
          </n-form-item>
          <n-form-item label="纪念照路径" path="cover">
            <n-input v-model:value="bucketForm.cover" placeholder="如：/assets/love-anniversary.png" />
          </n-form-item>
          <n-form-item label="心动感悟/简记" path="thoughts">
            <n-input v-model:value="bucketForm.thoughts" type="textarea" :rows="3" placeholder="写下当时的心情..." />
          </n-form-item>
        </div>
        <div class="flex justify-end gap-3 mt-4 pt-3 border-t border-(--archive-border)/40">
          <n-button size="small" @click="showBucketModal = false">取消</n-button>
          <n-button size="small" type="primary" @click="handleSaveBucket">确定保存</n-button>
        </div>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, useDialog, NButton, NTable, NTag, NSwitch, NSpace, NModal, NForm, NFormItem, NInput, NSelect } from 'naive-ui'
import { getLoveBucketList, createLoveBucket, updateLoveBucket, deleteLoveBucket } from '@/api/love'
import type { BucketItem } from '@/interface/love'

const message = useMessage()
const dialog = useDialog()
const bucketItems = ref<BucketItem[]>([])
const showBucketModal = ref(false)
const isEditBucket = ref(false)

const bucketForm = ref({
  id: 0,
  title: '',
  completed: false,
  completedDate: '',
  cover: '',
  thoughts: '',
  category: 'daily' as 'travel' | 'food' | 'daily' | 'adventure'
})

const categoryOptions = [
  { label: '生活日常', value: 'daily' },
  { label: '携手旅行', value: 'travel' },
  { label: '浪漫美食', value: 'food' },
  { label: '共同冒险', value: 'adventure' }
]

const translateCategory = (cat: string) => {
  const map: Record<string, string> = {
    daily: '日常',
    travel: '旅行',
    food: '美食',
    adventure: '冒险'
  }
  return map[cat] || cat
}

const getCategoryTagType = (cat: string) => {
  const map: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
    daily: 'primary',
    travel: 'success',
    food: 'warning',
    adventure: 'error'
  }
  return map[cat] || 'default'
}

const fetchBucketItems = async () => {
  try {
    const response = await getLoveBucketList()
    if (response.data?.code !== 200) return
    bucketItems.value = response.data.data
  } catch (err) {
    console.error('Failed to load bucket items', err)
  }
}

const openCreateBucket = () => {
  isEditBucket.value = false
  bucketForm.value = {
    id: 0,
    title: '',
    completed: false,
    completedDate: '',
    cover: '',
    thoughts: '',
    category: 'daily'
  }
  showBucketModal.value = true
}

const openEditBucket = (item: any) => {
  isEditBucket.value = true
  bucketForm.value = { ...item }
  showBucketModal.value = true
}

const handleSaveBucket = async () => {
  if (!bucketForm.value.title.trim()) {
    message.warning('请输入标题')
    return
  }
  try {
    const response = isEditBucket.value
      ? await updateLoveBucket(bucketForm.value)
      : await createLoveBucket(bucketForm.value)
    
    if (response.data?.code !== 200) {
      message.error(response.data?.msg || '操作失败')
      return
    }
    message.success('保存成功')
    showBucketModal.value = false
    fetchBucketItems()
  } catch (err) {
    message.error('请求接口失败，请检查后端运行状态')
  }
}

const handleToggleBucketComplete = async (item: any, val: boolean) => {
  const payload = {
    ...item,
    completed: val,
    completedDate: val ? new Date().toISOString().split('T')[0] : ''
  }
  try {
    const response = await updateLoveBucket(payload)
    if (response.data?.code !== 200) return
    message.success(val ? '已成功点亮该愿望' : '已取消点亮')
    fetchBucketItems()
  } catch (err) {
    message.error('操作失败')
  }
}

const handleDeleteBucket = (id: number) => {
  dialog.warning({
    title: '确认删除',
    content: '确认删除此清单项吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteLoveBucket(id)
        if (response.data?.code !== 200) return
        message.success('删除成功')
        fetchBucketItems()
      } catch (err) {
        message.error('删除失败')
      }
    }
  })
}

onMounted(() => {
  fetchBucketItems()
})
</script>
