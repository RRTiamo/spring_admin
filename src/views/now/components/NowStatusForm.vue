<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start text-left">
    <!-- 移动端折叠下拉导航 (仅在 lg 以下可见) -->
    <div class="block lg:hidden w-full archive-card p-3 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl shrink-0">
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

    <!-- 左侧卡片式纵向导航 (仅在 lg 及以上可见) -->
    <div class="hidden lg:block lg:col-span-1 space-y-2 lg:sticky lg:top-4">
      <div class="bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl p-4 shadow-sm space-y-1">
        <div class="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-(--archive-text)/40 mb-2 select-none">
          配置模块菜单
        </div>
        <div
          v-for="tab in tabsList"
          :key="tab.name"
          @click="activeTab = tab.name"
          :class="[
            'flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 text-xs font-bold tracking-wide select-none',
            activeTab === tab.name
              ? 'bg-(--archive-accent) text-white shadow-md transform translate-x-1'
              : 'text-(--archive-text)/80 hover:bg-black/5 dark:hover:bg-white/5 hover:translate-x-0.5'
          ]"
        >
          <span :class="[tab.icon, 'text-base']"></span>
          <span>{{ tab.label }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧配置表单 -->
    <div class="lg:col-span-3">
      <div class="bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl p-6 md:p-8 shadow-sm min-h-[520px] transition-all hover:shadow-md">
        <!-- 1. Location Tab -->
        <div v-show="activeTab === 'location'" class="space-y-5">
          <h4 class="text-sm font-bold pb-3 border-b border-(--archive-border) flex items-center gap-2 text-(--archive-text)">
            <span class="i-mdi-map-marker-outline text-(--archive-accent) text-lg"></span>
            地点设置 (Location)
          </h4>
          <div class="space-y-4 pt-2">
            <n-form-item label="城市名称" required>
              <n-input v-model:value="formModel.location.name" placeholder="例如: 中国 · 江苏南京" class="archive-input" />
            </n-form-item>
            <n-form-item label="经纬度与海拔信息" required>
              <n-input v-model:value="formModel.location.coordinates" placeholder="例如: 32.0603° N, 118.7969° E · Alt: 35m" class="archive-input font-mono" />
            </n-form-item>
            <n-form-item label="雷达信号标语" required>
              <n-input v-model:value="formModel.location.mapText" placeholder="例如: 南京 NJ.SYS" class="archive-input font-mono" />
            </n-form-item>
            <n-form-item label="地点状态详细描述" required>
              <n-input
                v-model:value="formModel.location.desc"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                placeholder="请输入详细描述文案..."
                class="archive-input"
              />
            </n-form-item>
          </div>

          <div class="flex justify-end pt-4 border-t border-(--archive-border) mt-6">
            <button 
              class="px-5 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              :disabled="saving"
              @click="emit('save-module', '地点设置')"
            >
              <span v-if="saving" class="i-mdi-loading animate-spin"></span>
              <span class="i-mdi-check"></span>
              <span>保存地点设置</span>
            </button>
          </div>
        </div>

        <!-- 2. Mood Tab -->
        <div v-show="activeTab === 'mood'" class="space-y-5">
          <h4 class="text-sm font-bold pb-3 border-b border-(--archive-border) flex items-center gap-2 text-(--archive-text)">
            <span class="i-mdi-emoticon-neutral-outline text-(--archive-accent) text-lg"></span>
            精神状态 (Mood)
          </h4>
          <div class="space-y-4 pt-2">
            <n-form-item label="情绪状态标题" required>
              <n-input v-model:value="formModel.mood.title" placeholder="例如: Quiet / 静谧而专注" class="archive-input" />
            </n-form-item>
            <n-form-item label="状态微缩标识" required>
              <n-input v-model:value="formModel.mood.status" placeholder="例如: Concentrating · Digital Detox" class="archive-input" />
            </n-form-item>
            <n-form-item label="精神状态详细描述" required>
              <n-input
                v-model:value="formModel.mood.desc"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                placeholder="请输入关于当前专注点和情绪的描述..."
                class="archive-input"
              />
            </n-form-item>

            <!-- 雷达六边形状态维度配置 -->
            <div class="border border-(--archive-border) rounded-xl p-4 bg-white/10 dark:bg-white/5 space-y-4 mt-4">
              <div class="text-xs font-bold text-(--archive-accent)">雷达六边形状态维度配置 (0-100)</div>
              <n-grid x-gap="12" y-gap="12" :cols="2">
                <n-gi>
                  <n-form-item label="专注度 (Focus)">
                    <n-space vertical class="w-full pt-1">
                      <n-slider v-model:value="formModel.mood.stats.focus" :step="1" :max="100" />
                      <span class="text-xs font-mono text-(--archive-accent) font-semibold">{{ formModel.mood.stats?.focus }}%</span>
                    </n-space>
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="创造力 (Creative)">
                    <n-space vertical class="w-full pt-1">
                      <n-slider v-model:value="formModel.mood.stats.creative" :step="1" :max="100" />
                      <span class="text-xs font-mono text-(--archive-accent) font-semibold">{{ formModel.mood.stats?.creative }}%</span>
                    </n-space>
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="能量值 (Energy)">
                    <n-space vertical class="w-full pt-1">
                      <n-slider v-model:value="formModel.mood.stats.energy" :step="1" :max="100" />
                      <span class="text-xs font-mono text-(--archive-accent) font-semibold">{{ formModel.mood.stats?.energy }}%</span>
                    </n-space>
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="物理状态 (Physical)">
                    <n-space vertical class="w-full pt-1">
                      <n-slider v-model:value="formModel.mood.stats.physical" :step="1" :max="100" />
                      <span class="text-xs font-mono text-(--archive-accent) font-semibold">{{ formModel.mood.stats?.physical }}%</span>
                    </n-space>
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="社交意愿 (Social)">
                    <n-space vertical class="w-full pt-1">
                      <n-slider v-model:value="formModel.mood.stats.social" :step="1" :max="100" />
                      <span class="text-xs font-mono text-(--archive-accent) font-semibold">{{ formModel.mood.stats?.social }}%</span>
                    </n-space>
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="平和度 (Calm)">
                    <n-space vertical class="w-full pt-1">
                      <n-slider v-model:value="formModel.mood.stats.calm" :step="1" :max="100" />
                      <span class="text-xs font-mono text-(--archive-accent) font-semibold">{{ formModel.mood.stats?.calm }}%</span>
                    </n-space>
                  </n-form-item>
                </n-gi>
              </n-grid>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-(--archive-border) mt-6">
            <button 
              class="px-5 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              :disabled="saving"
              @click="emit('save-module', '精神状态')"
            >
              <span v-if="saving" class="i-mdi-loading animate-spin"></span>
              <span v-else class="i-mdi-check"></span>
              <span>保存精神状态</span>
            </button>
          </div>
        </div>

        <!-- 3. Focus Tab -->
        <div v-show="activeTab === 'focus'" class="space-y-5">
          <h4 class="text-sm font-bold pb-3 border-b border-(--archive-border) flex items-center gap-2 text-(--archive-text)">
            <span class="i-mdi-xml text-(--archive-accent) text-lg"></span>
            正在研究 (Focus)
          </h4>
          <div class="space-y-4 pt-2">
            <n-form-item label="研究主旨标题" required>
              <n-input v-model:value="formModel.focus.title" placeholder="例如: 春风不解别离 / 春风马蹄" class="archive-input" />
            </n-form-item>
            <n-form-item label="研究副标题/方向" required>
              <n-input v-model:value="formModel.focus.subtitle" placeholder="例如: Front-end Micro-Interactions" class="archive-input" />
            </n-form-item>
            <n-form-item label="核心研究逻辑/代码 (在前台将以代码框呈现)" required>
              <n-input v-model:value="formModel.focus.code" placeholder="例如: gsap.to('.viewport', { ease: 'power4.out' })" class="archive-input font-mono" />
            </n-form-item>
            <n-form-item label="研究灵感与细节描述" required>
              <n-input
                v-model:value="formModel.focus.desc"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                placeholder="请输入详细研究思路描述..."
                class="archive-input"
              />
            </n-form-item>
          </div>

          <div class="flex justify-end pt-4 border-t border-(--archive-border) mt-6">
            <button 
              class="px-5 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              :disabled="saving"
              @click="emit('save-module', '正在研究')"
            >
              <span v-if="saving" class="i-mdi-loading animate-spin"></span>
              <span v-else class="i-mdi-check"></span>
              <span>保存正在研究</span>
            </button>
          </div>
        </div>

        <!-- 4. Reading Tab -->
        <div v-show="activeTab === 'reading'" class="space-y-5">
          <h4 class="text-sm font-bold pb-3 border-b border-(--archive-border) flex items-center gap-2 text-(--archive-text)">
            <span class="i-mdi-book-open-page-variant-outline text-(--archive-accent) text-lg"></span>
            正在阅读 (Reading)
          </h4>
          <div class="space-y-4 pt-2">
            <n-form-item label="书籍名称" required>
              <n-input v-model:value="formModel.reading.title" placeholder="例如: 时间的秩序 (The Order of Time)" class="archive-input" />
            </n-form-item>
            <n-form-item label="作者 (Author)" required>
              <n-input v-model:value="formModel.reading.author" placeholder="例如: ROVELLI" class="archive-input" />
            </n-form-item>
            <n-form-item label="阅读进度 (0-100)" required>
              <n-space vertical class="w-full pt-1">
                <n-slider v-model:value="formModel.reading.progress" :step="1" :max="100" />
                <span class="text-xs font-mono text-(--archive-accent) font-semibold">{{ formModel.reading.progress }}%</span>
              </n-space>
            </n-form-item>
            <n-form-item label="进度文本描述" required>
              <n-input v-model:value="formModel.reading.pageDesc" placeholder="例如: Page 204/300" class="archive-input" />
            </n-form-item>
            <n-form-item label="核心金句/批注/摘抄" required>
              <n-input
                v-model:value="formModel.reading.quote"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                placeholder="“世界不是物体的集合，而是事件的集合。从时间跨度来看，世界在流动。”"
                class="archive-input"
              />
            </n-form-item>
            <n-form-item label="书籍封面图片 (上传或外部路径)" path="reading.coverUrl">
              <div class="flex gap-4 w-full items-start">
                <div class="flex-1 space-y-3">
                  <div class="flex gap-2 items-center">
                    <n-input v-model:value="formModel.reading.coverUrl" placeholder="输入外部路径，或点击上传" class="archive-input flex-1" />
                    <n-upload
                      action="/api/blogs/upload?type=now"
                      :headers="uploadHeaders"
                      :show-file-list="false"
                      @finish="handleUploadFinish"
                      @error="handleUploadError"
                      @before-upload="beforeUpload"
                      class="flex-shrink-0"
                    >
                      <n-button class="archive-btn">上传封面</n-button>
                    </n-upload>
                  </div>
                  <p class="text-[10px] tone-muted m-0">支持 JPG/PNG/WEBP，前台将以精美书脊封面质感卡片呈现。</p>
                </div>
                <div class="flex-shrink-0">
                  <div v-if="formModel.reading.coverUrl" class="relative group">
                    <img :src="formModel.reading.coverUrl" class="w-20 h-28 object-cover rounded-md border border-(--archive-border) shadow-sm" />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                      <button type="button" @click="handleRemoveCover" class="text-[10px] font-bold text-red-500 bg-white px-1.5 py-0.5 rounded shadow">移除</button>
                    </div>
                  </div>
                  <div v-else class="w-20 h-28 border-2 border-dashed border-(--archive-border) rounded-md flex flex-col items-center justify-center text-(--archive-text)/20 p-2 text-center">
                    <span class="i-mdi-book-open-outline text-xl mb-1"></span>
                    <span class="text-[8px] font-semibold leading-tight">使用系统文字封面</span>
                  </div>
                </div>
              </div>
            </n-form-item>
          </div>

          <div class="flex justify-end pt-4 border-t border-(--archive-border) mt-6">
            <button 
              class="px-5 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              :disabled="saving"
              @click="emit('save-module', '正在阅读')"
            >
              <span v-if="saving" class="i-mdi-loading animate-spin"></span>
              <span class="i-mdi-check"></span>
              <span>保存阅读进度</span>
            </button>
          </div>
        </div>

        <!-- 5. Listening Tab -->
        <div v-show="activeTab === 'listening'" class="space-y-5">
          <h4 class="text-sm font-bold pb-3 border-b border-(--archive-border) flex items-center gap-2 text-(--archive-text)">
            <span class="i-mdi-music-circle-outline text-(--archive-accent) text-lg"></span>
            正在循环 (Listening)
          </h4>
          <div class="space-y-4 pt-2">
            <n-form-item label="歌曲/专辑名称" required>
              <n-input v-model:value="formModel.listening.title" placeholder="例如: You Must Believe in Spring" class="archive-input" />
            </n-form-item>
            <n-form-item label="艺术家/年代/风格" required>
              <n-input v-model:value="formModel.listening.subtitle" placeholder="例如: Bill Evans Trio (1977) · Jazz" class="archive-input" />
            </n-form-item>
            <n-form-item label="唱片标签文字" required>
              <n-input v-model:value="formModel.listening.vinylText" placeholder="例如: BILL EVANS" class="archive-input font-mono" />
            </n-form-item>
            <n-form-item label="听歌感想与意境描述" required>
              <n-input
                v-model:value="formModel.listening.desc"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                placeholder="例如: 忧郁而明亮的小调钢琴旋律，黑胶唱片特有的..."
                class="archive-input"
              />
            </n-form-item>
          </div>

          <div class="flex justify-end pt-4 border-t border-(--archive-border) mt-6">
            <button 
              class="px-5 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              :disabled="saving"
              @click="emit('save-module', '正在循环')"
            >
              <span v-if="saving" class="i-mdi-loading animate-spin"></span>
              <span class="i-mdi-check"></span>
              <span>保存正在循环</span>
            </button>
          </div>
        </div>

        <!-- 6. Setup Tab -->
        <div v-show="activeTab === 'setup'" class="space-y-5">
          <h4 class="text-sm font-bold pb-3 border-b border-(--archive-border) flex items-center gap-2 text-(--archive-text)">
            <span class="i-mdi-laptop text-(--archive-accent) text-lg"></span>
            工具设备 (Setup)
          </h4>
          <div class="space-y-4 pt-2">
            <n-form-item label="底部整合总结文案" required>
              <n-input
                v-model:value="formModel.setup.descText"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                placeholder="例如: 在数字比特的严密逻辑与感光溴化银的物理颗粒之间，探寻并记录生活的两面。"
                class="archive-input"
              />
            </n-form-item>

            <n-divider title-placement="left" class="!my-4 text-xs font-bold">硬件设备卡槽管理</n-divider>

            <div class="space-y-4">
              <div
                v-for="(dev, idx) in formModel.setup.devices"
                :key="idx"
                class="p-5 border border-(--archive-border) rounded-xl bg-white/10 dark:bg-white/5 space-y-4 relative transition-all hover:bg-black/5 dark:hover:bg-white/5"
              >
                <!-- 删除按钮 -->
                <button
                  type="button"
                  class="absolute top-4 right-4 text-xs text-red-500 hover:text-red-700 font-semibold border border-red-500/10 px-2 py-1 rounded-md hover:bg-red-500/5 transition-all cursor-pointer"
                  @click="removeDevice(Number(idx))"
                >
                  删除设备
                </button>

                <div class="text-xs font-bold text-(--archive-accent)">设备插槽 #{{ Number(idx) + 1 }}</div>

                <n-grid x-gap="12" :cols="2">
                  <n-gi>
                    <n-form-item label="设备型号/名称" required>
                      <n-input v-model:value="dev.name" placeholder="例如: Leica M6" class="archive-input" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="镜头/规格描述" required>
                      <n-input v-model:value="dev.spec" placeholder="例如: Classic Rangefinder" class="archive-input" />
                    </n-form-item>
                  </n-gi>
                </n-grid>

                <n-grid x-gap="12" :cols="3">
                  <n-gi>
                    <n-form-item label="设备类型标签" required>
                      <n-input v-model:value="dev.type" placeholder="例如: Analog Soul / 银盐旁轴" class="archive-input" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="徽标/品牌印记" required>
                      <n-input v-model:value="dev.badge" placeholder="例如: 35MM FILM" class="archive-input" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="状态指示灯颜色 (CSS)" required>
                      <n-select
                        v-model:value="dev.lightColor"
                        :options="lightColorOptions"
                        class="archive-select"
                      />
                    </n-form-item>
                  </n-gi>
                </n-grid>

                <n-form-item label="设备详细用途说明" required>
                  <n-input
                    v-model:value="dev.desc"
                    placeholder="例如: 装填 35mm 银盐反转片，以物理快门对焦城市叙事"
                    class="archive-input"
                  />
                </n-form-item>
              </div>

              <div class="flex justify-center pt-2">
                <n-button dashed class="w-full max-w-[20rem] archive-btn" @click="addDevice">
                  + 添加新设备插槽
                </n-button>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-(--archive-border) mt-6">
            <button 
              class="px-5 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              :disabled="saving"
              @click="emit('save-module', '工具设备')"
            >
              <span v-if="saving" class="i-mdi-loading animate-spin"></span>
              <span v-else class="i-mdi-check"></span>
              <span>保存工具设备</span>
            </button>
          </div>
        </div>

        <!-- 7. Radio Tab -->
        <div v-show="activeTab === 'radio'" class="space-y-5">
          <h4 class="text-sm font-bold pb-3 border-b border-(--archive-border) flex items-center gap-2 text-(--archive-text)">
            <span class="i-mdi-radio text-(--archive-accent) text-lg"></span>
            治愈电台配置 (Radio)
          </h4>
          <div class="space-y-6 pt-2">
            <!-- 背景音乐曲目 -->
            <n-divider title-placement="left" class="!my-4 text-xs font-bold">背景音乐曲目库 (BGM List)</n-divider>
            <div class="space-y-4">
              <div
                v-for="(bgm, idx) in formModel.radio?.bgmList"
                :key="idx"
                class="p-5 border border-(--archive-border) rounded-xl bg-white/10 dark:bg-white/5 space-y-4 relative transition-all hover:bg-black/5 dark:hover:bg-white/5"
              >
                <button
                  type="button"
                  class="absolute top-4 right-4 text-xs text-red-500 hover:text-red-700 font-semibold border border-red-500/10 px-2 py-1 rounded-md hover:bg-red-500/5 transition-all cursor-pointer"
                  @click="removeBgm(Number(idx))"
                >
                  删除
                </button>
                <div class="text-xs font-bold text-(--archive-accent)">背景曲目 #{{ Number(idx) + 1 }}</div>
                
                <n-grid x-gap="12" :cols="2">
                  <n-gi>
                    <n-form-item label="歌曲名称" required>
                      <n-input v-model:value="bgm.title" placeholder="例如: Merry Christmas Mr. Lawrence" class="archive-input" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="艺术家/歌手" required>
                      <n-input v-model:value="bgm.artist" placeholder="例如: 坂本龙一" class="archive-input" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
                <n-form-item label="音频链接 (MP3 路径/URL)" required>
                  <div class="flex gap-2 w-full">
                    <n-input v-model:value="bgm.src" placeholder="例如: /assets/music/mr-lawrence.mp3" class="archive-input font-mono flex-1" />
                    <n-upload
                      action="/api/blogs/upload?type=now"
                      :headers="uploadHeaders"
                      :show-file-list="false"
                      @finish="(options: any) => handleAudioUploadFinish(options, bgm)"
                      @error="handleUploadError"
                      @before-upload="beforeAudioUpload"
                      class="flex-shrink-0"
                    >
                      <n-button class="archive-btn">上传音频</n-button>
                    </n-upload>
                  </div>
                </n-form-item>
              </div>

              <div class="flex justify-center pt-2">
                <n-button dashed class="w-full max-w-[20rem] archive-btn" @click="addBgm">
                  + 添加背景曲目
                </n-button>
              </div>
            </div>

            <!-- 环境白噪音 -->
            <n-divider title-placement="left" class="!my-4 text-xs font-bold">环境噪音音轨库 (Ambient Noises)</n-divider>
            <div class="space-y-4">
              <div
                v-for="(noise, idx) in formModel.radio?.noiseList"
                :key="idx"
                class="p-5 border border-(--archive-border) rounded-xl bg-white/10 dark:bg-white/5 space-y-4 relative transition-all hover:bg-black/5 dark:hover:bg-white/5"
              >
                <button
                  type="button"
                  class="absolute top-4 right-4 text-xs text-red-500 hover:text-red-700 font-semibold border border-red-500/10 px-2 py-1 rounded-md hover:bg-red-500/5 transition-all cursor-pointer"
                  @click="removeNoise(Number(idx))"
                >
                  删除
                </button>
                <div class="text-xs font-bold text-(--archive-accent)">环境音轨 #{{ Number(idx) + 1 }}</div>
                
                <n-grid x-gap="12" :cols="2">
                  <n-gi>
                    <n-form-item label="音轨名称" required>
                      <n-input v-model:value="noise.name" placeholder="例如: 淅淅沥沥的雨声" class="archive-input" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="图标样式 (Iconify)" required>
                      <n-input v-model:value="noise.icon" placeholder="例如: i-mdi-weather-rainy" class="archive-input font-mono" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
                <n-form-item label="音频链接 (MP3 路径/URL)" required>
                  <div class="flex gap-2 w-full">
                    <n-input v-model:value="noise.src" placeholder="例如: /assets/music/rain.mp3" class="archive-input font-mono flex-1" />
                    <n-upload
                      action="/api/blogs/upload?type=now"
                      :headers="uploadHeaders"
                      :show-file-list="false"
                      @finish="(options: any) => handleAudioUploadFinish(options, noise)"
                      @error="handleUploadError"
                      @before-upload="beforeAudioUpload"
                      class="flex-shrink-0"
                    >
                      <n-button class="archive-btn">上传音频</n-button>
                    </n-upload>
                  </div>
                </n-form-item>
              </div>

              <div class="flex justify-center pt-2">
                <n-button dashed class="w-full max-w-[20rem] archive-btn" @click="addNoise">
                  + 添加环境音轨
                </n-button>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-(--archive-border) mt-6">
            <button 
              class="px-5 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              :disabled="saving"
              @click="emit('save-module', '治愈电台')"
            >
              <span v-if="saving" class="i-mdi-loading animate-spin"></span>
              <span class="i-mdi-check"></span>
              <span>保存电台配置</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NFormItem, NInput, NSlider, NGrid, NGi, NDivider, NButton, NSpace, NSelect, NUpload, NDropdown, useMessage } from 'naive-ui'

