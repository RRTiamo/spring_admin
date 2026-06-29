<template>
  <div ref="loveDeskRef" class="flex flex-col gap-4 overflow-hidden">
    <!-- 编辑/写作视图 (组合使用组件化的 LoveEditor) -->
    <LoveEditor
      v-if="showEditor"
      :model="formModel"
      :is-edit="isEdit"
      :form-type="formType"
      @close="closeEditor"
      @save="handleSave"
    />

    <!-- 正常页面内容 -->
    <div v-else class="flex flex-col gap-4">
      <!-- 顶部 Tabs 导航 (平板及桌面端展示) -->
      <section class="hidden md:block archive-card p-3 sm:p-4 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl">
        <n-tabs v-model:value="activeTab" type="line" animated @update:value="handleTabChange">
          <n-tab-pane name="moments">
            <template #tab>
              <span class="i-mdi-camera-outline mr-1.5 text-base"></span> 甜蜜瞬间
            </template>
          </n-tab-pane>
          <n-tab-pane name="diaries">
            <template #tab>
              <span class="i-mdi-book-open-page-variant-outline mr-1.5 text-base"></span> 恋爱日记
            </template>
          </n-tab-pane>
          <n-tab-pane name="chronicle">
            <template #tab>
              <span class="i-mdi-timeline-text-outline mr-1.5 text-base"></span> 恋爱编年史
            </template>
          </n-tab-pane>
          <n-tab-pane name="bucket">
            <template #tab>
              <span class="i-mdi-format-list-bulleted mr-1.5 text-base"></span> 百事清单
            </template>
          </n-tab-pane>
          <n-tab-pane name="capsules">
            <template #tab>
              <span class="i-mdi-email-outline mr-1.5 text-base"></span> 时光胶囊
            </template>
          </n-tab-pane>
          <n-tab-pane name="stats">
            <template #tab>
              <span class="i-mdi-chart-bar mr-1.5 text-base"></span> 陪伴数据
            </template>
          </n-tab-pane>
          <n-tab-pane name="categories">
            <template #tab>
              <span class="i-mdi-shape-outline mr-1.5 text-base"></span> 足迹类别
            </template>
          </n-tab-pane>
          <n-tab-pane name="hero">
            <template #tab>
              <span class="i-mdi-video-outline mr-1.5 text-base"></span> 开屏背景配置
            </template>
          </n-tab-pane>
        </n-tabs>
      </section>

      <!-- 顶部折叠下拉导航 (手机端展示) -->
      <section class="block md:hidden archive-card p-3 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl">
        <n-dropdown 
          trigger="click" 
          :options="loveDropdownOptions" 
          @select="handleDropdownSelect"
        >
          <div class="flex items-center justify-between px-4 py-2.5 rounded-xl border border-(--archive-border) bg-white/40 dark:bg-white/5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-all">
            <div class="flex items-center gap-2.5">
              <span :class="currentActiveTabIcon" class="text-base text-(--archive-accent)"></span>
              <span class="text-xs font-bold font-sans">{{ currentActiveTabLabel }}</span>
            </div>
            <span class="i-mdi-chevron-down text-base opacity-60"></span>
          </div>
        </n-dropdown>
      </section>

      <!-- 1. 甜蜜瞬间 Tab (已解耦组件) -->
      <MomentsTab
        v-if="activeTab === 'moments'"
        :notes="momentsList"
        :loading="loading"
        backend-mode="api"
        @create="openCreate"
        @edit="openEdit"
        @delete="handleDelete"
      />

      <!-- 2. 恋爱日记 Tab (已解耦组件) -->
      <DiariesTab
        v-else-if="activeTab === 'diaries'"
        :notes="diariesList"
        :loading="loading"
        backend-mode="api"
        @create="openCreate"
        @edit="openEdit"
        @delete="handleDelete"
      />

      <!-- 3. 恋爱编年史 Tab (已解耦组件，卡片宽度自适应) -->
      <ChronicleTab
        v-else-if="activeTab === 'chronicle'"
        :notes="chronicleList"
        :loading="loading"
        backend-mode="api"
        @create="openCreate"
        @edit="openEdit"
        @delete="handleDelete"
      />

      <!-- 4. 百事清单 Tab (已解耦组件) -->
      <BucketTab
        v-else-if="activeTab === 'bucket'"
      />

      <!-- 5. 时光胶囊 Tab (已解耦组件) -->
      <CapsulesTab
        v-else-if="activeTab === 'capsules'"
      />

      <!-- 6. 陪伴数据 Tab (已解耦组件) -->
      <StatsTab
        v-else-if="activeTab === 'stats'"
      />

      <!-- 7. 足迹类别 Tab (已解耦组件) -->
      <CategoriesTab
        v-else-if="activeTab === 'categories'"
      />

      <!-- 8. 开屏背景配置 Tab (已解耦组件，合并了开屏及氛围列表配置，大屏铺满，照片墙视频不自播) -->
      <HeroTab
        v-else-if="activeTab === 'hero'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage, useDialog, NTabs, NTabPane, NDropdown } from 'naive-ui'
