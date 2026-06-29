<template>
  <div class="space-y-6">
    <!-- 配置控制卡片 -->
    <div class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md">
      <div class="flex items-start gap-3.5">
        <div class="h-12 w-12 rounded-2xl bg-(--archive-accent)/10 text-(--archive-accent) flex items-center justify-center shrink-0">
          <span class="i-mdi-account-outline text-2xl animate-pulse"></span>
        </div>
        <div class="flex flex-col text-left">
          <h3 class="text-lg font-bold text-(--archive-text) tracking-wide">关于作者 (About) 个人档案管理</h3>
          <p class="text-xs text-(--archive-text)/60 mt-1 leading-relaxed max-w-[48rem]">
            在此处个性化定制您的个人姓名、头衔、简历切片、信念以及前台 <code>/about</code> 页面的探索导航。所有配置都将直接存入数据库，前台已同步。
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
    <div class="bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md text-left">
      <!-- 选项卡分类配置 -->
      <n-tabs type="line" animated>
        <!-- 1. 基本信息 -->
        <n-tab-pane name="basic" tab="基本资料 (Basic)">
          <div class="space-y-4 pt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <n-form-item label="作者姓名 (Name)" required>
                <n-input v-model:value="profile.name" placeholder="请输入姓名，例如: RRTiamo" class="archive-input" />
              </n-form-item>
              <n-form-item label="身份角色 (Role / 标题文字)" required>
                <n-input v-model:value="profile.role" placeholder="前台大字标题，例如: 此间主人" class="archive-input" />
              </n-form-item>
            </div>

            <n-form-item label="一句话介绍 (Headline)" required>
              <n-input v-model:value="profile.headline" placeholder="请输入简短的一句话介绍..." class="archive-input" />
            </n-form-item>

            <n-form-item label="详细介绍 (Introduction)" required>
              <n-input
                v-model:value="profile.introduction"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                placeholder="请输入更详细的个人简介段落..."
                class="archive-input"
              />
            </n-form-item>

            <!-- 静态标签流 -->
            <n-form-item label="个人标签流 (Tags - 回车或点击添加)">
              <n-dynamic-tags v-model:value="profile.tags" />
            </n-form-item>

            <!-- 动态旋转身份标签 -->
            <n-form-item label="轮播旋转标签 (Rotating Texts - 顶端卡片旁滚动显示)">
              <n-dynamic-tags v-model:value="profile.rotatingTexts" />
            </n-form-item>

            <!-- 头像配置 (本地上传 + 相册选择) -->
            <n-form-item label="个人头像媒体 (Avatar URL)">
              <div class="space-y-3 w-full">
                <div class="flex gap-2">
                  <n-input v-model:value="profile.avatar" placeholder="输入外部头像链接，或点击右侧上传/选择..." class="font-mono flex-1 archive-input" clearable />
                  <n-button secondary @click="openAvatarGallerySelect">从照片墙选择</n-button>
                </div>
                <div class="flex items-center gap-3">
                  <n-upload
                    action="http://localhost:8080/api/blogs/upload?type=about"
                    :headers="uploadHeaders"
                    :show-file-list="false"
                    @finish="handleAvatarUploadFinish"
                    @error="handleAvatarUploadError"
                  >
                    <n-button secondary size="small" type="primary">
                      <template #icon><span class="i-mdi-upload"></span></template>
                      本地上传头像
                    </n-button>
                  </n-upload>
                  <span class="text-[10px] tone-muted">推荐 1:1 比例头像图片，支持 mp4/webm 视频文件</span>
                </div>
                <!-- 头像预览 -->
                <div v-if="profile.avatar" class="mt-2 relative h-28 w-28 rounded-2xl overflow-hidden border border-(--archive-border)/40 bg-black/5 flex items-center justify-center">
                  <video v-if="isMediaVideo(profile.avatar)" :src="profile.avatar" autoplay muted loop playsinline class="w-full h-full object-cover"></video>
                  <img v-else :src="profile.avatar" class="w-full h-full object-cover" />
                </div>
              </div>
            </n-form-item>
          </div>
        </n-tab-pane>

        <!-- 2. 现状与坐标 -->
        <n-tab-pane name="status" tab="现状与坐标 (Status & Location)">
          <div class="space-y-6 pt-4">
            <!-- 现状 -->
            <div class="space-y-4">
              <h4 class="text-xs font-bold text-(--archive-accent) border-b border-(--archive-border)/40 pb-2">现状轨迹 (Current Status)</h4>
              <n-form-item label="板块大标题" required>
                <n-input v-model:value="profile.currentStatus.title" placeholder="例如: 现在的我" class="archive-input" />
              </n-form-item>
              
              <div class="space-y-4 pl-4 border-l-2 border-(--archive-border)/40">
                <div v-for="(item, idx) in profile.currentStatus.items" :key="idx" class="p-4 bg-black/5 dark:bg-white/5 rounded-2xl space-y-3">
                  <div class="text-xs font-bold tone-muted">状态项 0{{ Number(idx) + 1 }}</div>
                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div class="sm:col-span-1">
                      <n-form-item label="状态标语/简述" :show-feedback="false">
                        <n-input v-model:value="item.label" placeholder="例如: 正在构建" class="archive-input font-bold" />
                      </n-form-item>
                    </div>
                    <div class="sm:col-span-3">
                      <n-form-item label="详细内容" :show-feedback="false">
                        <n-input v-model:value="item.desc" type="textarea" :rows="1" placeholder="说明你正在忙什么..." class="archive-input" />
                      </n-form-item>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 坐标 -->
            <div class="space-y-4 mt-6">
              <h4 class="text-xs font-bold text-(--archive-accent) border-b border-(--archive-border)/40 pb-2">生活坐标 (Life Coordinates)</h4>
              <n-form-item label="板块大标题" required>
                <n-input v-model:value="profile.coordinates.title" placeholder="例如: 我的坐标" class="archive-input" />
              </n-form-item>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-for="(item, idx) in profile.coordinates.items" :key="idx" class="p-5 bg-black/5 dark:bg-white/5 border border-(--archive-border)/40 rounded-2xl space-y-3">
                  <div class="text-xs font-bold text-(--archive-accent)">坐标象限：{{ item.label }}</div>
                  
                  <div class="grid grid-cols-1 gap-3">
                    <n-form-item label="象限标题" :show-feedback="false">
                      <n-input v-model:value="item.label" placeholder="例如: 我从哪里来" class="archive-input" />
                    </n-form-item>
                    <n-form-item label="认知描述" :show-feedback="false">
                      <n-input v-model:value="item.desc" type="textarea" :rows="2" placeholder="请输入对该维度的认知描述..." class="archive-input" />
                    </n-form-item>
                    
                    <!-- 坐标媒体配置 -->
                    <n-form-item label="维度展示图片/视频" :show-feedback="false">
                      <div class="space-y-2 w-full">
                        <div class="flex gap-2">
                          <n-input v-model:value="item.image" placeholder="图片/视频URL，或点击右侧上传/选择..." class="font-mono flex-1 archive-input" clearable />
                          <n-button secondary size="small" @click="openCoordinateGallerySelect(Number(idx))">从相册选择</n-button>
                        </div>
                        <div class="flex items-center gap-3">
                          <n-upload
                            action="http://localhost:8080/api/blogs/upload?type=about"
                            :headers="uploadHeaders"
                            :show-file-list="false"
                            @finish="(event) => handleCoordinateUploadFinish(Number(idx), event)"
                            @error="handleCoordinateUploadError"
                          >
                            <n-button secondary size="tiny" type="primary">
                              <template #icon><span class="i-mdi-upload"></span></template>
                              本地上传媒体
                            </n-button>
                          </n-upload>
                        </div>
                        <!-- 媒体预览 -->
                        <div v-if="item.image" class="relative h-24 w-full rounded-xl overflow-hidden border border-(--archive-border)/40 bg-black/5 flex items-center justify-center">
                          <video v-if="isMediaVideo(item.image)" :src="item.image" autoplay muted loop playsinline class="w-full h-full object-cover"></video>
                          <img v-else :src="item.image" class="w-full h-full object-cover" />
                        </div>
                      </div>
                    </n-form-item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- 3. 自我切片 -->
        <n-tab-pane name="fragments" tab="自我切片 (Bento Fragments)">
          <div class="space-y-4 pt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <n-form-item label="切片主标题" required>
                <n-input v-model:value="profile.fragments.title" placeholder="例如: Fragments of Me" class="archive-input" />
              </n-form-item>
              <n-form-item label="切片副标题" required>
                <n-input v-model:value="profile.fragments.subtitle" placeholder="例如: 自我切片" class="archive-input" />
              </n-form-item>
            </div>

            <!-- 动态卡片列表 -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-(--archive-accent)">自我切片 Bento 单元格列表</span>
                <n-button size="small" type="primary" secondary @click="handleAddFragment">
                  <template #icon><span class="i-mdi-plus"></span></template>
                  添加自我切片
                </n-button>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div 
                  v-for="(item, idx) in profile.fragments.items" 
                  :key="idx" 
                  class="p-4 rounded-2xl border border-(--archive-border)/40 bg-black/5 dark:bg-white/5 relative group"
                >
                  <!-- 删除按钮 -->
                  <n-button 
                    strong 
                    secondary 
                    circle 
                    type="error" 
                    size="small" 
                    class="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="handleDeleteFragment(Number(idx))"
                  >
                    <template #icon><span class="i-mdi-delete-outline"></span></template>
                  </n-button>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <n-form-item label="切片类别 (Category)" :show-feedback="false">
                      <n-input v-model:value="item.category" placeholder="例如: 技术" class="archive-input" />
                    </n-form-item>
                    <n-form-item label="核心描述 (Description)" :show-feedback="false">
                      <n-input v-model:value="item.desc" placeholder="例如: 用代码搭建秩序" class="archive-input" />
                    </n-form-item>
                    <n-form-item label="技术栈/标签 (Tags - 逗号分隔)" :show-feedback="false">
                      <n-input 
                        :value="item.tags.join(', ')" 
                        @update:value="(val) => handleFragmentTagsChange(Number(idx), val)"
                        placeholder="逗号分隔，例如: Java, Spring Boot, MySQL" 
                        class="archive-input font-mono" 
                    />
                    </n-form-item>
                  </div>

                  <!-- 自我切片媒体配置 -->
                  <div class="mt-4 pt-3 border-t border-(--archive-border)/20">
                    <n-form-item label="切片展示图片" :show-feedback="false">
                      <div class="space-y-2 w-full">
                        <div class="flex gap-2">
                          <n-input v-model:value="item.image" placeholder="图片URL，或点击右侧上传/选择..." class="font-mono flex-1 archive-input" clearable />
                          <n-button secondary size="small" @click="openFragmentGallerySelect(Number(idx))">从相册选择</n-button>
                        </div>
                        <div class="flex items-center gap-3">
                          <n-upload
                            action="http://localhost:8080/api/blogs/upload?type=about"
                            :headers="uploadHeaders"
                            :show-file-list="false"
                            @finish="(event) => handleFragmentUploadFinish(Number(idx), event)"
                            @error="handleFragmentUploadError"
                          >
                            <n-button secondary size="tiny" type="primary">
                              <template #icon><span class="i-mdi-upload"></span></template>
                              本地上传图片
                            </n-button>
                          </n-upload>
                        </div>
                        <!-- 媒体预览 -->
                        <div v-if="item.image" class="relative h-20 w-32 rounded-xl overflow-hidden border border-(--archive-border)/40 bg-black/5 flex items-center justify-center">
                          <img :src="item.image" class="w-full h-full object-cover" />
                        </div>
                      </div>
                    </n-form-item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- 4. 信念与探索 -->
        <n-tab-pane name="beliefs" tab="价值与探索 (Beliefs & Links)">
          <div class="space-y-6 pt-4">
            <!-- 价值信条 -->
            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <n-form-item label="信条主标题" required>
                  <n-input v-model:value="profile.beliefs.title" placeholder="例如: 我相信" class="archive-input" />
                </n-form-item>
                <n-form-item label="信条副标题" required>
                  <n-input v-model:value="profile.beliefs.subtitle" placeholder="例如: Some Things I Believe" class="archive-input" />
                </n-form-item>
              </div>

              <n-form-item label="信念信条列表">
                <n-dynamic-input
                  v-model:value="profile.beliefs.items"
                  placeholder="请输入您的价值观、生活信念、信条一句话..."
                />
              </n-form-item>
            </div>

            <!-- 继续探索外链 -->
            <div class="space-y-4 mt-6">
              <h4 class="text-xs font-bold text-(--archive-accent) border-b border-(--archive-border)/40 pb-2">继续探索 (Explore Links)</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <n-form-item label="引导主标题" required>
                  <n-input v-model:value="profile.explore.title" placeholder="例如: 继续探索" class="archive-input" />
                </n-form-item>
                <n-form-item label="引导结语" required>
                  <n-input v-model:value="profile.explore.closing" placeholder="例如: 这个网站还没有完成。准确地说，我也没有。" class="archive-input" />
                </n-form-item>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <n-form-item label="引导描述" required>
                  <n-input v-model:value="profile.explore.desc" type="textarea" :rows="2" placeholder="请输入引导用户探索的简述..." class="archive-input" />
                </n-form-item>
                <n-form-item label="页脚署名副标题" required>
                  <n-input v-model:value="profile.explore.footerSubtitle" placeholder="例如: About the one behind this site." class="archive-input" />
                </n-form-item>
              </div>

              <!-- 外链列表 -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold tone-muted">自定义导航跳转链接</span>
                  <n-button size="small" type="primary" secondary @click="handleAddLink">
                    <template #icon><span class="i-mdi-plus"></span></template>
                    添加跳转链接
                  </n-button>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div 
                    v-for="(link, idx) in profile.explore.links" 
                    :key="idx" 
                    class="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-(--archive-border)/40 relative group"
                  >
                    <n-button 
                      strong 
                      secondary 
                      circle 
                      type="error" 
                      size="small" 
                      class="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      @click="handleDeleteLink(Number(idx))"
                    >
                      <template #icon><span class="i-mdi-delete-outline"></span></template>
                    </n-button>

                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <n-form-item label="链接名称" :show-feedback="false">
                        <n-input v-model:value="link.label" placeholder="例如: 翻开随笔" class="archive-input" />
                      </n-form-item>
                      <n-form-item label="跳转地址 (Href)" :show-feedback="false">
                        <n-select 
                          v-model:value="link.href" 
                          :options="availableRouteOptions" 
                          filterable 
                          tag 
                          placeholder="选择内置路由，或输入自定义链接" 
                        />
                      </n-form-item>
                      <n-form-item label="图标 (Icon)" :show-feedback="false">
                        <n-select v-model:value="link.icon" :options="aboutIconOptions" />
                      </n-form-item>
                      <div class="flex items-center justify-between sm:justify-center pt-5">
                        <span class="text-xs tone-muted">新标签页打开</span>
                        <n-switch v-model:value="link.external" class="ml-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 从照片墙图册选择弹窗 -->
    <n-modal
      v-model:show="showGallerySelectModal"
      preset="card"
      title="从相册选择头像图片/视频"
      class="w-[95vw] max-w-[700px] rounded-2xl"
    >
      <div v-if="loadingGallery" class="py-12 flex justify-center">
        <n-spin size="medium" />
      </div>
      <div v-else-if="galleryPhotos.length === 0" class="py-12 text-center">
        <span class="i-mdi-image-off-outline text-5xl tone-muted opacity-60"></span>
        <p class="text-xs tone-muted mt-2">您的相册库空空如也，请先在「照片墙」管理中添加照片。</p>
      </div>
      <div v-else class="space-y-4">
        <p class="text-xs tone-muted leading-relaxed">
          点击选择下方图册中的照片或视频，点击「确认选择」后即可将其应用。
        </p>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          <div 
            v-for="photo in galleryPhotos" 
            :key="photo.id"
            class="group relative aspect-[3/2] rounded-xl overflow-hidden border transition-all cursor-pointer bg-black/5"
            :class="[
              selectedPhotoUrl === photo.src 
                ? 'border-(--archive-accent) ring-2 ring-(--archive-accent) ring-offset-2 dark:ring-offset-neutral-900' 
                : 'border-(--archive-border)/40 hover:border-(--archive-accent)/60'
            ]"
            @click="selectedPhotoUrl = photo.src"
          >
            <video 
              v-if="photo.type === 'video'" 
              :src="photo.src" 
              class="w-full h-full object-cover" 
              preload="metadata"
              muted
            />
            <img 
              v-else
              :src="photo.src" 
              :alt="photo.title" 
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <!-- 视频标识图标 -->
            <div v-if="photo.type === 'video'" class="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm pointer-events-none">
              <span class="i-mdi-video text-xs"></span>
            </div>
            <!-- 选中遮罩 -->
            <div v-if="selectedPhotoUrl === photo.src" class="absolute inset-0 bg-[color-mix(in_srgb,var(--archive-accent)_15%,transparent)] flex items-center justify-center">
              <span class="i-mdi-check-circle text-2xl text-(--archive-accent) drop-shadow-md"></span>
            </div>
          </div>
        </div>
      </div>

      <template #action>
        <div class="flex items-center justify-end gap-3">
          <n-button size="small" round @click="showGallerySelectModal = false">取消</n-button>
          <n-button type="primary" size="small" round :disabled="!selectedPhotoUrl" @click="confirmGallerySelect">确认选择</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage, NTabs, NTabPane, NFormItem, NInput, NButton, NDynamicTags, NDynamicInput, NUpload, NModal, NSpin, NSelect } from 'naive-ui'
