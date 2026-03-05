<template>
  <header class="sticky top-0 z-50 glass-effect border-b border-dashboard-border">
    <div class="px-6 py-3 flex items-center justify-between">
      <!-- 左侧：标志与标题 -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <span class="text-white text-xl">📊</span>
        </div>
        <div>
          <h1 class="text-lg font-semibold text-dashboard-text">直销经营指标智能驾驶舱</h1>
          <p class="text-xs text-dashboard-muted">2026年度 BSC平衡计分卡监控平台</p>
        </div>
      </div>
      
      <!-- 中间：功能悬浮操作区 -->
      <div class="flex items-center gap-3">
        <button class="floating-action-btn" @click="openAIDialog">
          <span>🤖</span>
          <span>AI 智能洞察</span>
        </button>
        <button class="floating-action-btn" @click="openCustomize">
          <span>🧩</span>
          <span>自定义视图</span>
        </button>
        <button class="floating-action-btn" @click="dispatchTask">
          <span>✉️</span>
          <span>一键派发任务</span>
        </button>
      </div>
      
      <!-- 右侧：模式切换 -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-sm">
          <span :class="!isAnalysisMode ? 'text-primary-400 font-medium' : 'text-dashboard-muted'">
            经营看板
          </span>
          <button 
            @click="$emit('toggle-mode')"
            class="relative w-14 h-7 rounded-full bg-dashboard-card border border-dashboard-border transition-colors"
            :class="{ 'bg-primary-600 border-primary-500': isAnalysisMode }"
          >
            <span 
              class="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
              :class="{ 'translate-x-7': isAnalysisMode }"
            ></span>
          </button>
          <span :class="isAnalysisMode ? 'text-primary-400 font-medium' : 'text-dashboard-muted'">
            经营分析会
          </span>
        </div>
        
        <div class="text-xs text-dashboard-muted border-l border-dashboard-border pl-4">
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

const emit = defineEmits(['toggle-mode', 'open-chatbi', 'open-report', 'open-dispatch'])

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

const openAIDialog = () => {
  emit('open-chatbi')
}

const openCustomize = () => {
  emit('open-report')
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
</style>
