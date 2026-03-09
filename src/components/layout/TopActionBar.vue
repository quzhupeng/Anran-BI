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

      <!-- 右侧：经营分析会 + 反馈 + 用户 + 时间 -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <button
          @click="$emit('toggle-mode')"
          class="px-3 py-1.5 rounded-lg border border-primary-500/40 bg-primary-500/15 text-primary-300 hover:bg-primary-500/25 transition-colors text-sm"
        >
          经营分析会模式
        </button>

        <button
          class="text-xs text-dashboard-muted hover:text-dashboard-text transition-colors"
          @click="$emit('open-feedback')"
        >
          💬 意见反馈
        </button>

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