import { getConfigList, updateConfigBatch } from '@/api/config'
import { getFileList } from '@/api/files'
import { defaultProfile } from '@/mock/about'
import { aboutIconOptions } from '@/icon/about'
import type { AboutProfile } from '@/interface/about'

const message = useMessage()
const saving = ref(false)

// 自定义跳转预设链接
const availableRouteOptions = [
  { label: '首页 (/)', value: '/' },
  { label: '随笔/文章 (/writing)', value: '/writing' },
  { label: '项目/相册 (/gallery)', value: '/gallery' },
  { label: '鱼塘/留言板 (/pond)', value: '/pond' },
  { label: '岁月信箱/写信 (/letter)', value: '/letter' },
  { label: '恋爱记录 (/love)', value: '/love' },
  { label: '影像足迹 (/footprints)', value: '/footprints' },
  { label: '成就管理 (/achievements)', value: '/achievements' },
  { label: '此时时刻 (/now)', value: '/now' }
]

const profile = ref<AboutProfile>(JSON.parse(JSON.stringify(defaultProfile)))

// 上传凭证
const uploadHeaders = computed(() => ({
  satoken: localStorage.getItem('satoken') || ''
}))

// 照片墙弹窗相关
const showGallerySelectModal = ref(false)
const loadingGallery = ref(false)
const galleryPhotos = ref<any[]>([])
const selectedPhotoUrl = ref('')

