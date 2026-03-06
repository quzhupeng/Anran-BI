<template>
  <div class="min-h-screen bg-dashboard-dark flex flex-col">
    <!-- 桌面端顶部操作台 -->
    <TopActionBar
      v-if="!isAnalysisMode"
      class="hidden lg:flex"
      :isAnalysisMode="isAnalysisMode"
      @toggle-mode="toggleMode"
      @open-chatbi="showChatBI = true"
      @open-report="showReportGenerator = true"
      @open-dispatch="showTaskDispatch = true"
      @open-home-edit="handleHomeEdit"
      @open-feedback="handleFeedback"
    />

    <!-- 移动端导航 -->
    <MobileNav
      v-if="!isAnalysisMode"
      :isAnalysisMode="isAnalysisMode"
      :activeNav="activeMobileNav"
      @toggle-mode="toggleMode"
      @nav-change="handleMobileNav"
      @open-chatbi="showChatBI = true"
      @open-report="showReportGenerator = true"
      @open-dispatch="showTaskDispatch = true"
      @open-filter="showMobileFilter = true"
      @open-home-edit="handleHomeEdit"
      @open-feedback="handleFeedback"
    />

    <!-- 桌面端全局筛选器 -->
    <GlobalFilter v-show="!isAnalysisMode" class="hidden lg:block" />

    <!-- 主内容区 -->
    <main
      class="flex-1 overflow-auto view-transition"
      :class="isAnalysisMode ? 'p-0 pb-0' : 'p-4 lg:p-4 pb-20 lg:pb-4'"
    >
      <transition name="fade" mode="out-in">
        <DailyDashboard
          v-if="!isAnalysisMode"
          key="daily"
          @open-chatbi="showChatBI = true"
          @open-report="showReportGenerator = true"
          @open-dispatch="showTaskDispatch = true"
          @open-alert-config="showAlertConfig = true"
        />
        <AnalysisDashboard v-else key="analysis" @exit="toggleMode" />
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

    <HomeCustomizerPanel
      v-model:visible="showHomeCustomizer"
      @saved="handleHomeLayoutSaved"
    />

    <FeedbackPanel
      v-model:visible="showFeedback"
      @submitted="handleFeedbackSubmitted"
    />

    <AlertConfigPanel
      v-model:visible="showAlertConfig"
      @saved="handleAlertConfigSaved"
    />

    <transition name="fade">
      <div
        v-if="appNotice"
        class="fixed right-4 top-20 z-50 rounded-lg border border-primary-500/40 bg-primary-900/80 px-3 py-2 text-xs text-primary-100 shadow-lg"
      >
        {{ appNotice }}
      </div>
    </transition>

    <!-- 移动端筛选器 -->
    <MobileFilter
      v-model:visible="showMobileFilter"
      @apply="handleFilterApply"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import TopActionBar from './components/layout/TopActionBar.vue'
import MobileNav from './components/layout/MobileNav.vue'
import MobileFilter from './components/layout/MobileFilter.vue'
import GlobalFilter from './components/layout/GlobalFilter.vue'
import DailyDashboard from './views/DailyDashboard.vue'
import AnalysisDashboard from './views/AnalysisDashboard.vue'
import ChatBI from './components/common/ChatBI.vue'
import ReportGenerator from './components/common/ReportGenerator.vue'
import TaskDispatchPanel from './components/common/TaskDispatchPanel.vue'
import HomeCustomizerPanel from './components/common/HomeCustomizerPanel.vue'
import FeedbackPanel from './components/common/FeedbackPanel.vue'
import AlertConfigPanel from './components/common/AlertConfigPanel.vue'

const isAnalysisMode = ref(false)
const showChatBI = ref(false)
const showReportGenerator = ref(false)
const showTaskDispatch = ref(false)
const showMobileFilter = ref(false)
const activeMobileNav = ref('dashboard')
const showHomeCustomizer = ref(false)
const showFeedback = ref(false)
const showAlertConfig = ref(false)
const appNotice = ref('')
let noticeTimer = null

const defaultTaskData = reactive({
  indicator: '待选择指标',
  currentValue: '',
  target: '',
  gap: '',
  department: '直销事业部',
  owner: '张经理（华东区）',
  chartSnapshot: '当前组合图（计划值/实际值/达成率）'
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

const handleHomeEdit = () => {
  showHomeCustomizer.value = true
}

const handleFeedback = () => {
  showFeedback.value = true
}

const handleHomeLayoutSaved = (layout) => {
  showNotice(`首页布局已保存（${layout.length}个模块）`)
}

const handleFeedbackSubmitted = (feedback) => {
  showNotice(`反馈已提交（类型：${feedback.type}）`)
}

const handleAlertConfigSaved = (rules) => {
  showNotice(`预警规则已更新（${rules.length}条）`)
}

const showNotice = (message) => {
  appNotice.value = message
  if (noticeTimer) {
    clearTimeout(noticeTimer)
  }
  noticeTimer = setTimeout(() => {
    appNotice.value = ''
  }, 2200)
}

onUnmounted(() => {
  if (noticeTimer) {
    clearTimeout(noticeTimer)
  }
})
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
