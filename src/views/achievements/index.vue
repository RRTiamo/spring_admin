<template>
  <div class="achievements-desk flex flex-col gap-6">
    <!-- 顶部操作与筛选栏 -->
    <section class="archive-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      <div class="flex items-center gap-3">
        <span class="i-mdi-trophy-outline text-3xl text-(--archive-accent) animate-pulse"></span>
        <div class="flex flex-col text-left">
          <h3 class="text-base font-bold text-(--archive-text) tracking-wide">成就与里程碑奖状</h3>
          <p class="text-xs text-(--archive-text)/60 mt-1 leading-relaxed">
            记录人生路上的重大高光瞬间与日常微小善举，让成长足迹有迹可循。
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <n-input
          v-model:value="searchQuery"
          clearable
          placeholder="搜索成就标题..."
          class="w-full sm:w-[220px]"
        >
          <template #prefix>
            <span class="i-mdi-magnify tone-faint text-lg"></span>
          </template>
        </n-input>
        <button
          class="px-4 py-2 text-xs font-bold rounded-xl border border-(--archive-border) hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all text-(--archive-text) whitespace-nowrap cursor-pointer"
          @click="openMetaManager"
        >
          元数据配置
        </button>
        <button
          class="px-4 py-2 text-xs font-bold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
          @click="openCreate"
        >
          <span class="i-mdi-plus"></span>
          <span>录入成就</span>
        </button>
      </div>
    </section>



    <!-- 主体内容区 -->
    <div v-if="loading" class="flex justify-center items-center py-24">
      <n-spin size="large" />
    </div>

    <div v-else-if="filteredAchievements.length === 0" class="archive-card p-12 text-center">
      <span class="i-mdi-trophy-broken text-5xl tone-muted opacity-30 mb-3 block"></span>
      <p class="text-sm tone-muted">未检索到任何成长里程碑记录</p>
    </div>

    <!-- 成就网格卡片 -->
    <AchievementsGrid
      v-else
      :paginated-achievements="paginatedAchievements"
      :filtered-achievements="filteredAchievements"
      :currentPage="page"
      :pageSize="pageSize"
      :metas="metas"
      @update:currentPage="page = $event"
      @update:pageSize="pageSize = $event"
      @edit="openEdit"
      @delete="handleDelete"
    />

    <!-- 新增/编辑成就弹窗 -->
    <AchievementFormModal
      v-model:showModal="showModal"
      v-model:formModel="formModel"
      :is-edit="isEdit"
      :submitting="submitting"
      :category-options="categoryOptions"
      :level-options="levelOptions"
      :icon-options="iconOptions"
      :rules="formRules"
      :upload-headers="uploadHeaders"
      @save="handleSave"
    />

    <!-- 元数据配置大列表管理弹窗 -->
    <n-modal
      v-model:show="showMetaListModal"
      preset="card"
      title="元数据配置管理"
      class="w-[90vw] max-w-[680px]"
    >
      <div class="space-y-4 text-left">
        <div class="flex justify-between items-center pb-2 border-b border-(--archive-border)">
          <p class="text-xs text-(--archive-text)/60 m-0">配置成就的分类与重要性评级维度。</p>
          <div class="flex gap-2">
            <n-button size="tiny" type="primary" @click="openCreateMeta('category')">新增类别</n-button>
            <n-button size="tiny" type="info" @click="openCreateMeta('level')">新增评级</n-button>
          </div>
        </div>

        <div class="max-h-[360px] overflow-y-auto space-y-2 pr-1">
          <div
            v-for="meta in metas"
            :key="meta.id"
            class="flex items-center justify-between p-3 border border-(--archive-border) rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
          >
            <div class="flex items-center gap-3">
              <span :class="[meta.icon, 'text-lg text-(--archive-accent)']"></span>
              <div>
                <div class="text-xs font-bold text-(--archive-text)">{{ meta.name }}</div>
                <div class="text-[10px] text-(--archive-text)/40 font-mono mt-0.5">
                  Code: {{ meta.code }} | Type: {{ meta.type === 'category' ? '成就分类' : '评级重要度' }}
                </div>
              </div>
            </div>
            <div class="flex gap-1.5">
              <n-button size="tiny" @click="openEditMeta(meta)">编辑</n-button>
              <n-button size="tiny" type="error" @click="handleDeleteMeta(meta.id)">删除</n-button>
            </div>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- 元数据单个编辑/新增弹窗 -->
    <MetaFormModal
      v-model:showMetaModal="showMetaModal"
      v-model:metaFormModel="metaFormModel"
      :is-meta-edit="isMetaEdit"
      :meta-submitting="metaSubmitting"
      :meta-icon-options="metaIconOptions"
      :meta-rules="metaRules"
      @save="handleSaveMeta"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NInput, NSpin, NModal, NButton, useDialog, useMessage } from 'naive-ui'