const props = defineProps<{
  formModel: any
  saving: boolean
  uploadHeaders: any
  lightColorOptions: any[]
}>()

const emit = defineEmits<{
  (e: 'update:formModel', val: any): void
  (e: 'save-module', label: string): void
}>()

const message = useMessage()
const activeTab = ref('location')

const configDropdownOptions = computed(() => {
  return tabsList.map(tab => ({
    label: tab.label,
    key: tab.name,
    icon: () => h('span', { class: [tab.icon, 'text-base'] })
  }))
})

const currentActiveTabLabel = computed(() => {
  const found = tabsList.find(t => t.name === activeTab.value)
  return found ? found.label : '地点设置 (Location)'
})

const currentActiveTabIcon = computed(() => {
  const found = tabsList.find(t => t.name === activeTab.value)
  return found ? found.icon : 'i-mdi-map-marker-outline'
})

const handleDropdownSelect = (key: string) => {
  activeTab.value = key
}

const tabsList = [
  { name: 'location', label: '地点设置 (Location)', icon: 'i-mdi-map-marker-outline' },
  { name: 'mood', label: '精神状态 (Mood)', icon: 'i-mdi-emoticon-neutral-outline' },
  { name: 'focus', label: '正在研究 (Focus)', icon: 'i-mdi-xml' },
  { name: 'reading', label: '正在阅读 (Reading)', icon: 'i-mdi-book-open-page-variant-outline' },
  { name: 'listening', label: '正在循环 (Listening)', icon: 'i-mdi-music-circle-outline' },
  { name: 'setup', label: '工具设备 (Setup)', icon: 'i-mdi-laptop' },
  { name: 'radio', label: '治愈电台配置 (Radio)', icon: 'i-mdi-radio' }
]

