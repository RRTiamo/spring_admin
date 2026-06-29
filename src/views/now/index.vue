<template>
  <div class="now-desk space-y-6">
    <!-- 顶部状态管理 Card -->
    <div class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md">
      <div class="flex items-start gap-3">
        <span class="i-mdi-clock-outline text-3xl text-(--archive-accent) mt-0.5 animate-pulse"></span>
        <div class="flex flex-col text-left">
          <h3 class="text-lg font-bold text-(--archive-text) tracking-wide">此时此刻 (Now) 状态管理</h3>
          <p class="text-xs text-(--archive-text)/60 mt-1 leading-relaxed max-w-[48rem]">
            在这里编辑前台 <code>/now</code> 页面展示的所有状态卡片。编辑保存后会立刻持久化到系统配置中，前台刷新即可见。
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button 
          class="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl border border-(--archive-border) hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all text-(--archive-text) cursor-pointer"
          @click="handleResetDefault"
        >
          恢复默认数据
        </button>
        <button 
          class="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          :disabled="saving"
          @click="handleSave"
        >
          <span v-if="saving" class="i-mdi-loading animate-spin"></span>
          <span v-else class="i-mdi-check"></span>
          <span>保存全部修改</span>
        </button>
      </div>
    </div>

    <!-- 精致的配置面板表单 -->
    <NowStatusForm
      v-model:formModel="formModel"
      :saving="saving"
      :upload-headers="uploadHeaders"
      :light-color-options="lightColorOptions"
      @save-module="handleSaveCurrentModule"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { getConfigList, updateConfigBatch } from '@/api/config'

// 导入子组件
import NowStatusForm from './components/NowStatusForm.vue'

const message = useMessage()
const saving = ref(false)

const defaultData = {
  location: {
    name: '中国 · 江苏南京',
    coordinates: '32.0603° N, 118.7969° E · Alt: 35m',
    mapText: '南京 NJ.SYS',
    desc: '暂别申城的梧桐微风，回归金陵古城的山水形胜。在秦淮河畔与玄武湖光里，寻回更沉静的生活韵律，专注以代码和银盐记录此时此刻。'
  },
  mood: {
    title: 'Quiet / 静谧而专注',
    status: 'Concentrating · Digital Detox',
    desc: '屏蔽外界大部分杂乱信息，专注在编辑器逻辑与黑白暗房冲洗里，在日常生活的细微叙事中建立物理秩序。',
    stats: {
      focus: 85,
      creative: 75,
      calm: 90,
      energy: 60,
      social: 40,
      physical: 70
    }
  },
  focus: {
    title: '春风不解别离',
    subtitle: 'Front-end Micro-Interactions',
    desc: '调试精细的 GSAP 滚动裁剪层 and Lenis 触控摩擦物理模型，探寻屏幕里如同杂志纸页 of 沉稳质感。',
    code: 'gsap.to(".viewport", { ease: "power4.out" })'
  },
  reading: {
    title: 'The Order of Time',
    author: 'ROVELLI',
    quote: '“世界不是物体的集合，而是事件的集合。从时间跨度来看，世界在流动。”',
    progress: 68,
    pageDesc: 'Page 204/300',
    coverUrl: ''
  },
  listening: {
    title: 'You Must Believe in Spring',
    subtitle: 'Bill Evans Trio (1977) · Jazz',
    vinylText: 'BILL EVANS',
    desc: '忧郁而明亮的小调钢琴旋律，黑胶唱片特有的静电微噪点与琴音，极其契合江南 of 阴雨黄昏。'
  },
  setup: {
    descText: '在数字比特的严密逻辑与感光溴化银 of 物理颗粒之间，探寻并记录生活的两面。',
    devices: [
      {
        name: 'MacBook Pro',
        spec: '14-inch / M-Series',
        type: 'Digital Base / 调试终端',
        badge: 'TS · NEXT.JS',
        lightColor: 'bg-emerald-500 shadow-emerald-500/50',
        desc: '运行与调试 TypeScript 逻辑，打磨像素交互细节'
      },
      {
        name: 'Leica M6',
        spec: 'Classic Rangefinder',
        type: 'Analog Soul / 银盐旁轴',
        badge: '35MM FILM',
        lightColor: 'bg-red-500 shadow-red-500/50',
        desc: '装填 35mm 银盐反转片，以物理快门对焦城市叙事'
      },
      {
        name: 'Contax T2',
        spec: 'Carl Zeiss Sonnar 38mm',
        type: 'Compact Pocket / 随身行纪',
        badge: 'ZEISS T*',
        lightColor: 'bg-amber-500 shadow-amber-500/50',
        desc: '袖珍钛合金机身，记录生活日常 of 无声切片'
      }
    ]
  },
  radio: {
    bgmList: [
      { title: 'You Must Believe in Spring', artist: 'Bill Evans', src: '/assets/music/bill-evans.mp3' },
      { title: 'Merry Christmas Mr. Lawrence', artist: 'Ryuichi Sakamoto', src: '/assets/music/mr-lawrence.mp3' }
    ],
    noiseList: [
      { name: '林间细雨 (Rain)', src: '/assets/music/rain.mp3', icon: 'i-mdi-weather-rainy' },
      { name: '白噪放映机 (Projector)', src: '/assets/music/projector.mp3', icon: 'i-mdi-filmstrip' },
      { name: '壁炉柴火 (Fireplace)', src: '/assets/music/fireplace.mp3', icon: 'i-mdi-fire' }
    ]
  }
}