import type { FormRules } from 'naive-ui'
import {
  getAchievementsList,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievementMetasList,
  createAchievementMeta,
  updateAchievementMeta,
  deleteAchievementMeta
} from '@/api/achievements'
import type { Achievement, AchievementMeta } from '@/interface/love'

// 导入子组件
import AchievementsGrid from './components/AchievementsGrid.vue'
import AchievementFormModal from './components/AchievementFormModal.vue'
import MetaFormModal from './components/MetaFormModal.vue'

// 默认元配置列表，用作离线或未初始化时的兜底数据
const defaultMetas: AchievementMeta[] = [
  { id: 1, type: 'category', name: '重大里程碑', code: 'milestone', icon: 'i-mdi-trophy-outline' },
  { id: 2, type: 'category', name: '生活纪实', code: 'life', icon: 'i-mdi-notebook-outline' },
  { id: 3, type: 'category', name: '日常善举', code: 'daily', icon: 'i-mdi-heart-outline' },
  { id: 4, type: 'level', name: '史诗 (Gold)', code: 'gold', icon: 'i-mdi-medal-outline' },
  { id: 5, type: 'level', name: '稀有 (Silver)', code: 'silver', icon: 'i-mdi-medal-outline' },
  { id: 6, type: 'level', name: '日常 (Bronze)', code: 'bronze', icon: 'i-mdi-medal-outline' }
]

const message = useMessage()
const dialog = useDialog()

const achievements = ref<Achievement[]>([])
const metas = ref<AchievementMeta[]>([...defaultMetas])
const loading = ref(false)
const searchQuery = ref('')
const page = ref(1)
const pageSize = ref(6)

// 弹窗表单状态 (成就)
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)

const formModel = ref({
  id: null as number | null,
  title: '',
  description: '',
  category: 'milestone',
  level: 'gold',
  icon: 'i-mdi-trophy-outline',
  achieveDateVal: null as number | null,
  cover: ''
})

const formRules: FormRules = {
  title: { required: true, message: '请写下此项成就名称', trigger: 'blur' },
  description: { required: true, message: '请简短叙述此项里程碑的发生始末', trigger: 'blur' }
}

const uploadHeaders = computed(() => ({
  satoken: localStorage.getItem('satoken') || ''
}))

const iconOptions = [
  { label: '荣誉奖杯 (Trophy)', value: 'i-mdi-trophy-outline', icon: 'i-mdi-trophy-outline' },
  { label: '爱心印记 (Heart)', value: 'i-mdi-heart-outline', icon: 'i-mdi-heart-outline' },
  { label: '闪耀之星 (Star)', value: 'i-mdi-star-outline', icon: 'i-mdi-star-outline' },
  { label: '影像记录 (Camera)', value: 'i-mdi-camera-outline', icon: 'i-mdi-camera-outline' },
  { label: '图书阅读 (Book)', value: 'i-mdi-book-open-page-variant-outline', icon: 'i-mdi-book-open-page-variant-outline' },
  { label: '代码芯片 (Code)', value: 'i-mdi-xml', icon: 'i-mdi-xml' }
]

