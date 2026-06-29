<template>
  <div class="pond-desk h-full flex flex-col gap-6">
    <!-- 顶部检索状态栏 -->
    <div
      class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md select-none shrink-0"
    >
      <div class="flex items-start gap-3.5 text-left">
        <div class="h-12 w-12 rounded-2xl bg-(--archive-accent)/10 text-(--archive-accent) flex items-center justify-center shrink-0">
          <span class="i-mdi-fish text-2xl animate-pulse"></span>
        </div>
        <div class="flex flex-col">
          <h3 class="text-lg font-bold text-(--archive-text) tracking-wide">鱼塘反馈管理</h3>
          <p class="text-xs text-(--archive-text)/60 mt-1 leading-relaxed">
            个人博客鱼塘来信整理台。在这里您可以审核小鱼留言、追加博主回复、打标签分类或采纳方案。
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索昵称或内容..."
          clearable
          size="small"
          class="archive-input min-w-45 grow sm:grow-0"
        >
          <template #prefix>
            <span class="i-mdi-magnify tone-muted"></span>
          </template>
        </n-input>

        <n-select
          v-model:value="filterCategory"
          :options="categoryOptions"
          placeholder="筛选类型"
          size="small"
          class="archive-select min-w-30"
        />

        <n-button
          size="small"
          type="info"
          secondary
          class="archive-btn !rounded-xl"
          @click="openTypeManagerModal"
        >
          <template #icon>
            <span class="i-mdi-format-list-bulleted-type"></span>
          </template>
          分类管理
        </n-button>

        <n-button
          size="small"
          type="warning"
          secondary
          class="archive-btn !rounded-xl"
          @click="openTagManagerModal"
        >
          <template #icon>
            <span class="i-mdi-tag-multiple-outline"></span>
          </template>
          标签库
        </n-button>

        <n-button
          size="small"
          type="primary"
          secondary
          class="archive-btn !rounded-xl"
          :loading="loading"
          @click="loadFeedbacks(false)"
        >
          <template #icon>
            <span class="i-mdi-refresh"></span>
          </template>
          刷新
        </n-button>
      </div>
    </div>

    <!-- 主体分栏区 -->
    <div class="grow flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden items-stretch">
      <!-- 左侧：信件收件箱 -->
      <FeedbackTable
        v-model:page="page"
        :paginated-feedbacks="paginatedFeedbacks"
        :filtered-feedbacks="filteredFeedbacks"
        :current-feedback="currentFeedback"
        :active-tab="activeTab"
        :page-size="pageSize"
        :loading="loading"
        :all-types="allTypes"
        @select="selectFeedback"
        @toggle-public="handleTogglePublic"
        @tab-change="handleTabChange"
        @page-change="handlePageChange"
      />

      <!-- 右侧：信件详情与回复 -->
      <FeedbackReader
        v-model:selectedTagIds="selectedTagIds"
        v-model:replyContent="replyContent"
        v-model:adoptNote="adoptNote"
        :current-feedback="currentFeedback"
        :all-tags="allTags"
        :saving-tags="savingTags"
        :submitting-reply="submittingReply"
        :submitting-adopt="submittingAdopt"
        :all-types="allTypes"
        @toggle-public="handleTogglePublic"
        @bind-tags="handleBindTags"
        @reply="handleReplySubmit"
        @adopt="handleAdoptSubmit"
        @action="handleWorkflowAction"
      />
    </div>

    <!-- 标签库管理弹窗 -->
    <TagsManagerModal
      v-model:showTagManagerModal="showTagManagerModal"
      v-model:tagForm="tagForm"
      :all-tags="allTags"
      :submitting-tag="submittingTag"
      :editing-tag-id="editingTagId"
      @save-tag="handleTagFormSubmit"
      @edit-tag="startEditTag"
      @delete-tag="handleDeleteTag"
      @cancel-edit="cancelTagEdit"
    />

    <!-- 反馈类型管理弹窗 -->
    <FeedbackTypeManagerModal
      v-model:showTypeManagerModal="showTypeManagerModal"
      v-model:typeForm="typeForm"
      :all-types="allTypes"
      :submitting="submittingType"
      :editing-type-id="editingTypeId"
      @save-type="handleTypeFormSubmit"
      @edit-type="startEditType"
      @delete-type="handleDeleteType"
      @cancel-edit="cancelTypeEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { NInput, NSelect, NButton, useMessage, useDialog } from 'naive-ui'
import {
  getFeedbackList,
  approveFeedback,
  rejectFeedback,
  completeFeedback,
  getFeedbackTags,
  updateFeedbackTags,
  replyFeedback,
  adoptFeedback,
  createTag,
  updateTag,
  deleteTag,
  getFeedbackTypes,
  createFeedbackType,
  updateFeedbackType,
  deleteFeedbackType
} from '@/api/pond'
import { gsap } from 'gsap'
import type { Feedback, FeedbackTag } from '@/interface/love'