// 选相册的目标，可以是 'avatar'、'coordinate' 或者是 'fragment'
const gallerySelectTarget = ref<'avatar' | 'coordinate' | 'fragment'>('avatar')
const currentCoordinateIndex = ref<number | null>(null)
const currentFragmentIndex = ref<number | null>(null)

const isMediaVideo = (url: string) => {
  if (!url) return false
  return /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url)
}

// 动态处理 Bento 切片的 Tags
const handleFragmentTagsChange = (idx: number, val: string) => {
  profile.value.fragments.items[idx].tags = val
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
}

// 自我切片增删
const handleAddFragment = () => {
  profile.value.fragments.items.push({
    category: "新类别",
    tags: [],
    desc: "切片简述",
    image: ""
  })
}

const handleDeleteFragment = (idx: number) => {
  profile.value.fragments.items.splice(idx, 1)
}

// 外部链接增删
const handleAddLink = () => {
  profile.value.explore.links.push({
    label: "新链接",
    href: "#",
    icon: "arrow",
    external: false
  })
}

const handleDeleteLink = (idx: number) => {
  profile.value.explore.links.splice(idx, 1)
}

// 读取系统配置
const fetchConfigs = async () => {
  try {
    const response = await getConfigList()
    
    if (response.data && response.data.code === 200) {
      const list = response.data.data || []
      const item = list.find((c: any) => c.configKey === 'page.about.profile')
      if (item && item.configValue) {
        try {
          const parsed = JSON.parse(item.configValue)
          
          // 对历史版本或缺失字段进行深度防空兼容性初始化
          if (!parsed.avatar) parsed.avatar = defaultProfile.avatar
          if (!parsed.tags) parsed.tags = []
          if (!parsed.rotatingTexts) parsed.rotatingTexts = []
          if (!parsed.currentStatus) parsed.currentStatus = { ...defaultProfile.currentStatus }
          if (!parsed.currentStatus.items) parsed.currentStatus.items = []
          if (!parsed.coordinates) parsed.coordinates = { ...defaultProfile.coordinates }
          
          if (!parsed.coordinates.items) {
            parsed.coordinates.items = JSON.parse(JSON.stringify(defaultProfile.coordinates.items))
          } else {
            // 确保坐标中每一项都具有默认的图片以防开天窗
            parsed.coordinates.items.forEach((cItem: any, idx: number) => {
              if (!cItem.image && defaultProfile.coordinates.items[idx]) {
                cItem.image = defaultProfile.coordinates.items[idx].image
              }
            })
          }

          if (!parsed.fragments) parsed.fragments = { ...defaultProfile.fragments }
          if (!parsed.fragments.items) {
            parsed.fragments.items = JSON.parse(JSON.stringify(defaultProfile.fragments.items))
          } else {
            parsed.fragments.items.forEach((fItem: any, idx: number) => {
              if (fItem.image === undefined) {
                fItem.image = defaultProfile.fragments.items[idx]?.image || ''
              }
            })
          }
          if (!parsed.beliefs) parsed.beliefs = { ...defaultProfile.beliefs }
          if (!parsed.beliefs.items) parsed.beliefs.items = []
          if (!parsed.explore) parsed.explore = { ...defaultProfile.explore }
          if (!parsed.explore.links) parsed.explore.links = []
          
          profile.value = parsed
        } catch (e) {
          console.error('Failed to parse page.about.profile JSON', e)
        }
      }
    }
  } catch (err) {
    console.error('Failed to load about config', err)
  }
}