import { getLoveList, deleteLove } from '@/api/love'
import gsap from 'gsap'
import type { LoveEntry } from '@/interface/love'

// 导入解耦后的各 Tab 子组件
import MomentsTab from './components/MomentsTab.vue'
import DiariesTab from './components/DiariesTab.vue'
import ChronicleTab from './components/ChronicleTab.vue'
import BucketTab from './components/BucketTab.vue'
import CapsulesTab from './components/CapsulesTab.vue'
import StatsTab from './components/StatsTab.vue'
import CategoriesTab from './components/CategoriesTab.vue'
import HeroTab from './components/HeroTab.vue'
import LoveEditor from './components/LoveEditor.vue'

const message = useMessage()
const dialog = useDialog()

const activeTab = ref('moments')

const loveDropdownOptions = computed(() => {
  const tabs = [
    { key: 'moments', label: '甜蜜瞬间', icon: 'i-mdi-camera-outline' },
    { key: 'diaries', label: '恋爱日记', icon: 'i-mdi-book-open-page-variant-outline' },
    { key: 'chronicle', label: '恋爱编年史', icon: 'i-mdi-timeline-text-outline' },
    { key: 'bucket', label: '百事清单', icon: 'i-mdi-format-list-bulleted' },
    { key: 'capsules', label: '时光胶囊', icon: 'i-mdi-email-outline' },
    { key: 'stats', label: '陪伴数据', icon: 'i-mdi-chart-bar' },
    { key: 'categories', label: '足迹类别', icon: 'i-mdi-shape-outline' },
    { key: 'hero', label: '开屏背景配置', icon: 'i-mdi-video-outline' }
  ]
  return tabs.map(tab => ({
    label: tab.label,
    key: tab.key,
    icon: () => h('span', { class: [tab.icon, 'text-base'] })
  }))
})

const currentActiveTabLabel = computed(() => {
  const found = loveDropdownOptions.value.find(o => o.key === activeTab.value)
  return found ? found.label : '甜蜜瞬间'
})

const currentActiveTabIcon = computed(() => {
  const iconMap: Record<string, string> = {
    moments: 'i-mdi-camera-outline',
    diaries: 'i-mdi-book-open-page-variant-outline',
    chronicle: 'i-mdi-timeline-text-outline',
    bucket: 'i-mdi-format-list-bulleted',
    capsules: 'i-mdi-email-outline',
    stats: 'i-mdi-chart-bar',
    categories: 'i-mdi-shape-outline',
    hero: 'i-mdi-video-outline'
  }
  return iconMap[activeTab.value] || 'i-mdi-camera-outline'
})

