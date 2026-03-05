<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- 左侧：目标缺口图表 -->
    <div class="gradient-border p-4">
      <h2 class="text-sm font-semibold text-dashboard-text mb-4 flex items-center gap-2">
        <span>📉</span>
        差距分析
        <span class="text-xs text-dashboard-muted font-normal ml-2 hidden sm:inline">未达标指标缺口</span>
      </h2>

      <div ref="gapChartRef" class="w-full h-48 sm:h-64"></div>
    </div>

    <!-- 右侧：过程指标原因分析 -->
    <div class="gradient-border p-4">
      <h2 class="text-sm font-semibold text-dashboard-text mb-4 flex items-center gap-2">
        <span>🔍</span>
        原因分析
        <span class="text-xs text-dashboard-muted font-normal ml-2 hidden sm:inline">关联过程指标</span>
      </h2>

      <div ref="processChartRef" class="w-full h-48 sm:h-64"></div>

      <!-- 原因说明列表 -->
      <div class="mt-4 space-y-2">
        <div
          v-for="(cause, index) in gapAnalysisData.processCauses"
          :key="cause.name"
          class="flex items-center gap-2 text-xs bg-dashboard-dark/30 rounded px-2 py-1.5"
        >
          <span class="w-5 h-5 rounded bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs shrink-0">
            {{ index + 1 }}
          </span>
          <span class="text-dashboard-muted truncate">{{ cause.name }}:</span>
          <span
            class="font-medium shrink-0"
            :class="cause.value >= cause.target ? 'text-status-green' : 'text-status-red'"
          >
            {{ cause.value }}%
          </span>
          <span class="text-dashboard-muted shrink-0 hidden sm:inline">/ 目标 {{ cause.target }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { gapAnalysisData } from '../../composables/useMockData'
import { getGapBarOption, getProcessBarOption } from '../../composables/useCharts'

const gapChartRef = ref(null)
const processChartRef = ref(null)
let gapChartInstance = null
let processChartInstance = null

const initCharts = () => {
  if (gapChartRef.value) {
    gapChartInstance = echarts.init(gapChartRef.value)
    gapChartInstance.setOption(getGapBarOption(gapAnalysisData.indicators))
  }
  
  if (processChartRef.value) {
    processChartInstance = echarts.init(processChartRef.value)
    processChartInstance.setOption(getProcessBarOption(gapAnalysisData.processCauses))
  }
}

const handleResize = () => {
  gapChartInstance?.resize()
  processChartInstance?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  gapChartInstance?.dispose()
  processChartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
