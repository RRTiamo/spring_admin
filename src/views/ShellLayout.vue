<template>
  <div class="app-layout h-screen flex bg-(--archive-bg) text-(--archive-text) overflow-hidden">
    <!-- 移动端侧边栏遮罩层 -->
    <div v-if="!isMobileCollapsed"
      class="mobile-overlay md:hidden fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-opacity duration-300"
      @click="closeMobileSidebar" />

    <!-- 左侧侧边栏 -->
    <aside class="admin-sidebar fixed top-0 left-0 h-screen z-50 flex flex-col" :class="[
      isCollapsed ? 'w-19' : 'w-65',
      isMobileCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
    ]">
      <!-- 头部博主卡片/Logo -->
      <div class="p-4 border-b border-(--archive-border) shrink-0">
        <router-link :to="{ name: 'Dashboard' }"
          class="pressable flex items-center gap-3 overflow-hidden rounded-xl py-1.5 transition-all w-full"
          :class="[isCollapsed ? 'justify-center px-0' : 'px-2']" aria-label="返回后台首页">
          <span
            class="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/40 bg-white/60 shadow-sm flex items-center justify-center">
            <img src="/life-assets/avatar.jpg" alt="RRTiamo 头像" class="life-image w-full h-full object-cover" />
          </span>
          <div v-if="!isCollapsed" class="flex flex-col text-left transition-opacity duration-300">
            <span class="text-[14px] font-750 leading-tight tracking-tight">春风不解别离</span>
            <span class="text-[11px] leading-tight tone-muted mt-0.5">个人博客后台</span>
          </div>
        </router-link>
      </div>

      <!-- 面包屑导航 (已移动到此处) -->
      <div v-if="!isCollapsed"
        class="px-4 py-3 shrink-0 flex items-center justify-center border-b border-(--archive-border)/40 bg-(--archive-bg-card)/10">
        <div
          class="breadcrumb-container shadow-none! bg-white/30! dark:bg-white/5! py-1.5! px-3.5! border-(--archive-border)/50!">
          <router-link :to="{ name: 'Dashboard' }" class="breadcrumb-item">
            <span class="i-mdi-home text-sm"></span>
            <span>后台</span>
          </router-link>
          <span class="breadcrumb-separator">·</span>
          <span class="breadcrumb-item active">
            <span :class="activeRouteIcon" class="text-sm"></span>
            <span>{{ routeNameChinese }}</span>
          </span>
        </div>
      </div>

      <!-- 菜单列表区 -->
      <nav class="flex-1 overflow-y-auto scrollbar-none p-3 space-y-1.5">
        <!-- 可跳转菜单 -->
        <div v-for="item in menuItems" :key="item.name">
          <n-tooltip placement="right" trigger="hover" :disabled="!isCollapsed" class="sidebar-tooltip-content">
            <template #trigger>
              <router-link :to="{ name: item.name }" class="nav-pill-vertical"
                :class="{ active: activeKey === item.name, 'justify-center px-0': isCollapsed }"
                @click="closeMobileSidebar">
                <span :class="item.icon" class="text-lg shrink-0"></span>
                <span v-if="!isCollapsed" class="transition-opacity duration-300">{{ item.label }}</span>
              </router-link>
            </template>
            {{ item.label }}
          </n-tooltip>
        </div>

        <div class="h-px my-3 bg-(--archive-border) opacity-60"></div>

        <!-- 占位/未开放菜单 -->
        <div v-for="item in placeholderItems" :key="item.label">
          <n-tooltip placement="right" trigger="hover" class="sidebar-tooltip-content">
            <template #trigger>
              <div class="nav-pill-vertical opacity-54 cursor-not-allowed hover:bg-transparent"
                :class="[isCollapsed ? 'justify-center px-0' : 'justify-between']"
                @click="handleDisabledClick(item.label)">
                <div class="flex items-center gap-3">
                  <span :class="item.icon" class="text-lg shrink-0"></span>
                  <span v-if="!isCollapsed" class="transition-opacity duration-300">{{ item.label }}</span>
                </div>
                <span v-if="!isCollapsed"
                  class="text-[9px] px-1.5 py-0.5 rounded bg-white/20 dark:bg-white/10 text-(--archive-muted) scale-90 origin-right font-normal shrink-0">
                  未开放
                </span>
              </div>
            </template>
            {{ item.tip }}
          </n-tooltip>
        </div>
      </nav>

      <!-- 侧边栏底部区 -->
      <div class="p-3 border-t border-(--archive-border) space-y-3 shrink-0">
        <!-- 在线状态卡片 -->
        <div
          class="flex items-center rounded-xl bg-white/30 dark:bg-white/5 border border-(--archive-border) px-3 py-2 transition-all duration-300"
          :class="[isCollapsed ? 'justify-center' : 'gap-3']">
          <span class="online-dot shrink-0"></span>
          <div v-if="!isCollapsed" class="flex flex-col text-left">
            <span class="text-[11px] font-700 leading-tight">RRTiamo 在线</span>
            <span class="text-[9px] leading-tight tone-muted mt-0.5">安全连接已接通</span>
          </div>
        </div>

        <!-- 底部快捷按键组 -->
        <div class="flex items-center gap-1.5 w-full" :class="[isCollapsed ? 'flex-col' : 'justify-between']">
          <n-tooltip placement="right" trigger="hover" :disabled="!isCollapsed">
            <template #trigger>
              <button class="icon-button w-full flex-1" :class="[isCollapsed ? 'h-9 w-9' : 'h-9.5']" type="button"
                :aria-label="themeLabel" @click="toggleTheme">
                <span :class="theme === 'dark' ? 'i-mdi-white-balance-sunny' : 'i-mdi-weather-night'"
                  class="text-base"></span>
                <span v-if="!isCollapsed" class="text-xs font-600 ml-1.5">{{ theme === 'dark' ? '浅色' : '深色' }}</span>
              </button>
            </template>
            切换主题
          </n-tooltip>

          <n-tooltip placement="right" trigger="hover" :disabled="!isCollapsed">
            <template #trigger>
              <button class="icon-button w-full flex-1" :class="[isCollapsed ? 'h-9 w-9' : 'h-9.5', 'btn-danger-hover']"
                type="button" @click="handleLogout">
                <span class="i-mdi-logout-variant text-base"></span>
                <span v-if="!isCollapsed" class="text-xs font-600 ml-1.5">退出</span>
              </button>
            </template>
            退出后台
          </n-tooltip>
        </div>
      </div>

      <!-- 侧边栏折叠微型触发器 (桌面端) -->
      <button class="collapse-trigger hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2"
        @click="toggleCollapse" :aria-label="isCollapsed ? '展开侧边栏' : '折叠侧边栏'">
        <span :class="isCollapsed ? 'i-mdi-chevron-right' : 'i-mdi-chevron-left'" class="text-[10px]"></span>
      </button>
    </aside>

    <!-- 右侧主要内容区 -->
    <div class="main-container flex-1 min-w-0 flex flex-col h-screen" :class="[isCollapsed ? 'md:pl-19' : 'md:pl-65']">
      <!-- 顶部 Header (仅在移动端可见，桌面端隐藏以获得极致开阔视野) -->
      <header
        class="md:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-(--archive-border)/60 bg-(--archive-bg)/85 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <!-- 移动端触发按钮 -->
          <button class="icon-button h-9 w-9 flex items-center justify-center" @click="toggleMobileSidebar"
            aria-label="展开菜单">
            <span class="i-mdi-menu text-lg"></span>
          </button>

          <!-- 简易标题，取代面包屑 -->
          <span class="text-sm font-700 text-(--archive-text)">{{ routeNameChinese }}</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-(--archive-success) animate-pulse"></span>
          <span class="text-[10px] font-700 tone-muted">在线</span>
        </div>
      </header>

      <!-- 主要内容容器 -->
      <main id="admin-main" class="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-7 max-w-[1650px] w-full mx-auto">
        <!-- 路由标题区 -->
        <div class="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="m-0 text-xs font-700 uppercase tracking-widest tone-accent">{{ routeNameChinese }}</p>
            <h1 class="m-0 mt-1 text-2xl font-800 leading-tight tracking-tight text-(--archive-text) sm:text-3xl">
              {{ routeHeadline }}
            </h1>
          </div>
          <p class="m-0 max-w-136 text-sm leading-6 tone-muted">
            {{ routeDescription }}
          </p>
        </div>

        <!-- 页面视图渲染 -->
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NTooltip, useDialog, useMessage } from 'naive-ui'