const categoryOptions = computed(() => {
  return metas.value
    .filter((m) => m.type === 'category')
    .map((m) => ({
      label: m.name,
      value: m.code,
      icon: m.icon
    }))
})

const levelOptions = computed(() => {
  return metas.value
    .filter((m) => m.type === 'level')
    .map((m) => ({
      label: m.name,
      value: m.code,
      icon: m.icon
    }))
})

// 弹窗状态 (元数据大列表配置)
const showMetaListModal = ref(false)

// 弹窗状态 (元数据配置单个编辑/新增)
const showMetaModal = ref(false)
const isMetaEdit = ref(false)
const metaSubmitting = ref(false)
const metaFormModel = ref({
  id: null as number | null,
  type: 'category',
  name: '',
  code: '',
  icon: 'i-mdi-trophy-outline'
})

const metaRules = {
  name: { required: true, message: '请输入配置展示名称', trigger: 'blur' },
  code: { required: true, message: '请输入标识代码', trigger: 'blur' }
}

const metaIconOptions = [
  { label: '奖杯 (Trophy)', value: 'i-mdi-trophy-outline', icon: 'i-mdi-trophy-outline' },
  { label: '书本 (Notebook)', value: 'i-mdi-notebook-outline', icon: 'i-mdi-notebook-outline' },
  { label: '爱心 (Heart)', value: 'i-mdi-heart-outline', icon: 'i-mdi-heart-outline' },
  { label: '奖牌 (Medal)', value: 'i-mdi-medal-outline', icon: 'i-mdi-medal-outline' },
  { label: '闪耀之星 (Star)', value: 'i-mdi-star-outline', icon: 'i-mdi-star-outline' },
  { label: '相机 (Camera)', value: 'i-mdi-camera-outline', icon: 'i-mdi-camera-outline' },
  { label: '代码 (Code)', value: 'i-mdi-xml', icon: 'i-mdi-xml' }
]

const filteredAchievements = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return achievements.value
  return achievements.value.filter((a) =>
    a.title.toLowerCase().includes(q) ||
    a.description.toLowerCase().includes(q) ||
    a.category.toLowerCase().includes(q)
  )
})

const paginatedAchievements = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAchievements.value.slice(start, end)
})

const fetchAchievements = async () => {
  loading.value = true
  try {
    const response = await getAchievementsList()
    if (response.data && response.data.code === 200) {
      achievements.value = response.data.data || []
    } else {
      throw new Error(response.data?.msg || 'Failed to load achievements')
    }
  } catch (err: any) {
    console.error('Failed to load achievements', err)
    message.error(err.message || '获取成就里程碑数据失败，请检查网络或服务状态')
  } finally {
    loading.value = false
  }
}

const fetchMetas = async () => {
  try {
    const response = await getAchievementMetasList()
    if (response.data && response.data.code === 200) {
      metas.value = response.data.data && response.data.data.length > 0 ? response.data.data : [...defaultMetas]
    }
  } catch (err) {
    console.warn('Fallback to static default metas', err)
  }
}

const openCreate = () => {
  isEdit.value = false
  formModel.value = {
    id: null,
    title: '',
    description: '',
    category: 'milestone',
    level: 'gold',
    icon: 'i-mdi-trophy-outline',
    achieveDateVal: Date.now(),
    cover: ''
  }
  showModal.value = true
}

const openEdit = (ach: Achievement) => {
  isEdit.value = true
  formModel.value = {
    id: ach.id,
    title: ach.title,
    description: ach.description,
    category: ach.category,
    level: ach.level,
    icon: ach.icon || 'i-mdi-trophy-outline',
    achieveDateVal: ach.achieveDate ? new Date(ach.achieveDate).getTime() : Date.now(),
    cover: ach.cover || ''
  }
  showModal.value = true
}