// 保存修改
const handleSave = async () => {
  saving.value = true

  const payload = [
    { 
      configKey: 'page.about.profile', 
      configValue: JSON.stringify(profile.value), 
      description: '关于作者页面自定义配置数据' 
    }
  ]

  try {
    const response = await updateConfigBatch(payload)
    
    if (response.data && response.data.code === 200) {
      message.success('关于作者(About)个人档案保存成功，前台已同步！')
      await fetchConfigs()
    } else {
      throw new Error(response.data?.msg || '保存失败')
    }
  } catch (err: any) {
    message.error(err.message || '配置提交失败，网络连接异常。')
  } finally {
    saving.value = false
  }
}

// 恢复默认数据
const handleResetDefault = () => {
  profile.value = JSON.parse(JSON.stringify(defaultProfile))
  message.success('已重置为默认作者数据，请点击右上角保存以应用！')
}

// 头像本地上传回调
const handleAvatarUploadFinish = ({ event }: any) => {
  try {
    const responseText = (event?.target as any)?.response
    if (responseText) {
      const res = JSON.parse(responseText)
      if (res && res.code === 200 && res.data) {
        profile.value.avatar = res.data
        message.success('头像媒体上传成功 📸')
      } else {
        throw new Error(res?.msg || '上传接口返回错误')
      }
    }
  } catch (err: any) {
    message.error(`头像上传失败: ${err.message || '解析错误'}`)
  }
}