// 导入子组件
import FeedbackTable from './components/FeedbackTable.vue'
import FeedbackReader from './components/FeedbackReader.vue'
import TagsManagerModal from './components/TagsManagerModal.vue'
import FeedbackTypeManagerModal, { type FeedbackType } from './components/FeedbackTypeManagerModal.vue'

const message = useMessage()
const dialog = useDialog()

const searchQuery = ref('')
const filterCategory = ref('all')
const activeTab = ref('all')
const page = ref(1)
const pageSize = ref(5)

const feedbacks = ref<Feedback[]>([])
const loading = ref(false)

const currentFeedback = ref<Feedback | null>(null)
const replyContent = ref('')
const adoptNote = ref('')
const selectedTagIds = ref<number[]>([])

// 标签管理相关状态
const showTagManagerModal = ref(false)
const editingTagId = ref<number | null>(null)
const tagForm = ref({ name: '', color: '#3b82f6' })
const submittingTag = ref(false)
const savingTags = ref(false)
const allTags = ref<FeedbackTag[]>([])

// 反馈类型管理相关状态
const showTypeManagerModal = ref(false)
const editingTypeId = ref<number | null>(null)
const typeForm = ref<FeedbackType>({ value: '', label: '', icon: 'i-mdi-tag', color: 'sky', sortOrder: 0 })
const submittingType = ref(false)
const allTypes = ref<FeedbackType[]>([])

const categoryOptions = computed(() => {
  const base = [{ label: '全部类型', value: 'all' }]
  const dynamic = allTypes.value.map(t => ({
    label: t.label,
    value: t.value
  }))
  return [...base, ...dynamic]
})

