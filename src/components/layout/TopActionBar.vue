<template>
  <header class="sticky top-0 z-50 glass-effect border-b border-dashboard-border">
    <div class="px-6 py-3 flex items-center justify-between">
      <!-- 左侧：标志与标题 -->
      <div class="flex items-center gap-4 min-w-[420px]">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
          <span class="text-white text-2xl">📊</span>
        </div>
        <div>
          <h1 class="text-2xl font-extrabold text-dashboard-text tracking-[0.2em] whitespace-nowrap">直销业务经营驾驶舱</h1>
          <p class="text-xs text-dashboard-muted mt-0.5">公司级经营管理中枢</p>
        </div>
      </div>

      <!-- 中间：功能悬浮操作区 -->
      <div class="flex items-center gap-2">
        <button class="floating-action-btn nav-emphasis bg-primary-600/20 border border-primary-500/40" @click="openChatAssistant">
          <span>🤖</span>
          <span>智能助手 / Chat</span>
        </button>
        <button class="floating-action-btn nav-emphasis" @click="openAIDiagnosis">
          <span>🧠</span>
          <span>AI诊断与洞察</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-status-yellow/20 text-status-yellow">探索</span>
        </button>
        <button class="floating-action-btn nav-emphasis" @click="openCustomize">
          <span>🧩</span>
          <span>自定义首页</span>
        </button>
        <button class="floating-action-btn nav-emphasis" @click="dispatchTask">
          <span>✉️</span>
          <span>一键派发任务</span>
        </button>
      </div>

      <!-- 右侧：功能区 + 分隔 + 用户信息区 -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <!-- 功能按钮 -->
        <button
          @click="$emit('toggle-mode')"
          class="px-3 py-1.5 rounded-lg border border-primary-500/40 bg-primary-500/15 text-primary-300 hover:bg-primary-500/25 transition-colors text-sm"
        >
          经营分析会模式
        </button>

        <!-- 分隔线 -->
        <div class="w-px h-7 bg-dashboard-border/60 mx-1"></div>

        <!-- 用户信息区：反馈 + 通知 + 头像 + 时间 -->
        <div class="flex items-center gap-3">
          <button
            class="text-xs text-dashboard-muted hover:text-dashboard-text transition-colors"
            @click="$emit('open-feedback')"
          >
            💬 意见反馈
          </button>

          <!-- 预警消息通知 -->
          <div class="relative">
            <button
              @click="showAlertPopover = !showAlertPopover"
              class="relative p-1.5 rounded-lg text-dashboard-muted hover:text-dashboard-text hover:bg-dashboard-dark/40 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span
                v-if="alertCount > 0"
                class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                :class="hasRedAlert ? 'bg-status-red status-pulse' : 'bg-status-yellow'"
              >
                {{ alertCount }}
              </span>
            </button>
            <!-- 点击外部关闭遮罩 -->
            <div v-if="showAlertPopover" class="fixed inset-0 z-40" @click="showAlertPopover = false"></div>
            <!-- 下拉面板 -->
            <div
              v-if="showAlertPopover"
              class="absolute right-0 top-full mt-2 w-80 bg-dashboard-card border border-dashboard-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div class="px-4 py-3 border-b border-dashboard-border flex items-center justify-between">
                <span class="text-sm font-semibold text-dashboard-text">预警消息</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-status-red/20 text-status-red">{{ alertCount }} 条</span>
              </div>
              <div class="max-h-[300px] overflow-auto">
                <div
                  v-for="alert in recentAlerts"
                  :key="alert.id"
                  class="px-4 py-3 border-b border-dashboard-border/40 hover:bg-dashboard-dark/30 cursor-pointer"
                >
                  <div class="flex items-start gap-2">
                    <span
                      class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      :class="alert.level === 'red' ? 'bg-status-red' : 'bg-status-yellow'"
                    ></span>
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-medium text-dashboard-text truncate">{{ alert.title }}</div>
                      <div class="text-[11px] text-dashboard-muted mt-0.5">{{ alert.detail }}</div>
                      <div class="text-[10px] text-dashboard-muted mt-1">{{ alert.time }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="px-4 py-2.5 border-t border-dashboard-border text-center">
                <button class="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  查看全部预警 →
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 px-2 py-1 rounded-lg bg-dashboard-dark/40 border border-dashboard-border">
            <div class="w-7 h-7 rounded-full bg-primary-500/30 flex items-center justify-center text-xs font-semibold text-primary-300 relative">
              AN
              <span class="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 rounded-full bg-status-green border border-dashboard-card"></span>
            </div>
            <div class="text-xs leading-tight">
              <div class="text-dashboard-text font-medium">Anran</div>
              <div class="text-dashboard-muted">在线</div>
            </div>
          </div>

          <div class="text-xs text-dashboard-muted whitespace-nowrap">
            {{ currentTime }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 模式提示条 -->
    <transition name="slide">
      <div 
        v-if="isAnalysisMode" 
        class="px-6 py-2 bg-primary-900/30 border-t border-primary-700/30 flex items-center gap-2"
      >
        <span class="text-primary-400">🔄</span>
        <span class="text-sm text-primary-300">已切换至【经营分析会模式（月度复盘）】</span>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { alertData } from '../../composables/useMockData'

defineProps({
  isAnalysisMode: Boolean
})

const emit = defineEmits([
  'toggle-mode',
  'open-chatbi',
  'open-report',
  'open-dispatch',
  'open-feedback',
  'open-home-edit'
])

const currentTime = ref('')
const showAlertPopover = ref(false)
const recentAlerts = alertData.slice(0, 5)
const alertCount = alertData.length
const hasRedAlert = alertData.some(a => a.level === 'red')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

let timer = null

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const openChatAssistant = () => {
  emit('open-chatbi')
}

const openAIDiagnosis = () => {
  emit('open-report')
}

const openCustomize = () => {
  emit('open-home-edit')
}

const dispatchTask = () => {
  emit('open-dispatch')
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.nav-emphasis {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding-left: 14px;
  padding-right: 14px;
}
</style>
