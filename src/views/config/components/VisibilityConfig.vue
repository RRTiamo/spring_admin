<template>
  <div class="space-y-6">
    <div class="archive-card p-5 sm:p-6 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl">
      <h3 class="m-0 text-base font-760 text-(--archive-text) flex items-center gap-2">
        <span class="i-mdi-view-dashboard-outline text-lg tone-accent"></span>
        前台入口与页面可见性配置
      </h3>
      <p class="tone-muted text-xs mt-1">控制前台主导航上恋爱各个业务子板块（如“恋爱瞬间”、“岁月信件”、“目前状态”等）入口的展示开关。</p>

      <n-form label-placement="left" class="mt-6 space-y-6 max-w-4xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <!-- 1. 恋爱纪实 -->
          <div class="flex items-center justify-between py-2.5 border-b border-(--archive-border)/40">
            <div>
              <p class="m-0 text-sm font-700 text-(--archive-text) flex items-center gap-1.5">
                <span class="i-mdi-heart-pulse tone-accent"></span> 恋爱纪实 (Love Diary)
              </p>
              <p class="m-0 mt-0.5 text-xs tone-muted">控制恋爱瞬间、百事打卡清单、恋爱日记前台主导航可见性。</p>
            </div>
            <n-switch v-model:value="page.loveEnable" />
          </div>

          <!-- 2. 岁月信件 -->
          <div class="flex items-center justify-between py-2.5 border-b border-(--archive-border)/40">
            <div>
              <p class="m-0 text-sm font-700 text-(--archive-text) flex items-center gap-1.5">
                <span class="i-mdi-email-outline tone-accent"></span> 岁月信件 (Letters)
              </p>
              <p class="m-0 mt-0.5 text-xs tone-muted">控制前台是否能够进入“岁月信件与时光胶囊”密码信箱界面。</p>
            </div>
            <n-switch v-model:value="page.letterEnable" />
          </div>

          <!-- 3. 此时时刻 -->
          <div class="flex items-center justify-between py-2.5 border-b border-(--archive-border)/40">
            <div>
              <p class="m-0 text-sm font-700 text-(--archive-text) flex items-center gap-1.5">
                <span class="i-mdi-flash-outline tone-accent"></span> 此时时刻 (Now Page)
              </p>
              <p class="m-0 mt-0.5 text-xs tone-muted">是否展示博主个人当前专注状态、目前心境及听歌阅读看板。</p>
            </div>
            <n-switch v-model:value="page.nowEnable" />
          </div>

          <!-- 4. 岁月足迹 -->
          <div class="flex items-center justify-between py-2.5 border-b border-(--archive-border)/40">
            <div>
              <p class="m-0 text-sm font-700 text-(--archive-text) flex items-center gap-1.5">
                <span class="i-mdi-earth tone-accent"></span> 岁月足迹 (Footprints)
              </p>
              <p class="m-0 mt-0.5 text-xs tone-muted">控制前台高德/OSM地图的影像足迹、旅行航迹页面入口。</p>
            </div>
            <n-switch v-model:value="page.footprintsEnable" />
          </div>

          <!-- 5. 关于作者 -->
          <div class="flex items-center justify-between py-2.5 border-b border-(--archive-border)/40">
            <div>
              <p class="m-0 text-sm font-700 text-(--archive-text) flex items-center gap-1.5">
                <span class="i-mdi-account-box-outline tone-accent"></span> 关于作者 (About Author)
              </p>
              <p class="m-0 mt-0.5 text-xs tone-muted">控制博主个人成长时间线、心路历程、装备与技能树页面入口。</p>
            </div>
            <n-switch v-model:value="page.aboutEnable" />
          </div>

          <!-- 6. 鱼塘反馈 -->
          <div class="flex items-center justify-between py-2.5 border-b border-(--archive-border)/40">
            <div>
              <p class="m-0 text-sm font-700 text-(--archive-text) flex items-center gap-1.5">
                <span class="i-mdi-fish tone-accent"></span> 鱼塘反馈 (Pond Feedback)
              </p>
              <p class="m-0 mt-0.5 text-xs tone-muted">控制前台倾听倾诉、留言板及用户反馈页面入口。</p>
            </div>
            <n-switch v-model:value="page.pondEnable" />
          </div>
        </div>

        <!-- 安全访问口令配置 -->
        <div class="pt-6 border-t border-(--archive-border)/40 space-y-4">
          <h4 class="m-0 text-sm font-700 text-(--archive-text) flex items-center gap-1.5">
            <span class="i-mdi-lock-open-outline tone-accent"></span>
            安全访问与私密档案口令 (Access Passcode)
          </h4>
          <p class="m-0 text-xs tone-muted">设置前台解锁全站随笔加密区、私密恋爱归档所使用的全局安全访问口令（默认：2026）。</p>
          <n-form-item label="全局解密口令" :show-feedback="false">
            <n-input 
              v-model:value="passcode" 
              type="password" 
              show-password-on="mousedown" 
              placeholder="请输入安全访问口令，如 2026" 
              class="archive-input max-w-xs font-mono" 
            />
          </n-form-item>
        </div>

        <div class="pt-4 flex justify-end">
          <n-button type="primary" :loading="saving" @click="handleSave">
            <template #icon><span class="i-mdi-content-save-outline"></span></template>
            应用可见性配置
          </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, NForm, NSwitch, NButton, NInput, NFormItem } from 'naive-ui'