type ThemeMode = 'light' | 'dark'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const dialog = useDialog()

const theme = ref<ThemeMode>('light')
const isCollapsed = ref(false)
const isMobileCollapsed = ref(true)

const menuItems = [
  {
    name: 'Dashboard',
    label: '今日总览',
    icon: 'i-mdi-view-dashboard-outline'
  },
  {
    name: 'Articles',
    label: '文章管理',
    icon: 'i-mdi-text-box-multiple-outline'
  },
  {
    name: 'Categories',
    label: '分类管理',
    icon: 'i-mdi-folder-multiple-outline'
  },
  {
    name: 'Love',
    label: '恋爱管理',
    icon: 'i-mdi-heart-outline'
  },
  {
    name: 'Letter',
    label: '岁月信箱',
    icon: 'i-mdi-email-outline'
  },
  {
    name: 'Gallery',
    label: '照片墙',
    icon: 'i-mdi-image-multiple-outline'
  },
  {
    name: 'Now',
    label: '此时此刻',
    icon: 'i-mdi-clock-outline'
  },
  {
    name: 'About',
    label: '关于作者',
    icon: 'i-mdi-account-outline'
  },
  {
    name: 'Notes',
    label: '随笔便签',
    icon: 'i-mdi-notebook-outline'
  },
  {
    name: 'Achievements',
    label: '成就管理',
    icon: 'i-mdi-trophy-outline'
  },
  {
    name: 'Config',
    label: '系统配置',
    icon: 'i-mdi-cog-outline'
  },
  {
    name: 'PondFeedback',
    label: '鱼塘反馈',
    icon: 'i-mdi-fish'
  },
  {
    name: 'Links',
    label: '友情互链',
    icon: 'i-mdi-link-variant'
  },
  {
    name: 'Files',
    label: '文件管理',
    icon: 'i-mdi-folder-open-outline'
  }
]

