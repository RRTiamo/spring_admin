<template>
  <div class="flex flex-col gap-4">
    <section class="archive-card p-4 sm:p-5">
      <h3 class="m-0 text-lg font-760 text-(--archive-text) flex items-center gap-1.5">
        <span class="i-mdi-chart-box-outline text-xl tone-accent"></span>
        恋爱陪伴数据指标
      </h3>
      <p class="tone-muted text-xs mt-1">这里配置的数据将显示在博客前台展示页面的最顶部“数据馆”卡片中。</p>
    </section>

    <section class="archive-card p-5 sm:p-6">
      <n-form :model="statsModel" label-placement="top" class="max-w-xl">
        <n-form-item label="恋爱纪念日（开始日期）" path="startDate">
          <n-date-picker v-model:value="statsModel.startDate" type="date" placeholder="选择恋爱纪念日" class="w-full" />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="共同去过的城市数" path="citiesCount">
            <n-input-number v-model:value="statsModel.citiesCount" :min="0" class="w-full" />
          </n-form-item>
          <n-form-item label="共同飞行里程 (公里)" path="flightDistance">
            <n-input-number v-model:value="statsModel.flightDistance" :min="0" class="w-full" />
          </n-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="共同看过的电影数" path="movieCount">
            <n-input-number v-model:value="statsModel.movieCount" :min="0" class="w-full" />
          </n-form-item>
          <n-form-item label="一起吃过的火锅/大餐数" path="mealCount">
            <n-input-number v-model:value="statsModel.mealCount" :min="0" class="w-full" />
          </n-form-item>
        </div>

        <div class="border-t border-(--archive-border)/40 pt-4 mt-2 flex justify-end">
          <n-button type="primary" :loading="savingStats" @click="handleSaveStats">
            <template #icon><span class="i-mdi-content-save-outline"></span></template>
            保存参数设置
          </n-button>
        </div>
      </n-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, NForm, NFormItem, NDatePicker, NInputNumber, NButton } from 'naive-ui'
import { getConfigList, updateConfigBatch } from '@/api/config'

const message = useMessage()
// statsModel conforms structure of LoveStats with startDate represented as timestamp locally
const statsModel = ref({
  startDate: Date.now(),
  citiesCount: 0,
  flightDistance: 0,
  movieCount: 0,
  mealCount: 0
})
const savingStats = ref(false)

const fetchStats = async () => {
  try {
    const response = await getConfigList()
    if (response.data?.code !== 200) return
    const list = response.data.data || []
    const getValue = (key: string, def: string) => {
      const item = list.find((c: any) => c.configKey === key)
      return item ? item.configValue : def
    }

    const dateStr = getValue('love.stats.startDate', '2023-05-20')
    statsModel.value.startDate = new Date(dateStr).getTime()
    statsModel.value.citiesCount = Number(getValue('love.stats.citiesCount', '0'))
    statsModel.value.flightDistance = Number(getValue('love.stats.flightDistance', '0'))
    statsModel.value.movieCount = Number(getValue('love.stats.movieCount', '0'))
    statsModel.value.mealCount = Number(getValue('love.stats.mealCount', '0'))
  } catch (err) {
    console.error('Failed to load stats', err)
  }
}

const handleSaveStats = async () => {
  savingStats.value = true
  const dateStr = new Date(statsModel.value.startDate).toISOString().split('T')[0]
  
  const payload = [
    { configKey: 'love.stats.startDate', configValue: dateStr },
    { configKey: 'love.stats.citiesCount', configValue: String(statsModel.value.citiesCount) },
    { configKey: 'love.stats.flightDistance', configValue: String(statsModel.value.flightDistance) },
    { configKey: 'love.stats.movieCount', configValue: String(statsModel.value.movieCount) },
    { configKey: 'love.stats.mealCount', configValue: String(statsModel.value.mealCount) }
  ]

  try {
    const response = await updateConfigBatch(payload)
    if (response.data?.code !== 200) {
      throw new Error(response.data?.msg || '保存失败')
    }
    message.success('陪伴数据参数更新成功')
  } catch (err: any) {
    console.error('Failed to save stats config', err)
    message.error('保存失败，请检查后端运行状态')
  } finally {
    savingStats.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>
