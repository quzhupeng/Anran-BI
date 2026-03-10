<template>
  <div class="space-y-4 animate-fade-in">
    <div class="overflow-x-auto pb-2">
      <div
        class="grid gap-4"
        :style="homeGridStyle"
      >
        <div
          v-for="item in normalizedHomeLayout.items"
          :key="`${item.componentId}-${item.cellId}`"
          class="min-w-0"
          :style="getLayoutItemStyle(item)"
        >
          <HomeLayoutBlock
            :item="item"
            @drill-down="handleDrillDown"
            @open-report="$emit('open-report')"
            @open-alert-config="$emit('open-alert-config')"
            @dispatch-task="handleDispatchFromIndicator"
            @dispatch-alert="handleDispatchFromAlert"
          />
        </div>
      </div>
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
import { computed, ref } from 'vue'
import DrillDownPanel from '../components/common/DrillDownPanel.vue'
import TaskDispatchPanel from '../components/common/TaskDispatchPanel.vue'
import HomeLayoutBlock from '../components/daily/HomeLayoutBlock.vue'
import { cloneHomeLayout, defaultHomeLayout } from '../utils/homeLayout'

const props = defineProps({
  homeLayout: {
    type: Object,
    default: () => cloneHomeLayout(defaultHomeLayout)
  }
})

defineEmits(['open-chatbi', 'open-report', 'open-dispatch', 'open-alert-config'])

const showDrillDownPanel = ref(false)
const currentIndicator = ref(null)
const showTaskPanel = ref(false)
const currentTaskData = ref({})

const normalizedHomeLayout = computed(() => {
  const sourceLayout = props.homeLayout?.items?.length ? props.homeLayout : defaultHomeLayout

  return {
    grid: {
      cols: sourceLayout.grid?.cols || defaultHomeLayout.grid.cols,
      rows: sourceLayout.grid?.rows || defaultHomeLayout.grid.rows
    },
    items: [...(sourceLayout.items || [])]
      .map(item => {
        const [col = 0, row = 0] = (item.cellId || '0,0').split(',').map(Number)
        return {
          ...item,
          col,
          row,
          width: item.width || 1,
          height: item.height || 1
        }
      })
      .sort((left, right) => (left.row - right.row) || (left.col - right.col))
  }
})

const homeGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${normalizedHomeLayout.value.grid.cols}, minmax(220px, 1fr))`,
  gridTemplateRows: `repeat(${normalizedHomeLayout.value.grid.rows}, minmax(120px, auto))`,
  minWidth: `${Math.max(960, normalizedHomeLayout.value.grid.cols * 240)}px`
}))

const getLayoutItemStyle = (item) => ({
  gridColumn: `${item.col + 1} / span ${item.width}`,
  gridRow: `${item.row + 1} / span ${item.height}`
})

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

const handleDispatchFromIndicator = (taskData) => {
  currentTaskData.value = {
    ...taskData,
    rootCause: '',
    action: ''
  }
  showTaskPanel.value = true
}

const handleDispatchFromAlert = (alert) => {
  currentTaskData.value = {
    indicator: alert.title,
    currentValue: '',
    target: '',
    gap: '',
    department: '直销事业部',
    owner: '',
    rootCause: alert.detail,
    action: '',
    chartSnapshot: `预警：${alert.title}`
  }
  showTaskPanel.value = true
}
</script>
