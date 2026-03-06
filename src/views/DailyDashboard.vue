<template>
  <div class="space-y-4 animate-fade-in">
    <!-- BSC扁平化综览区 -->
    <BSCOverview />

    <!-- 核心财务指标区 -->
    <CoreFinanceCards @drillDown="handleDrillDown" />

    <!-- 核心客户与预警区 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CoreCustomerMetrics />
      <AlertCenter
        @open-report="$emit('open-report')"
        @open-alert-config="$emit('open-alert-config')"
      />
    </div>

    <!-- 移动端快捷操作 -->
    <div class="lg:hidden gradient-border p-4">
      <h3 class="text-sm font-semibold text-dashboard-text mb-3">快捷操作</h3>
      <div class="grid grid-cols-3 gap-3">
        <button
          @click="$emit('open-chatbi')"
          class="flex flex-col items-center gap-2 p-3 rounded-lg bg-primary-600/20 text-primary-400"
        >
          <span class="text-2xl">🤖</span>
          <span class="text-xs">AI 洞察</span>
        </button>
        <button
          @click="$emit('open-report')"
          class="flex flex-col items-center gap-2 p-3 rounded-lg bg-dashboard-dark/50 text-dashboard-text"
        >
          <span class="text-2xl">📝</span>
          <span class="text-xs">生成报告</span>
        </button>
        <button
          @click="$emit('open-dispatch')"
          class="flex flex-col items-center gap-2 p-3 rounded-lg bg-dashboard-dark/50 text-dashboard-text"
        >
          <span class="text-2xl">✉️</span>
          <span class="text-xs">派发任务</span>
        </button>
      </div>
    </div>

    <!-- 下钻面板 -->
    <DrillDownPanel
      v-model:visible="showDrillDownPanel"
      :indicatorData="currentIndicator"
      @createTask="handleCreateTask"
    />

    <!-- 任务派发面板 -->
    <TaskDispatchPanel
      v-model:visible="showTaskPanel"
      :taskData="currentTaskData"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BSCOverview from '../components/daily/BSCOverview.vue'
import CoreFinanceCards from '../components/daily/CoreFinanceCards.vue'
import CoreCustomerMetrics from '../components/daily/CoreCustomerMetrics.vue'
import AlertCenter from '../components/daily/AlertCenter.vue'
import DrillDownPanel from '../components/common/DrillDownPanel.vue'
import TaskDispatchPanel from '../components/common/TaskDispatchPanel.vue'

defineEmits(['open-chatbi', 'open-report', 'open-dispatch', 'open-alert-config'])

const showDrillDownPanel = ref(false)
const currentIndicator = ref(null)
const showTaskPanel = ref(false)
const currentTaskData = ref({})

const handleDrillDown = (data) => {
  currentIndicator.value = data
  showDrillDownPanel.value = true
}

const handleClosePanel = () => {
  showDrillDownPanel.value = false
}

const handleCreateTask = (task) => {
  const actualValue = task.actual ?? currentIndicator.value?.actual
  const targetValue = task.target ?? currentIndicator.value?.target
  const achievement = task.achievement ? Number(task.achievement) : ((actualValue / (targetValue || 1)) * 100)
  currentTaskData.value = {
    indicator: task.name || currentIndicator.value?.name,
    currentValue: typeof actualValue === 'number' ? actualValue.toLocaleString() : 'N/A',
    target: typeof targetValue === 'number' ? targetValue.toLocaleString() : 'N/A',
    gap: `${(achievement - 100).toFixed(1)}%`,
    department: '直销事业部',
    owner: '张经理（华东区）',
    rootCause: '',
    action: '',
    chartSnapshot: '当前组合图（计划值/实际值/达成率）'
  }
  showTaskPanel.value = true
}
</script>