const placeholderItems: any[] = []

const activeKey = computed(() => route.name as string)

const activeRouteIcon = computed(() => {
  if (route.name === 'Dashboard') return 'i-mdi-view-dashboard-outline'
  if (route.name === 'Articles') return 'i-mdi-text-box-multiple-outline'
  if (route.name === 'Categories') return 'i-mdi-folder-multiple-outline'
  if (route.name === 'Love') return 'i-mdi-heart-outline'
  if (route.name === 'Letter') return 'i-mdi-email-outline'
  if (route.name === 'Gallery') return 'i-mdi-image-multiple-outline'
  if (route.name === 'Config') return 'i-mdi-cog-outline'
  if (route.name === 'Now') return 'i-mdi-clock-outline'
  if (route.name === 'About') return 'i-mdi-account-outline'
  if (route.name === 'Notes') return 'i-mdi-notebook-outline'
  if (route.name === 'Achievements') return 'i-mdi-trophy-outline'
  if (route.name === 'PondFeedback') return 'i-mdi-fish'
  if (route.name === 'Links') return 'i-mdi-link-variant'
  if (route.name === 'Files') return 'i-mdi-folder-open-outline'
  return 'i-mdi-cog-outline'
})

const routeNameChinese = computed(() => {
  if (route.name === 'Dashboard') return '今日看板'
  if (route.name === 'Articles') return '文章管理'
  if (route.name === 'Categories') return '分类管理'
  if (route.name === 'Love') return '恋爱记录管理'
  if (route.name === 'Letter') return '岁月信箱'
  if (route.name === 'Gallery') return '照片墙管理'
  if (route.name === 'Config') return '系统配置'
  if (route.name === 'Now') return '此时此刻管理'
  if (route.name === 'About') return '关于作者'
  if (route.name === 'Notes') return '随笔便签管理'
  if (route.name === 'Achievements') return '成就奖状管理'
  if (route.name === 'PondFeedback') return '鱼塘反馈'
  if (route.name === 'Links') return '友情链接管理'
  if (route.name === 'Files') return '文件管理'
  return '后台'
})

const routeHeadline = computed(() => {
  if (route.name === 'Dashboard') return '看看这个小站今天的状态'
  if (route.name === 'Articles') return '整理文章、草稿和标签'
  if (route.name === 'Categories') return '管理文章的自定义分类与层级关系'
  if (route.name === 'Love') return '管理甜蜜瞬间、恋爱日记与恋爱编年史'
  if (route.name === 'Letter') return '写给未来的寄语与时间信札'
  if (route.name === 'Gallery') return '珍藏生活影像与美好瞬间'
  if (route.name === 'Config') return '个性化定制与系统底层配置'
  if (route.name === 'Now') return '记录生活的瞬间与现状状态'
  if (route.name === 'About') return '个性化定制你的个人档案介绍'
  if (route.name === 'Notes') return '整理日常的零碎想法与火花'
  if (route.name === 'Achievements') return '珍藏生活成就、善举与里程碑时刻'
  if (route.name === 'PondFeedback') return '聆听那游进池塘的小鱼们的声音'
  if (route.name === 'Links') return '管理友情链接与邻居们'
  if (route.name === 'Files') return '管理系统上传的图片和附件'
  return '个人博客后台'
})

