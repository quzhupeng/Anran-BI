<template>
  <!-- 移动端底部导航栏 -->
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-dashboard-border safe-area-bottom">
    <div class="flex items-center justify-around py-2">
      <button 
        v-for="item in navItems" 
        :key="item.id"
        @click="handleNav(item.id)"
        class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
        :class="activeNav === item.id ? 'text-primary-400' : 'text-dashboard-muted'"
      >
        <span class="text-xl">{{ item.icon }}</span>
        <span class="text-xs">{{ item.label }}</span>
      </button>
    </div>
  </nav>

  <!-- 移动端顶部简化栏 -->
  <header class="lg:hidden sticky top-0 z-40 glass-effect border-b border-dashboard-border">
    <div class="px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <span class="text-white text-sm">📊</span>
        </div>
        <div>
          <h1 class="text-sm font-semibold text-dashboard-text">经营驾驶舱</h1>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- 模式切换 -->
        <button 
          @click="$emit('toggle-mode')"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="isAnalysisMode ? 'bg-primary-600 text-white' : 'bg-dashboard-card text-dashboard-muted'"
        >
          {{ isAnalysisMode ? '分析会' : '看板' }}
        </button>
        
        <!-- 更多操作 -->
        <button @click="showMoreMenu = true" class="p-2 text-dashboard-muted">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 时间显示 -->
    <div class="px-4 pb-2 text-xs text-dashboard-muted">
      {{ currentTime }}
    </div>
  </header>

  <!-- 更多操作菜单 -->
  <Teleport to="body">
    <transition name="fade">
      <div 
        v-if="showMoreMenu" 
        class="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
        @click="showMoreMenu = false"
      >
        <div 
          class="w-full bg-dashboard-card rounded-t-2xl p-4 safe-area-bottom"
          @click.stop
        >
          <div class="text-center mb-4">
            <span class="text-sm text-dashboard-muted">更多操作</span>
          </div>
          
          <div class="space-y-2">
            <button 
              v-for="action in moreActions" 
              :key="action.id"
              @click="handleAction(action.id)"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-dashboard-dark/50 text-dashboard-text hover:bg-primary-600/20 transition-colors"
            >
              <span class="text-xl">{{ action.icon }}</span>
              <span>{{ action.label }}</span>
            </button>
          </div>
          
          <button 
            @click="showMoreMenu = false"
            class="w-full mt-4 py-3 rounded-xl bg-dashboard-border text-dashboard-muted"
          >
            取消
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isAnalysisMode: Boolean,
  activeNav: { type: String, default: 'dashboard' }
})

const emit = defineEmits(['toggle-mode', 'nav-change', 'open-chatbi', 'open-report', 'open-dispatch', 'open-filter'])

const showMoreMenu = ref(false)
const currentTime = ref('')

const navItems = [
  { id: 'dashboard', label: '看板', icon: '📊' },
  { id: 'filter', label: '筛选', icon: '🔍' },
  { id: 'chatbi', label: 'AI', icon: '🤖' },
  { id: 'alerts', label: '预警', icon: '🔔' }
]

const moreActions = [
  { id: 'chatbi', label: 'AI 智能洞察', icon: '🤖' },
  { id: 'report', label: '生成报告', icon: '📝' },
  { id: 'dispatch', label: '派发任务', icon: '✉️' }
]

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

let timer = null

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const handleNav = (id) => {
  if (id === 'filter') {
    emit('open-filter')
  } else if (id === 'chatbi') {
    emit('open-chatbi')
  } else if (id === 'alerts') {
    emit('nav-change', 'alerts')
  } else {
    emit('nav-change', id)
  }
}

const handleAction = (id) => {
  showMoreMenu.value = false
  if (id === 'chatbi') {
    emit('open-chatbi')
  } else if (id === 'report') {
    emit('open-report')
  } else if (id === 'dispatch') {
    emit('open-dispatch')
  }
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