const formModel = ref(JSON.parse(JSON.stringify(defaultData)))

const uploadHeaders = computed(() => ({
  satoken: localStorage.getItem('satoken') || ''
}))

const lightColorOptions = [
  { label: '翡翠绿 (Active)', value: 'bg-emerald-500 shadow-emerald-500/50' },
  { label: '绯红赤 (Romantic/Film)', value: 'bg-red-500 shadow-red-500/50' },
  { label: '琥珀橙 (Warn/Daily)', value: 'bg-amber-500 shadow-amber-500/50' },
  { label: '幽兰蓝 (Cool)', value: 'bg-blue-500 shadow-blue-500/50' },
  { label: '锌钛灰 (Inactive)', value: 'bg-zinc-400/40 shadow-zinc-400/10' }
]

const handleResetDefault = () => {
  formModel.value = JSON.parse(JSON.stringify(defaultData))
  message.success('已恢复为默认初始状态文本，请记得点击右上角保存')
}

const loadNowConfig = async () => {
  try {
    const response = await getConfigList()
    if (response.data?.code === 200) {
      const list = response.data.data || []
      const item = list.find((c: any) => c.configKey === 'now.content.json')
      if (item && item.configValue) {
        try {
          const parsed = JSON.parse(item.configValue)
          
          // 深度防空兼容性初始化
          if (!parsed.location) parsed.location = { ...defaultData.location }
          if (!parsed.mood) parsed.mood = { ...defaultData.mood }
          if (!parsed.mood.stats) {
            parsed.mood.stats = { ...defaultData.mood.stats }
          } else {
            parsed.mood.stats.focus = parsed.mood.stats.focus ?? 85
            parsed.mood.stats.creative = parsed.mood.stats.creative ?? 75
            parsed.mood.stats.calm = parsed.mood.stats.calm ?? 90
            parsed.mood.stats.energy = parsed.mood.stats.energy ?? 60
            parsed.mood.stats.social = parsed.mood.stats.social ?? 40
            parsed.mood.stats.physical = parsed.mood.stats.physical ?? 70
          }
          if (!parsed.reading) parsed.reading = { ...defaultData.reading }
          if (parsed.reading.progress === undefined) parsed.reading.progress = 68
          if (parsed.reading.coverUrl === undefined) parsed.reading.coverUrl = ''
          if (!parsed.listening) parsed.listening = { ...defaultData.listening }
          if (!parsed.setup) parsed.setup = { ...defaultData.setup }
          if (!parsed.setup.devices) parsed.setup.devices = []
          if (!parsed.radio) parsed.radio = { ...defaultData.radio }
          if (!parsed.radio.bgmList) parsed.radio.bgmList = []
          if (!parsed.radio.noiseList) parsed.radio.noiseList = []
          
          formModel.value = parsed
        } catch (e) {
          console.error('Failed to parse now.content.json', e)
        }
      }
    }
  } catch (err) {
    console.error('Failed to load now config from backend', err)
  }
}

const handleSave = async () => {
  saving.value = true
  const payload = [
    {
      configKey: 'now.content.json',
      configValue: JSON.stringify(formModel.value),
      description: '前台此时此刻(Now)页面内容数据配置JSON'
    }
  ]

  try {
    const response = await updateConfigBatch(payload)
    if (response.data?.code === 200) {
      message.success('“此时此刻”全部配置保存成功，前台已同步')
      await loadNowConfig()
    } else {
      throw new Error(response.data?.msg || '保存失败')
    }
  } catch (err: any) {
    message.error(err.message || '配置提交失败，网络连接异常。')
  } finally {
    saving.value = false
  }
}

const handleSaveCurrentModule = async (moduleLabel: string) => {
  saving.value = true
  const payload = [
    {
      configKey: 'now.content.json',
      configValue: JSON.stringify(formModel.value),
      description: '前台此时此刻(Now)页面内容数据配置JSON'
    }
  ]

  try {
    const response = await updateConfigBatch(payload)
    if (response.data?.code === 200) {
      message.success(`“${moduleLabel}”配置保存成功，前台已同步`)
      await loadNowConfig()
    } else {
      throw new Error(response.data?.msg || '保存失败')
    }
  } catch (err: any) {
    message.error(err.message || '配置提交失败，网络连接异常。')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadNowConfig()
})
</script>