import request from '@/api/request'

const message = useMessage()
const saving = ref(false)

const page = ref({
  loveEnable: true,
  letterEnable: true,
  nowEnable: true,
  aboutEnable: true,
  footprintsEnable: true,
  pondEnable: true
})

const passcode = ref('2026')

const fetchConfigs = async () => {
  try {
    const token = localStorage.getItem('satoken')
    const response = await request.get('/config/list', {
      headers: { satoken: token }
    })
    
    if (response.data && response.data.code === 200) {
      const list = response.data.data || []
      const getValue = (key: string, def: string) => {
        const item = list.find((c: any) => c.configKey === key)
        return item ? item.configValue : def
      }

      page.value.loveEnable = getValue('page.love.enable', 'true') === 'true'
      page.value.letterEnable = getValue('page.letter.enable', 'true') === 'true'
      page.value.nowEnable = getValue('page.now.enable', 'true') === 'true'
      page.value.aboutEnable = getValue('page.about.enable', 'true') === 'true'
      page.value.footprintsEnable = getValue('page.footprints.enable', 'true') === 'true'
      page.value.pondEnable = getValue('page.pond.enable', 'true') === 'true'
      passcode.value = getValue('site.access.passcode', '2026')
    }
  } catch (err) {
    console.error('Failed to load visibility configs', err)
  }
}

const handleSave = async () => {
  saving.value = true
  const token = localStorage.getItem('satoken')

  const payload = [
    { configKey: 'page.love.enable', configValue: String(page.value.loveEnable), description: '是否开启“恋爱纪实”页面及导航入口' },
    { configKey: 'page.letter.enable', configValue: String(page.value.letterEnable), description: '是否开启“岁月信件”页面及导航入口' },
    { configKey: 'page.now.enable', configValue: String(page.value.nowEnable), description: '是否开启“目前状态”页面及导航入口' },
    { configKey: 'page.about.enable', configValue: String(page.value.aboutEnable), description: '是否开启“关于作者”页面及导航入口' },
    { configKey: 'page.footprints.enable', configValue: String(page.value.footprintsEnable), description: '是否开启“岁月足迹”页面及导航入口' },
    { configKey: 'page.pond.enable', configValue: String(page.value.pondEnable), description: '是否开启“鱼塘反馈”页面及导航入口' },
    { configKey: 'site.access.passcode', configValue: String(passcode.value), description: '全站随笔及恋爱私密档案全局访问口令' }
  ]

  try {
    const response = await request.post('/config/update-batch', payload, {
      headers: { satoken: token }
    })
    
    if (response.data && response.data.code === 200) {
      message.success('可见性配置已成功保存')
      await fetchConfigs()
    } else {
      throw new Error(response.data?.msg || '保存失败')
    }
  } catch (err: any) {
    message.error(err.message || '网络连接失败，配置保存失败。')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchConfigs()
})
</script>