const beforeUpload = (data: { file: any }) => {
  const isImg = data.file.file?.type.startsWith('image/')
  if (!isImg) {
    message.error('只能上传图片文件 🖼️')
    return false
  }
  const isLt5M = data.file.file?.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('封面图片大小不能超过 5MB 📦')
    return false
  }
  return true
}

const handleUploadFinish = ({ event }: any) => {
  try {
    const responseText = (event?.target as any)?.response
    if (responseText) {
      const res = JSON.parse(responseText)
      if (res && res.code === 200 && res.data) {
        const model = { ...props.formModel }
        model.reading.coverUrl = res.data
        emit('update:formModel', model)
        message.success('书籍封面图片上传成功 🖼️')
      } else {
        throw new Error(res?.msg || '上传接口返回错误')
      }
    }
  } catch (err: any) {
    message.error(`封面上传失败: ${err.message || '解析错误'}`)
  }
}

const handleUploadError = () => {
  message.error('图片上传失败，请检查网络或后端接口是否在线 ⚠️')
}

const handleRemoveCover = () => {
  const model = { ...props.formModel }
  model.reading.coverUrl = ''
  emit('update:formModel', model)
  message.success('已移除封面图片')
}

const addDevice = () => {
  const model = { ...props.formModel }
  model.setup.devices.push({
    name: '新硬件设备',
    spec: '规格参数',
    type: '类型标签',
    badge: 'LOGO',
    lightColor: 'bg-emerald-500 shadow-emerald-500/50',
    desc: '设备用途与细节描述'
  })
  emit('update:formModel', model)
}

