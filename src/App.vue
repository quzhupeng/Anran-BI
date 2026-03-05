<template>
  <div class="min-h-screen bg-dashboard-dark flex flex-col">
    <!-- 桌面端顶部操作台 -->
    <TopActionBar
      class="hidden lg:flex"
      :isAnalysisMode="isAnalysisMode"
      @toggle-mode="toggleMode"
      @open-chatbi="showChatBI = true"
      @open-report="showReportGenerator = true"
      @open-dispatch="showTaskDispatch = true"
    />

    <!-- 移动端导航 -->
    <MobileNav
      :isAnalysisMode="isAnalysisMode"
      :activeNav="activeMobileNav"
      @toggle-mode="toggleMode"
      @nav-change="handleMobileNav"
      @open-chatbi="showChatBI = true"
      @open-report="showReportGenerator = true"
      @open-dispatch="showTaskDispatch = true"
      @open-filter="showMobileFilter = true"
    />

    <!-- 桌面端全局筛选器 -->
    <GlobalFilter v-show="!isAnalysisMode" class="hidden lg:block" />

    <!-- 模式提示条（经营分析会模式）- 桌面端 -->
    <transition name="slide">
      <div
        v-if="isAnalysisMode"
        class="hidden lg:flex px-6 py-2 bg-primary-900/30 border-b border-primary-700/30 items-center gap-2"
      >
        <span class="text-primary-400">🔄</span>
        <span class="text-sm text-primary-300">已切换至【经营分析会模式（月度复盘）】</span>
        <span class="text-xs text-primary-400/60 ml-4">该模式下显示月度复盘专用视图</span>
      </div>
    </transition>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-auto p-4 lg:p-4 view-transition pb-20 lg:pb-4">
      <transition name="fade" mode="out-in">
        <DailyDashboard
          v-if="!isAnalysisMode"
          key="daily"
          @open-chatbi="showChatBI = true"
          @open-report="showReportGenerator = true"
          @open-dispatch="showTaskDispatch = true"
        />
        <AnalysisDashboard v-else key="analysis" />
      </transition>
    </main>

    <!-- Chat BI 智能助手 -->
    <ChatBI v-model:visible="showChatBI" />

    <!-- 报告生成器 -->
    <ReportGenerator v-model:visible="showReportGenerator" />

    <!-- 任务派发面板 -->
    <TaskDispatchPanel
      v-model:visible="showTaskDispatch"
      :taskData="defaultTaskData"
    />

    <!-- 移动端筛选器 -->
    <MobileFilter
      v-model:visible="showMobileFilter"
      @apply="handleFilterApply"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import TopActionBar from './components/layout/TopActionBar.vue'
import MobileNav from './components/layout/MobileNav.vue'
import MobileFilter from './components/layout/MobileFilter.vue'
import GlobalFilter from './components/layout/GlobalFilter.vue'
import DailyDashboard from './views/DailyDashboard.vue'
import AnalysisDashboard from './views/AnalysisDashboard.vue'
import ChatBI from './components/common/ChatBI.vue'
import ReportGenerator from './components/common/ReportGenerator.vue'
import TaskDispatchPanel from './components/common/TaskDispatchPanel.vue'

const isAnalysisMode = ref(false)
const showChatBI = ref(false)
const showReportGenerator = ref(false)
const showTaskDispatch = ref(false)
const showMobileFilter = ref(false)
const activeMobileNav = ref('dashboard')

const defaultTaskData = reactive({
  indicator: '待选择指标',
  currentValue: '',
  target: '',
  gap: ''
})

const toggleMode = () => {
  isAnalysisMode.value = !isAnalysisMode.value
}

const handleMobileNav = (nav) => {
  activeMobileNav.value = nav
}

const handleFilterApply = (filter) => {
  console.log('Filter applied:', filter)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
