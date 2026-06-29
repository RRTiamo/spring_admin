<template>
  <div class="flex flex-col gap-4">
    <section class="archive-card p-4 sm:p-5">
      <div class="flex items-center justify-between">
        <h3 class="m-0 text-lg font-760 text-(--archive-text) flex items-center gap-1.5">
          <span class="i-mdi-email-open-outline text-xl tone-accent"></span>
          时光信箱与未来信
        </h3>
        <n-button type="primary" @click="openCreateCapsule">
          <template #icon><span class="i-mdi-plus"></span></template>
          写封信给未来
        </n-button>
      </div>
    </section>

    <!-- 时光胶囊列表 -->
    <section class="archive-card p-4 sm:p-5">
      <n-table :bordered="false" :single-line="false" class="w-full">
        <thead>
          <tr>
            <th width="30%">信件主题</th>
            <th width="15%">发信人</th>
            <th width="15%">收信人</th>
            <th width="15%">书写日期</th>
            <th width="15%">开启日期</th>
            <th width="10%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in capsules" :key="c.id">
            <td class="font-700 text-(--archive-text)">
              <span class="flex items-center gap-1">
                <span v-if="isCapsuleLocked(c.openDate)" class="i-mdi-lock-outline text-amber-500"></span>
                <span v-else class="i-mdi-lock-open-variant-outline text-green-500"></span>
                {{ c.title }}
              </span>
            </td>
            <td>{{ c.sender }}</td>
            <td>{{ c.receiver }}</td>
            <td class="tone-muted text-xs">{{ c.writeDate }}</td>
            <td class="tone-muted text-xs">
              <span :class="{ 'text-amber-500 font-600': isCapsuleLocked(c.openDate) }">
                {{ c.openDate }}
              </span>
            </td>
            <td>
              <n-space>
                <n-button size="tiny" secondary @click="openEditCapsule(c)">编辑</n-button>
                <n-button size="tiny" secondary type="error" @click="handleDeleteCapsule(c.id)">删除</n-button>
              </n-space>
            </td>
          </tr>
          <tr v-if="capsules.length === 0">
            <td colspan="6" class="text-center tone-muted py-6">时光信箱空空如也，写一封信存放在这里吧。</td>
          </tr>
        </tbody>
      </n-table>
    </section>

    <!-- 时光胶囊编辑模态框 -->
    <n-modal
      v-model:show="showCapsuleModal"
      preset="card"
      :title="isEditCapsule ? '编辑时光胶囊' : '写封信给未来'"
      class="w-[90vw] max-w-[500px]"
    >
      <n-form ref="capsuleFormRef" :model="capsuleForm" label-placement="top">
        <n-form-item label="信件主题" path="title" required>
          <n-input v-model:value="capsuleForm.title" placeholder="如：三周年写给未来的彼此" />
        </n-form-item>
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="写信人" path="sender">
            <n-input v-model:value="capsuleForm.sender" placeholder="他 / 她 / 共同" />
          </n-form-item>
          <n-form-item label="收信人" path="receiver">
            <n-input v-model:value="capsuleForm.receiver" placeholder="他 / 她 / 共同" />
          </n-form-item>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="书写日期" path="writeDate">
            <n-input v-model:value="capsuleForm.writeDate" placeholder="如：2026-05-20" />
          </n-form-item>
          <n-form-item label="开启日期 (锁定至此日)" path="openDate" required>
            <n-input v-model:value="capsuleForm.openDate" placeholder="如：2027-05-20" />
          </n-form-item>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="解密秘钥 (用于提前开启)" path="bypassCode">
            <n-input v-model:value="capsuleForm.bypassCode" placeholder="时空密钥/非必填" />
          </n-form-item>
          <n-form-item label="胶囊预告提示 (prompt)" path="prompt">
            <n-input v-model:value="capsuleForm.prompt" placeholder="关于该胶囊的预告提示" />
          </n-form-item>
        </div>
        <n-form-item label="信件密封内容" path="content" required>
          <n-input v-model:value="capsuleForm.content" type="textarea" :rows="6" placeholder="写下你想对未来自己或对方说的话，未到期前页面上将物理无法查看..." />
        </n-form-item>
        <div class="flex justify-end gap-3 mt-4 pt-3 border-t border-(--archive-border)/40">
          <n-button size="small" @click="showCapsuleModal = false">取消</n-button>
          <n-button size="small" type="primary" @click="handleSaveCapsule">封装并封存</n-button>
        </div>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, useDialog, NButton, NTable, NSpace, NModal, NForm, NFormItem, NInput } from 'naive-ui'
import { getLoveCapsuleList, createLoveCapsule, updateLoveCapsule, deleteLoveCapsule } from '@/api/love'
import type { TimeCapsule } from '@/interface/love'

const message = useMessage()
const dialog = useDialog()
const capsules = ref<TimeCapsule[]>([])
const showCapsuleModal = ref(false)
const isEditCapsule = ref(false)

const capsuleForm = ref({
  id: 0,
  title: '',
  sender: '共同',
  receiver: '共同',
  writeDate: new Date().toISOString().split('T')[0],
  openDate: '',
  content: '',
  bypassCode: '',
  prompt: ''
})

const fetchCapsules = async () => {
  try {
    const response = await getLoveCapsuleList()
    if (response.data?.code !== 200) return
    capsules.value = response.data.data
  } catch (err) {
    console.error('Failed to load capsules', err)
  }
}

const isCapsuleLocked = (openDateStr: string) => {
  if (!openDateStr) return false
  try {
    const dateOnly = openDateStr.split(' ')[0].split('T')[0]
    const openDate = new Date(dateOnly)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today < openDate
  } catch (e) {
    return false
  }
}

const openCreateCapsule = () => {
  isEditCapsule.value = false
  capsuleForm.value = {
    id: 0,
    title: '',
    sender: '共同',
    receiver: '共同',
    writeDate: new Date().toISOString().split('T')[0],
    openDate: '',
    content: '',
    bypassCode: '',
    prompt: ''
  }
  showCapsuleModal.value = true
}

const openEditCapsule = (c: any) => {
  isEditCapsule.value = true
  capsuleForm.value = { ...c }
  showCapsuleModal.value = true
}

const handleSaveCapsule = async () => {
  if (!capsuleForm.value.title.trim() || !capsuleForm.value.openDate.trim() || !capsuleForm.value.content.trim()) {
    message.warning('请补充完整标题、开启日期及信件内容')
    return
  }
  try {
    const response = isEditCapsule.value
      ? await updateLoveCapsule(capsuleForm.value)
      : await createLoveCapsule(capsuleForm.value)
    
    if (response.data?.code !== 200) {
      message.error(response.data?.msg || '操作失败')
      return
    }
    message.success('信件已成功封存入数字胶囊')
    showCapsuleModal.value = false
    fetchCapsules()
  } catch (err) {
    message.error('操作失败')
  }
}

const handleDeleteCapsule = (id: number) => {
  dialog.warning({
    title: '确认删除',
    content: '确认删除此时光胶囊信件吗？一旦损毁将不可恢复！',
    positiveText: '确认销毁',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteLoveCapsule(id)
        if (response.data?.code !== 200) return
        message.success('胶囊已销毁')
        fetchCapsules()
      } catch (err) {
        message.error('删除失败')
      }
    }
  })
}

onMounted(() => {
  fetchCapsules()
})
</script>