const routeDescription = computed(() => {
  if (route.name === 'Dashboard') return '「文字是时光的胶片，在岁月的角落，妥帖记录日常与温度。」'
  if (route.name === 'Articles') return '「将脑海中的电光石火与生活碎片，整理成诗，妥帖安放。」'
  if (route.name === 'Categories') return '「分门别类，理清思绪。让爱与代码，在适合它们的抽屉里妥帖存放。」'
  if (route.name === 'Love') return '「收集那些与你的微小快乐瞬间，在这里一站式打点甜蜜瞬间、恋爱日记与时间线编年史。」'
  if (route.name === 'Letter') return '「寄信给未来的自己，在时光深处，等待时间洪流中的某一天，解封与重温当时的寄语。」'
  if (route.name === 'Gallery') return '「用快门挽留那一秒的光影，把时间的物理温度，永久珍藏。」'
  if (route.name === 'Config') return '「微调每一个参数，为网站提供更稳定的第三方服务及图像渲染能力。」'
  if (route.name === 'Now') return '「同步当前的位置、精神面貌、正在阅读及听歌的日常现状状态。」'
  if (route.name === 'About') return '「此间主人的履历切片，用代码、文字和影像在这里建立自己数字时空里的立体人设。」'
  if (route.name === 'Notes') return '「随性记录，物理显化。让瞬间的闪光，在随笔便签墙上永久悬挂。」'
  if (route.name === 'Achievements') return '「装订每一个里程碑，收集生活里的善意与微光，见证自我的蜕变与成长。」'
  if (route.name === 'PondFeedback') return '「这里是访客的夸夸、吐槽、改进意见与灵感，一站式进行反馈审核与管理员回复。」'
  if (route.name === 'Links') return '「海内存知己，天涯若比邻。」在这里新增、审查或更新与邻居们的友情互链关系。'
  if (route.name === 'Files') return '「分流收纳，随时取用。在此统一管理上传的本地或云端文件与图片内容。」'
  return '「独属于你的档案空间，安静地书写生活与技术思考。」'
})

const themeLabel = computed(() => (theme.value === 'dark' ? '切换到浅色模式' : '切换到深色模式'))

const applyTheme = (nextTheme: ThemeMode) => {
  theme.value = nextTheme
  localStorage.setItem('atlas_theme', nextTheme)
  document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  window.dispatchEvent(new CustomEvent('atlas-theme-change', { detail: { theme: nextTheme } }))
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed.value))
  window.dispatchEvent(new CustomEvent('admin-sidebar-resize'))
}

const toggleMobileSidebar = () => {
  isMobileCollapsed.value = !isMobileCollapsed.value
}

const closeMobileSidebar = () => {
  isMobileCollapsed.value = true
}

const handleDisabledClick = (label: string) => {
  message.info(`「${label}」功能即将开放，敬请期待！`)
}

const handleLogout = () => {
  dialog.warning({
    title: '退出后台',
    content: '当前登录状态会被清除，未保存的编辑内容不会自动提交。',
    positiveText: '退出',
    negativeText: '继续编辑',
    onPositiveClick: () => {
      localStorage.removeItem('satoken')
      message.success('已退出后台')
      router.push('/login')
    }
  })
}

onMounted(() => {
  theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'

  // 恢复之前的侧边栏折叠状态
  const savedCollapsed = localStorage.getItem('admin_sidebar_collapsed')
  if (savedCollapsed !== null) {
    isCollapsed.value = savedCollapsed === 'true'
  }
})
</script>

<style scoped>
.skip-link {
  position: fixed;
  left: 1rem;
  top: 1rem;
  z-index: 60;
  transform: translateY(-160%);
  border-radius: 999px;
  background: var(--archive-text);
  color: var(--archive-bg);
  padding: 0.65rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 700;
  transition: transform 180ms ease;
}

.skip-link:focus {
  transform: translateY(0);
}
</style>