const filteredFeedbacks = computed(() => {
  const list = feedbacks.value.filter(fb => {
    const matchSearch = searchQuery.value.trim() === '' ||
      fb.nickname.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      fb.content.toLowerCase().includes(searchQuery.value.toLowerCase())

    let matchTab = false
    if (activeTab.value === 'all') {
      matchTab = true
    } else if (activeTab.value === 'approved') {
      matchTab = fb.status === 'approved' || fb.status === 'adopted' || fb.status === 'done'
    } else {
      matchTab = fb.status === activeTab.value
    }

    const matchCategory = filterCategory.value === 'all' || fb.category === filterCategory.value
    return matchSearch && matchTab && matchCategory
  })

  return list.sort((a, b) => {
    const pinA = a.isPinned ? 1 : 0
    const pinB = b.isPinned ? 1 : 0
    if (pinA !== pinB) return pinB - pinA
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const paginatedFeedbacks = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFeedbacks.value.slice(start, end)
})

const loadFeedbacks = async (syncDetails = false) => {
  loading.value = true
  try {
    const response = await getFeedbackList({
      page: 1,
      pageSize: 500,
      status: activeTab.value,
      category: filterCategory.value
    })
    if (response.data?.code === 200) {
      feedbacks.value = response.data.data || []

      if (syncDetails && currentFeedback.value) {
        const fresh = feedbacks.value.find(f => f.id === currentFeedback.value!.id)
        if (fresh) {
          currentFeedback.value = fresh
          selectedTagIds.value = fresh.tags ? fresh.tags.map(t => t.id) : []
        } else {
          currentFeedback.value = null
        }
      }
    }
  } catch (err) {
    console.error('Failed to load pond feedbacks', err)
    message.error('无法连接到后端鱼塘反馈服务。')
  } finally {
    loading.value = false
  }
}

const handleTabChange = (val: string) => {
  activeTab.value = val
  page.value = 1
  currentFeedback.value = null
  loadFeedbacks()
}

const handlePageChange = (val: number) => {
  page.value = val
  currentFeedback.value = null
}

const selectFeedback = (fb: Feedback) => {
  currentFeedback.value = fb
  selectedTagIds.value = fb.tags ? fb.tags.map(t => t.id) : []
  replyContent.value = ''
  adoptNote.value = fb.adoptedNote || ''

  nextTick(() => {
    requestAnimationFrame(animateReader)
  })
}

const animateReader = () => {
  const paper = document.querySelector('.feedback-reader-paper')
  if (paper) {
    gsap.killTweensOf(paper)
    gsap.fromTo(paper,
      { opacity: 0, rotateY: 8, scale: 0.98, transformOrigin: "left center" },
      { opacity: 1, rotateY: 0, scale: 1, duration: 0.45, ease: 'power2.out' }
    )
  }
}

const handleTogglePublic = async (fb: Feedback, val: boolean) => {
  if (val) {
    try {
      const res = await approveFeedback(fb.id)
      if (res.data?.code === 200) {
        message.success('审核已通过，小鱼已浮出水面展示 🎏')
        loadFeedbacks(true)
      }
    } catch (err: any) {
      message.error(`审核失败: ${err.message}`)
    }
  } else {
    try {
      const res = await rejectFeedback(fb.id)
      if (res.data?.code === 200) {
        message.success('已隐藏并拒绝展示此反馈')
        loadFeedbacks(true)
      }
    } catch (err: any) {
      message.error(`隐藏失败: ${err.message}`)
    }
  }
}

const handleWorkflowAction = async (status: string) => {
  if (!currentFeedback.value) return
  const id = currentFeedback.value.id
  try {
    let res
    if (status === 'rejected') {
      res = await rejectFeedback(id)
    } else if (status === 'approved') {
      res = await approveFeedback(id)
    } else if (status === 'done') {
      res = await completeFeedback(id)
    }
    if (res && res.data?.code === 200) {
      message.success('工作流状态已更新！')
      loadFeedbacks(true)
    }
  } catch (err: any) {
    message.error(`操作失败: ${err.message}`)
  }
}

const loadAllTags = async () => {
  try {
    const res = await getFeedbackTags()
    if (res.data?.code === 200) {
      allTags.value = res.data.data || []
    }
  } catch (err) {
    console.error('Load tag list failed', err)
  }
}

const handleBindTags = async () => {
  if (!currentFeedback.value) return
  savingTags.value = true
  try {
    const res = await updateFeedbackTags(currentFeedback.value.id, selectedTagIds.value)
    if (res.data?.code === 200) {
      message.success('分类标签绑定已更新')
      loadFeedbacks(true)
    }
  } catch (err: any) {
    message.error(`标签绑定失败: ${err.message}`)
  } finally {
    savingTags.value = false
  }
}

const openTagManagerModal = () => {
  showTagManagerModal.value = true
  cancelTagEdit()
}

const startEditTag = (tag: FeedbackTag) => {
  editingTagId.value = tag.id
  tagForm.value.name = tag.name
  tagForm.value.color = tag.color
}

const cancelTagEdit = () => {
  editingTagId.value = null
  tagForm.value.name = ''
  tagForm.value.color = '#3b82f6'
}

const hasEmoji = (str: string) => {
  const emojiReg = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
  const extraEmojiReg = /[\u2600-\u27BF]/g
  return emojiReg.test(str) || extraEmojiReg.test(str)
}

const handleTagFormSubmit = async () => {
  const name = tagForm.value.name.trim()
  if (!name) {
    message.warning('标签名称不能为空 ⚠️')
    return
  }
  if (hasEmoji(name)) {
    message.warning('标签名称不允许包含 Emoji 表情 ⚠️')
    return
  }

  submittingTag.value = true
  try {
    const payload = { name, color: tagForm.value.color }
    let res
    if (editingTagId.value) {
      res = await updateTag(editingTagId.value, payload)
    } else {
      res = await createTag(payload)
    }
    if (res.data?.code === 200) {
      message.success(editingTagId.value ? '标签修改成功' : '标签添加成功')
      cancelTagEdit()
      await loadAllTags()
      loadFeedbacks(true)
    } else {
      message.error(res.data?.msg || '保存标签失败')
    }
  } catch (err: any) {
    message.error(`保存标签失败: ${err.message}`)
  } finally {
    submittingTag.value = false
  }
}

const handleDeleteTag = (id: number) => {
  const tag = allTags.value.find(t => t.id === id)
  if (!tag) return
  dialog.warning({
    title: '删除标签',
    content: `您确定要删除标签「${tag.name}」吗？这会清除所有关联且不可撤销。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await deleteTag(tag.id)
        if (res.data?.code === 200) {
          message.success('标签已成功删除')
          await loadAllTags()
          loadFeedbacks(true)
        } else {
          message.error(res.data?.msg || '删除失败')
        }
      } catch (err: any) {
        message.error(`删除失败: ${err.message}`)
      }
    }
  })
}

const submittingReply = ref(false)
const handleReplySubmit = async () => {
  if (!currentFeedback.value) return
  if (!replyContent.value.trim()) {
    message.warning('请写下回复内容 💬')
    return
  }
  submittingReply.value = true
  try {
    const res = await replyFeedback(currentFeedback.value.id, {
      content: replyContent.value.trim()
    })
    if (res.data?.code === 200) {
      message.success('博主回复成功贴在卡片底部 🎏')
      replyContent.value = ''
      loadFeedbacks(true)
    }
  } catch (err: any) {
    message.error(`回复发布失败: ${err.message}`)
  } finally {
    submittingReply.value = false
  }
}

const submittingAdopt = ref(false)
const handleAdoptSubmit = async () => {
  if (!currentFeedback.value) return
  submittingAdopt.value = true
  try {
    const res = await adoptFeedback(currentFeedback.value.id, {
      adoptedNote: adoptNote.value.trim()
    })
    if (res.data?.code === 200) {
      message.success('建议已采纳归档 💡')
      loadFeedbacks(true)
    }
  } catch (err: any) {
    message.error(`建议采纳失败: ${err.message}`)
  } finally {
    submittingAdopt.value = false
  }
}

const loadFeedbackTypes = async () => {
  try {
    const res = await getFeedbackTypes()
    if (res.data?.code === 200) {
      allTypes.value = res.data.data || []
    } else {
      throw new Error(res.data?.msg || '接口返回异常')
    }
  } catch (err) {
    console.warn('Load feedback types failed, using client default fallback types', err)
    allTypes.value = [
      { id: 1, value: "comment", label: "普通讨论", icon: "i-mdi-comment-text-outline", color: "sky", sortOrder: 1 },
      { id: 2, value: "suggestion", label: "改进建议", icon: "i-mdi-lightbulb-outline", color: "emerald", sortOrder: 2 },
      { id: 3, value: "bug", label: "Bug反馈", icon: "i-mdi-bug-outline", color: "rose", sortOrder: 3 },
      { id: 4, value: "praise", label: "夸夸作者", icon: "i-mdi-heart-outline", color: "pink", sortOrder: 4 },
      { id: 5, value: "idea", label: "灵感火花", icon: "i-mdi-flash-outline", color: "amber", sortOrder: 5 },
      { id: 6, value: "complaint", label: "吐槽倾听", icon: "i-mdi-chat-processing-outline", color: "stone", sortOrder: 6 }
    ]
  }
}

const openTypeManagerModal = () => {
  showTypeManagerModal.value = true
  cancelTypeEdit()
}

const startEditType = (type: FeedbackType) => {
  editingTypeId.value = type.id || null
  typeForm.value.value = type.value
  typeForm.value.label = type.label
  typeForm.value.icon = type.icon || ''
  typeForm.value.color = type.color || 'sky'
  typeForm.value.sortOrder = type.sortOrder || 0
}

const cancelTypeEdit = () => {
  editingTypeId.value = null
  typeForm.value.value = ''
  typeForm.value.label = ''
  typeForm.value.icon = 'i-mdi-tag'
  typeForm.value.color = 'sky'
  typeForm.value.sortOrder = 0
}

const handleTypeFormSubmit = async () => {
  const val = typeForm.value.value.trim()
  const label = typeForm.value.label.trim()
  if (!val) {
    message.warning('标识值不能为空 ⚠️')
    return
  }
  if (!/^[a-z]+$/.test(val)) {
    message.warning('标识值只能由小写英文字母组成 ⚠️')
    return
  }
  if (!label) {
    message.warning('类型名称不能为空 ⚠️')
    return
  }

  submittingType.value = true
  try {
    const payload = {
      id: editingTypeId.value || undefined,
      value: val,
      label,
      icon: typeForm.value.icon,
      color: typeForm.value.color,
      sortOrder: typeForm.value.sortOrder
    }
    let res
    if (editingTypeId.value) {
      res = await updateFeedbackType(payload)
    } else {
      res = await createFeedbackType(payload)
    }
    if (res.data?.code === 200) {
      message.success(editingTypeId.value ? '分类修改成功' : '分类添加成功')
      cancelTypeEdit()
      await loadFeedbackTypes()
      loadFeedbacks(true)
    } else {
      message.error(res.data?.msg || '保存分类失败')
    }
  } catch (err: any) {
    message.error(`保存分类失败: ${err.message}`)
  } finally {
    submittingType.value = false
  }
}

const handleDeleteType = (id: number) => {
  const type = allTypes.value.find(t => t.id === id)
  if (!type) return
  dialog.warning({
    title: '删除反馈类型',
    content: `您确定要删除分类「${type.label}」吗？删除后此类型的反馈留言将归入普通讨论，此操作不可撤销。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await deleteFeedbackType(type.id!)
        if (res.data?.code === 200) {
          message.success('分类已成功删除')
          await loadFeedbackTypes()
          loadFeedbacks(true)
        } else {
          message.error(res.data?.msg || '删除失败')
        }
      } catch (err: any) {
        message.error(`删除失败: ${err.message}`)
      }
    }
  })
}

onMounted(() => {
  loadFeedbackTypes().then(() => {
    loadFeedbacks()
  })
  loadAllTags()
})
</script>

<style scoped>
.feedback-reader-paper {
  perspective: 1000px;
  transform-style: preserve-3d;
}
</style>
