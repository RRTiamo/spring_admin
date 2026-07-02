<template>
  <div class="space-y-6">
    <div class="archive-card p-5 sm:p-6 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl">
      <h3 class="m-0 text-base font-760 text-(--archive-text) flex items-center gap-2">
        <span class="i-mdi-robot-outline text-lg tone-accent"></span>
        AI 服务配置 (DeepSeek)
      </h3>
      <p class="tone-muted text-xs mt-1">配置博客文章发布时的 AI 简介生成服务。建议在此输入您的 API 密钥，在数据库中我们会以加密算法安全保存，避免泄漏。</p>

      <n-form label-placement="top" class="mt-6 space-y-4 max-w-xl">
        <n-form-item label="DeepSeek API 密钥 (api-key)">
          <n-input 
            v-model:value="aiConfig.apiKey" 
            type="password" 
            show-password-on="click" 
            placeholder="例如: sk-xxxxxxxxxxxx" 
            class="archive-input" 
            clearable 
          />
        </n-form-item>
        
        <n-form-item label="API 基础 URL (base-url)">
          <n-input 
            v-model:value="aiConfig.baseUrl" 
            placeholder="例如: https://api.deepseek.com/v1 或火山引擎端点" 
            class="archive-input" 
            clearable 
          />
        </n-form-item>

        <n-form-item label="指定模型名称 (model-name)">
          <n-input 
            v-model:value="aiConfig.modelName" 
            placeholder="例如: deepseek-chat 或 deepseek-v3-2-251201" 
            class="archive-input" 
            clearable 
          />
        </n-form-item>

        <div class="pt-2 flex justify-end">
          <n-button type="primary" :loading="saving" class="archive-btn" @click="handleSave">
            <template #icon><span class="i-mdi-content-save-outline"></span></template>
            应用 AI 配置
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

const aiConfig = ref({
  apiKey: '',
  baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
  modelName: 'deepseek-v3-2-251201'
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
      
      aiConfig.value.apiKey = getValue('deepseek.api-key', '')
      aiConfig.value.baseUrl = getValue('deepseek.base-url', 'https://ark.cn-beijing.volces.com/api/v3')
      aiConfig.value.modelName = getValue('deepseek.model-name', 'deepseek-v3-2-251201')
    }
  } catch (err) {
    console.error('Failed to load AI config', err)
  }
}

const handleSave = async () => {
  saving.value = true
  const token = localStorage.getItem('satoken')
  
  const payload = [
    { configKey: 'deepseek.api-key', configValue: aiConfig.value.apiKey || '', description: 'DeepSeek API 密钥' },
    { configKey: 'deepseek.base-url', configValue: aiConfig.value.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3', description: 'DeepSeek API 基础地址' },
    { configKey: 'deepseek.model-name', configValue: aiConfig.value.modelName || 'deepseek-v3-2-251201', description: 'DeepSeek 模型名称' }
  ]
  
  try {
    const response = await request.post('/config/update-batch', payload, {
      headers: { satoken: token }
    })
    
    if (response.data && response.data.code === 200) {
      message.success('AI 服务配置应用成功！')
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