const handleAvatarUploadError = () => {
  message.error('图片上传失败，请检查网络或后端接口是否在线 ⚠️')
}

// 坐标媒体本地上传回调
const handleCoordinateUploadFinish = (idx: number, { event }: any) => {
  try {
    const responseText = (event?.target as any)?.response
    if (responseText) {
      const res = JSON.parse(responseText)
      if (res && res.code === 200 && res.data) {
        profile.value.coordinates.items[idx].image = res.data
        message.success(`坐标项 [${profile.value.coordinates.items[idx].label}] 媒体上传成功 🎨`)
      } else {
        throw new Error(res?.msg || '上传接口返回错误')
      }
    }
  } catch (err: any) {
    message.error(`坐标媒体上传失败: ${err.message || '解析错误'}`)
  }
}

const handleCoordinateUploadError = () => {
  message.error('媒体文件上传失败，请检查后端网络接口 ⚠️')
}

const handleFragmentUploadFinish = (idx: number, { event }: any) => {
  try {
    const responseText = (event?.target as any)?.response
    if (responseText) {
      const res = JSON.parse(responseText)
      if (res && res.code === 200 && res.data) {
        profile.value.fragments.items[idx].image = res.data
        message.success(`自我切片 [${profile.value.fragments.items[idx].category}] 图片上传成功 🎨`)
      } else {
        throw new Error(res?.msg || '上传接口返回错误')
      }
    }
  } catch (err: any) {
    message.error(`自我切片图片上传失败: ${err.message || '解析错误'}`)
  }
}

