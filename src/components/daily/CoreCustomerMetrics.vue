<template>
  <div class="gradient-border p-4 h-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-semibold text-dashboard-text flex items-center gap-2">
        <span>👥</span>
        核心客户指标
      </h2>
      <span class="text-xs text-dashboard-muted">默认指标：报单人数</span>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-3">
      <div class="bg-dashboard-dark/40 rounded-lg border border-dashboard-border p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs text-dashboard-muted">报单人数（区间累计）</div>
          <div class="text-sm font-semibold text-primary-300">{{ totalPeople.toLocaleString() }} 人</div>
        </div>
        <div ref="chartRef" class="w-full h-60"></div>
      </div>

      <button
        class="min-h-[220px] rounded-lg border border-dashed border-primary-500/50 bg-primary-900/10 hover:bg-primary-900/20 transition-colors flex items-center justify-center"
      >
        <div class="text-center">
          <div class="text-3xl text-primary-300 leading-none">+</div>
          <div class="text-sm font-medium text-primary-300 mt-2">添加指标</div>
          <div class="text-xs text-dashboard-muted mt-1">支持自定义扩展</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { useGlobalFilter } from '../../composables/useGlobalFilter'

const { state } = useGlobalFilter()

const chartRef = ref(null)
let chartInstance = null

const dayCount = computed(() => {
  const start = new Date(state.startDate)
  const end = new Date(state.endDate)
  const from = start <= end ? start : end
  const to = start <= end ? end : start
  const diff = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(7, Math.min(90, Number.isNaN(diff) ? 30 : diff))
})

const channelData = computed(() => {
  const days = dayCount.value
  const base = {
    线下会销: 0,
    私域社群: 0,
    直营门店: 0,
    直播转化: 0
  }

  for (let i = 0; i < days; i++) {
    base.线下会销 += Math.round(140 + 26 * Math.sin(i / 4))
    base.私域社群 += Math.round(95 + 18 * Math.cos(i / 5))
    base.直营门店 += Math.round(80 + 12 * Math.sin(i / 6 + 0.6))
    base.直播转化 += Math.round(62 + 15 * Math.cos(i / 4 + 0.9))
  }

  return Object.entries(base).map(([name, value]) => ({ name, value }))
})

const totalPeople = computed(() => {
  return channelData.value.reduce((sum, item) => sum + item.value, 0)
})

const getOption = () => ({
  color: ['#22d3ee', '#818cf8', '#34d399', '#f59e0b'],
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderColor: '#334155',
    textStyle: { color: '#e2e8f0' }
  },
  legend: {
    orient: 'vertical',
    right: 0,
    top: 'middle',
    textStyle: { color: '#cbd5e1', fontSize: 11 }
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      data: channelData.value,
      label: {
        color: '#e2e8f0',
        formatter: '{d}%'
      },
      labelLine: {
        lineStyle: { color: '#64748b' }
      }
    }
  ]
})

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(getOption())
}

const updateChart = () => {
  if (!chartInstance) return
  chartInstance.setOption(getOption())
}

const handleResize = () => {
  chartInstance?.resize()
}

watch(() => [state.startDate, state.endDate], updateChart)

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