const handleDropdownSelect = (key: string) => {
  activeTab.value = key
  handleTabChange(key)
}

// 数据状态控制
const loveDeskRef = ref<HTMLElement | null>(null)
const notes = ref<LoveEntry[]>([])
const loading = ref(true)

// 写作编辑器状态
const showEditor = ref(false)
const isEdit = ref(false)
const formType = ref<'moment' | 'diary' | 'event'>('moment')

const formModel = ref({
  id: 0,
  slug: '',
  title: '',
  dateTimestamp: Date.now(),
  location: '',
  mood: 'romantic',
  visibility: 'public',
  cover: '',
  content: '',
  longitude: null as number | null,
  latitude: null as number | null,
  footprintType: 'love'
})

// 计算属性过滤出不同类别提供给 Moments/Diaries/Chronicle 组件
const momentsList = computed(() => {
  return notes.value.filter((n) => n.cover && n.cover.trim() !== '')
})

const diariesList = computed(() => {
  return notes.value.filter((n) => n.content && n.content.trim() !== '')
})

const chronicleList = computed(() => {
  return notes.value
})

// Tab 切换回调
const handleTabChange = (val: string) => {
  if (val === 'moments' || val === 'diaries' || val === 'chronicle') {
    fetchNotes()
  }
}

// 获取随笔列表数据
const fetchNotes = async () => {
  loading.value = true
  try {
    const response = await getLoveList()
    if (response.data?.code !== 200) {
      throw new Error(response.data?.msg || 'API return not 200')
    }
    notes.value = response.data.data
  } catch (err: any) {
    console.error('Failed to load love notes', err)
    message.error(err.message || '获取恋爱记录失败，请检查网络或服务状态')
  } finally {
    loading.value = false
    animateList()
  }
}

const animateList = () => {
  if (!loveDeskRef.value) return
  requestAnimationFrame(() => {
    gsap.fromTo(
      '.article-row',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', overwrite: 'auto' }
    )
  })
}

// 供子组件调用的 CRUD 事件触发
const openCreate = (type: 'moment' | 'diary' | 'event') => {
  isEdit.value = false
  formType.value = type
  
  let defaultCover = ''
  if (type === 'moment') {
    defaultCover = '/assets/love-anniversary.png'
  }
  
  formModel.value = {
    id: 0,
    slug: '',
    title: '',
    dateTimestamp: Date.now(),
    location: '',
    mood: type === 'diary' ? 'quiet' : 'romantic',
    visibility: 'public',
    cover: defaultCover,
    content: '',
    longitude: null,
    latitude: null,
    footprintType: 'love'
  }
  showEditor.value = true
}

const openEdit = (note: LoveEntry, type: 'moment' | 'diary' | 'event') => {
  isEdit.value = true
  formType.value = type
  formModel.value = {
    id: note.id,
    slug: note.slug,
    title: note.title,
    dateTimestamp: note.date ? new Date(note.date).getTime() : Date.now(),
    location: note.location,
    mood: note.mood,
    visibility: note.visibility,
    cover: note.cover,
    content: note.content,
    longitude: note.longitude ? Number(note.longitude) : null,
    latitude: note.latitude ? Number(note.latitude) : null,
    footprintType: note.footprintType || 'love'
  }
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
  animateList()
}

const handleSave = () => {
  showEditor.value = false
  fetchNotes()
}



const handleDelete = (id: number) => {
  dialog.warning({
    title: '确认删除',
    content: '删除后前台页面将不再展示该记录。确定要删除该记录吗？',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteLove(id)
        if (response.data && response.data.code === 200) {
          message.success('删除成功')
          fetchNotes()
        } else {
          throw new Error(response.data?.msg || '删除失败')
        }
      } catch (err: any) {
        console.error('Failed to delete love note', err)
        message.error(err.message || '删除操作失败，后端接口响应异常')
      }
    }
  })
}

onMounted(() => {
  fetchNotes()
})
</script>