const handleFragmentUploadError = () => {
  message.error('自我切片图片上传失败，请检查后端网络接口 ⚠️')
}

// 照片墙弹框交互：头像选择
const openAvatarGallerySelect = () => {
  gallerySelectTarget.value = 'avatar'
  currentCoordinateIndex.value = null
  currentFragmentIndex.value = null
  triggerGalleryFetch(profile.value.avatar || '')
}

// 照片墙弹框交互：坐标选择
const openCoordinateGallerySelect = (idx: number) => {
  gallerySelectTarget.value = 'coordinate'
  currentCoordinateIndex.value = idx
  currentFragmentIndex.value = null
  triggerGalleryFetch(profile.value.coordinates.items[idx].image || '')
}

// 照片墙弹框交互：自我切片选择
const openFragmentGallerySelect = (idx: number) => {
  gallerySelectTarget.value = 'fragment'
  currentFragmentIndex.value = idx
  currentCoordinateIndex.value = null
  triggerGalleryFetch(profile.value.fragments.items[idx].image || '')
}

const triggerGalleryFetch = async (currentVal: string) => {
  showGallerySelectModal.value = true
  loadingGallery.value = true
  selectedPhotoUrl.value = currentVal
  try {
    const response = await getFileList()
    if (response.data && response.data.code === 200) {
      const allFiles = response.data.data || []
      const imageOrVideoExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'mp4', 'mkv', 'avi', 'mov', 'webm']
      galleryPhotos.value = allFiles
        .filter((file: any) => {
          const name = file.fileName || ''
          const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
          return imageOrVideoExtensions.includes(ext)
        })
        .map((file: any) => {
          const name = file.fileName || ''
          const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
          const isVid = ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)
          return {
            id: file.fileName,
            src: file.url,
            type: isVid ? 'video' : 'image',
            title: file.fileName
          }
        })
    }
  } catch (err) {
    console.error('Failed to load files for selection', err)
  } finally {
    loadingGallery.value = false
  }
}

const confirmGallerySelect = () => {
  if (gallerySelectTarget.value === 'coordinate' && currentCoordinateIndex.value !== null) {
    profile.value.coordinates.items[currentCoordinateIndex.value].image = selectedPhotoUrl.value
    message.success(`已从照片墙选中并应用到坐标项 [${profile.value.coordinates.items[currentCoordinateIndex.value].label}]`)
  } else if (gallerySelectTarget.value === 'fragment' && currentFragmentIndex.value !== null) {
    profile.value.fragments.items[currentFragmentIndex.value].image = selectedPhotoUrl.value
    message.success(`已从照片墙选中并应用到自我切片项 [${profile.value.fragments.items[currentFragmentIndex.value].category}]`)
  } else {
    profile.value.avatar = selectedPhotoUrl.value
    message.success('已从照片墙选中并应用头像媒体')
  }
  showGallerySelectModal.value = false
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
