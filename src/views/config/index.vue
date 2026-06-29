<template>
  <div class="flex flex-col md:flex-row gap-5 items-start">
    <!-- 移动端折叠下拉导航 (仅在 md 以下可见) -->
    <div class="block md:hidden w-full mb-2 archive-card p-3 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl shrink-0">
      <n-dropdown 
        trigger="click" 
        :options="configDropdownOptions" 
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
    </div>

    <!-- 左侧分类列表 (平板及桌面端显示) -->
    <div class="hidden md:block w-full md:w-64 shrink-0 archive-card p-4 space-y-2 md:sticky md:top-4 z-10">
      <div 
        v-for="tab in tabsList" 
        :key="tab.name"
        class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border"
        :class="[
          activeTab === tab.name 
            ? 'bg-(--archive-accent-soft) border-(--archive-accent)/20 text-[#17211b] font-bold shadow-[0_8px_20px_-12px_var(--archive-accent)]' 
            : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 tone-muted'
        ]"
        @click="activeTab = tab.name"
      >
        <span :class="[tab.icon, 'text-lg']"></span>
        <span class="text-xs">{{ tab.label }}</span>
      </div>
    </div>

    <!-- 右侧对应表单 -->
    <div class="flex-1 w-full">
      <keep-alive>
        <component :is="currentTabComponent" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NDropdown } from 'naive-ui'

// 引入系统配置的子模块组件
import StorageConfig from './components/StorageConfig.vue'
import AmapConfig from './components/AmapConfig.vue'
import VisibilityConfig from './components/VisibilityConfig.vue'
import ThemeConfig from './components/ThemeConfig.vue'
import BrandConfig from './components/BrandConfig.vue'
import DatabaseConfig from './components/DatabaseConfig.vue'
import BeianConfig from './components/BeianConfig.vue'
import AiConfig from './components/AiConfig.vue'

const activeTab = ref('storage')

const configDropdownOptions = computed(() => {
  return tabsList.map(tab => ({
    label: tab.label,
    key: tab.name,
    icon: () => h('span', { class: [tab.icon, 'text-base'] })
  }))
})

const currentActiveTabLabel = computed(() => {
  const found = tabsList.find(t => t.name === activeTab.value)
  return found ? found.label : '存储与图床 (Storage)'
})

const currentActiveTabIcon = computed(() => {
  const found = tabsList.find(t => t.name === activeTab.value)
  return found ? found.icon : 'i-mdi-cloud-upload-outline'
})

const handleDropdownSelect = (key: string) => {
  activeTab.value = key
}

const tabsList = [
  { name: 'storage', label: '存储与图床 (Storage)', icon: 'i-mdi-cloud-upload-outline' },
  { name: 'amap', label: '地图服务 (AMap)', icon: 'i-mdi-map-marker-outline' },
  { name: 'visibility', label: '页面可见性 (Visibility)', icon: 'i-mdi-view-dashboard-outline' },
  { name: 'theme', label: '自定义主题 (Theme)', icon: 'i-mdi-palette-outline' },
  { name: 'brand', label: '全站与开屏配置 (Brand)', icon: 'i-mdi-flower' },
  { name: 'database', label: '数据库配置 (Database)', icon: 'i-mdi-database-outline' },
  { name: 'beian', label: '备案信息 (Beian)', icon: 'i-mdi-shield-check-outline' },
  { name: 'ai', label: 'AI 服务配置 (DeepSeek)', icon: 'i-mdi-robot-outline' }
]

const currentTabComponent = computed(() => {
  const map: Record<string, any> = {
    storage: StorageConfig,
    amap: AmapConfig,
    visibility: VisibilityConfig,
    theme: ThemeConfig,
    brand: BrandConfig,
    database: DatabaseConfig,
    beian: BeianConfig,
    ai: AiConfig
  }
  return map[activeTab.value]
})
</script>

<style scoped>
.archive-input :deep(.n-input-wrapper) {
  border-radius: 10px;
}
.archive-btn {
  border-radius: 10px;
}
</style>
