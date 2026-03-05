<template>
  <div class="gradient-border p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-semibold text-dashboard-text flex items-center gap-2">
        <span>🎯</span>
        过程驱动雷达图
      </h2>
      <span class="text-xs text-dashboard-muted">本周进度</span>
    </div>
    
    <div ref="chartRef" class="w-full h-64"></div>
    
    <!-- 图例说明 -->
    <div class="mt-4 grid grid-cols-3 gap-2">
      <div 
        v-for="metric in processIndicators.current.metrics" 
        :key="metric.name"
        class="flex items-center justify-between text-xs bg-dashboard-dark/30 rounded px-2 py-1"
      >
        <span class="text-dashboard-muted truncate">{{ metric.name }}</span>
        <span 
          class="font-medium"
          :class="metric.value >= 100 ? 'text-status-green' : metric.value >= 80 ? 'text-status-yellow' : 'text-status-red'"
        >
          {{ metric.value }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { processIndicators } from '../../composables/useMockData'
import { getRadarOption } from '../../composables/useCharts'

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(getRadarOption(processIndicators.current))
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