const handleSave = async () => {
  submitting.value = true
  const formattedDate = formModel.value.achieveDateVal
    ? new Date(formModel.value.achieveDateVal).toISOString()
    : new Date().toISOString()

  const payload = {
    ...formModel.value,
    achieveDate: formattedDate
  }

  try {
    if (isEdit.value) {
      const response = await updateAchievement(payload)
      if (response.data && response.data.code === 200) {
        message.success('成就已成功修改 ✨')
        await fetchAchievements()
      } else {
        throw new Error(response.data?.msg || '修改失败')
      }
    } else {
      const response = await createAchievement(payload)
      if (response.data && response.data.code === 200) {
        message.success('新里程碑已登记归档 🏆')
        await fetchAchievements()
      } else {
        throw new Error(response.data?.msg || '保存失败')
      }
    }
    showModal.value = false
  } catch (err: any) {
    console.error('Save achievement failed', err)
    message.error(err.message || '保存失败，请检查网络或后端接口服务')
  } finally {
    submitting.value = false
  }
}

const handleDelete = (id: number) => {
  dialog.warning({
    title: '撕去荣誉奖状',
    content: '删除此里程碑后将不可恢复。确认要擦除此项成就吗？',
    positiveText: '确认删除',
    negativeText: '保留它',
    onPositiveClick: async () => {
      try {
        const response = await deleteAchievement(id)
        if (response.data && response.data.code === 200) {
          message.success('已删除该项成就奖状 🎏')
          await fetchAchievements()
        } else {
          throw new Error(response.data?.msg || '删除失败')
        }
      } catch (err: any) {
        console.error('Delete achievement failed', err)
        message.error(err.message || '删除操作失败，后端接口响应异常')
      }
    }
  })
}

// 元数据大配置列表展示
const openMetaManager = () => {
  showMetaListModal.value = true
}

// 元数据单个新增
const openCreateMeta = (type: 'category' | 'level') => {
  isMetaEdit.value = false
  metaFormModel.value = {
    id: null,
    type: type,
    name: '',
    code: '',
    icon: type === 'category' ? 'i-mdi-trophy-outline' : 'i-mdi-medal-outline'
  }
  showMetaModal.value = true
}

// 元数据单个编辑
const openEditMeta = (meta: AchievementMeta) => {
  isMetaEdit.value = true
  metaFormModel.value = {
    id: meta.id,
    type: meta.type,
    name: meta.name,
    code: meta.code,
    icon: meta.icon
  }
  showMetaModal.value = true
}

// 保存单个元数据
const handleSaveMeta = async () => {
  metaSubmitting.value = true
  try {
    let response
    const payload = metaFormModel.value
    if (isMetaEdit.value) {
      response = await updateAchievementMeta(payload)
    } else {
      response = await createAchievementMeta(payload)
    }
    if (response.data && response.data.code === 200) {
      message.success('元数据配置保存成功')
      await fetchMetas()
      showMetaModal.value = false
    } else {
      message.error(response.data?.msg || '保存失败')
    }
  } catch (err) {
    console.error('Save meta failed', err)
    message.error('无法保存元数据，后端服务器离线。')
  } finally {
    metaSubmitting.value = false
  }
}

// 删除单个元数据
const handleDeleteMeta = (id: number) => {
  dialog.warning({
    title: '确认删除元数据',
    content: '删除此元配置选项后，前台对应的显示类别或级别可能会受影响，确认要删除吗？',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteAchievementMeta(id)
        if (response.data && response.data.code === 200) {
          message.success('元数据已成功移除')
          await fetchMetas()
        } else {
          message.error(response.data?.msg || '删除失败')
        }
      } catch (err) {
        console.error('Delete meta failed', err)
        message.error('删除元配置失败')
      }
    }
  })
}

onMounted(() => {
  fetchAchievements()
  fetchMetas()
})
</script>
