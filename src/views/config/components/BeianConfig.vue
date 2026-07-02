<template>
  <div class="space-y-6">
    <div class="archive-card p-5 sm:p-6 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl">
      <h3 class="m-0 text-base font-760 text-(--archive-text) flex items-center gap-2">
        <span class="i-mdi-shield-check-outline text-lg tone-accent"></span>
        站点备案与合规管理
      </h3>
      <p class="tone-muted text-xs mt-1">配置博客页脚展示的工信部 ICP 备案号和公安联网备案号及其相应的跳转链接。</p>

      <n-form label-placement="top" class="mt-6 space-y-4 max-w-xl">
        <n-form-item label="工信部 ICP 备案号">
          <n-input v-model:value="beian.icp" placeholder="例如: 滇ICP备2025004561号-1" class="archive-input" clearable />
        </n-form-item>
        
        <n-form-item label="工信部 ICP 备案跳转链接">
          <n-input v-model:value="beian.icpUrl" placeholder="例如: https://beian.miit.gov.cn/" class="archive-input" clearable />
        </n-form-item>

        <n-form-item label="公安联网备案号">
          <n-input v-model:value="beian.police" placeholder="例如: 滇公网安备 53090202000123号" class="archive-input" clearable />
        </n-form-item>

        <n-form-item label="公安联网备案跳转链接">
          <n-input v-model:value="beian.policeUrl" placeholder="例如: http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=53090202000123" class="archive-input" clearable />
        </n-form-item>

        <div class="pt-2 flex justify-end">
          <n-button type="primary" :loading="saving" class="archive-btn" @click="handleSave">
            <template #icon><span class="i-mdi-content-save-outline"></span></template>
            应用备案配置
          </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, NForm, NFormItem, NInput, NButton } from 'naive-ui'
import request from '@/api/request'

const message = useMessage()
const saving = ref(false)

const beian = ref({
  icp: '',
  icpUrl: 'https://beian.miit.gov.cn/',
  police: '',
  policeUrl: ''
})

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
      
      beian.value.icp = getValue('site.beian.icp', '')
      beian.value.icpUrl = getValue('site.beian.icpUrl', 'https://beian.miit.gov.cn/')
      beian.value.police = getValue('site.beian.police', '')
      beian.value.policeUrl = getValue('site.beian.policeUrl', '')
    }
  } catch (err) {
    console.error('Failed to load beian config', err)
  }
}

const handleSave = async () => {
  saving.value = true
  const token = localStorage.getItem('satoken')
  
  const payload = [
    { configKey: 'site.beian.icp', configValue: beian.value.icp || '', description: '工信部ICP备案号' },
    { configKey: 'site.beian.icpUrl', configValue: beian.value.icpUrl || 'https://beian.miit.gov.cn/', description: '工信部ICP备案跳转链接' },
    { configKey: 'site.beian.police', configValue: beian.value.police || '', description: '公安联网备案号' },
    { configKey: 'site.beian.policeUrl', configValue: beian.value.policeUrl || '', description: '公安联网备案跳转链接' }
  ]
  
  try {
    const response = await request.post('/config/update-batch', payload, {
      headers: { satoken: token }
    })
    
    if (response.data && response.data.code === 200) {
      message.success('备案信息配置应用成功！')
      window.dispatchEvent(new CustomEvent('atlas-config-changed'))
      await fetchConfigs()
    } else {
      throw new Error(response.data?.msg || '保存失败')
    }
  } catch (err: any) {
    message.error(err.message || '配置保存失败，请检查连接。')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchConfigs()
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