const removeDevice = (idx: number) => {
  const model = { ...props.formModel }
  model.setup.devices.splice(idx, 1)
  emit('update:formModel', model)
}

const addBgm = () => {
  const model = { ...props.formModel }
  if (!model.radio) {
    model.radio = { bgmList: [], noiseList: [] }
  }
  model.radio.bgmList.push({
    title: '新背景音乐',
    artist: '未知艺术家',
    src: ''
  })
  emit('update:formModel', model)
}

const removeBgm = (idx: number) => {
  const model = { ...props.formModel }
  model.radio?.bgmList.splice(idx, 1)
  emit('update:formModel', model)
}

const addNoise = () => {
  const model = { ...props.formModel }
  if (!model.radio) {
    model.radio = { bgmList: [], noiseList: [] }
  }
  model.radio.noiseList.push({
    name: '新环境音轨',
    src: '',
    icon: 'i-mdi-volume-high'
  })
  emit('update:formModel', model)
}

const removeNoise = (idx: number) => {
  const model = { ...props.formModel }
  model.radio?.noiseList.splice(idx, 1)
  emit('update:formModel', model)
}

const beforeAudioUpload = (data: { file: any }) => {
  const file = data.file.file
  const fileType = file.type
  const name = file.name.toLowerCase()
  if (!fileType.startsWith('audio/') && !name.endsWith('.mp3') && !name.endsWith('.wav') && !name.endsWith('.m4a') && !name.endsWith('.aac')) {
    message.error('只允许上传音频文件 (MP3/WAV/M4A/AAC) 🎵')
    return false
  }
  if (file.size > 30 * 1024 * 1024) {
    message.error('音频文件大小不能超过 30MB 🎵')
    return false
  }
  return true
}

const handleAudioUploadFinish = ({ event }: any, target: any) => {
  try {
    const res = JSON.parse(event.target.response)
    if (res && res.code === 200 && res.data) {
      target.src = res.data
      emit('update:formModel', { ...props.formModel })
      message.success('音频文件上传成功 🎵')
    } else {
      message.error(res.msg || '音频上传被拒绝')
    }
  } catch (e) {
    message.error('解析服务器响应失败')
  }
}
</script>

<style scoped>
.archive-input :deep(.n-input-wrapper) {
  border-radius: 10px;
}
.archive-select :deep(.n-base-selection) {
  border-radius: 10px;
}
</style>
