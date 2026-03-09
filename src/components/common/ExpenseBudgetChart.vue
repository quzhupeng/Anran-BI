<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chartInstance = null

const getOption = () => {
  const categories = props.data.map(d => d.name)
  const targets = props.data.map(d => d.target)
  const actuals = props.data.map(d => d.actual)
  const rates = props.data.map(d => d.target > 0 ? Number(((d.actual / d.target) * 100).toFixed(1)) : 0)

  return {
    grid: { left: 100, right: 50, top: 20, bottom: 20 },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#94a3b8', fontSize: 10,
        formatter: (val) => {
          if (val >= 10000) return (val / 10000).toFixed(0) + '万'
          return val
        }
      },
      splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#cbd5e1', fontSize: 11 },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params) => {
        const name = params[0]?.axisValue || ''
        const item = props.data.find(d => d.name === name)
        if (!item) return ''
        const rate = item.target > 0 ? ((item.actual / item.target) * 100).toFixed(1) : 0
        const actualStr = item.actual >= 10000 ? (item.actual / 10000).toFixed(1) + '万' : item.actual.toLocaleString()
        const targetStr = item.target >= 10000 ? (item.target / 10000).toFixed(1) + '万' : item.target.toLocaleString()
        return `<div style="padding:4px 8px;"><div style="font-weight:600;margin-bottom:4px;">${name}</div><div style="color:#94a3b8;">计划: <span style="color:#94a3b8;">${targetStr}</span></div><div style="color:#94a3b8;">实际: <span style="color:#22d3ee;">${actualStr}</span></div><div style="color:#94a3b8;">达成率: <span style="color:${rate >= 95 ? '#22c55e' : rate >= 85 ? '#eab308' : '#ef4444'};">${rate}%</span></div></div>`
      }
    },
    series: [
      {
        name: '计划值',
        type: 'bar',
        data: targets,
        barWidth: 8,
        barGap: '30%',
        itemStyle: { color: '#475569', borderRadius: [0, 3, 3, 0] }
      },
      {
        name: '实际值',
        type: 'bar',
        data: actuals,
        barWidth: 8,
        itemStyle: { color: '#22d3ee', borderRadius: [0, 3, 3, 0] },
        label: {
          show: true,
          position: 'right',
          color: '#cbd5e1',
          fontSize: 9,
          formatter: ({ dataIndex }) => `${rates[dataIndex]}%`
        }
      }
    ]
  }
}

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(getOption())
}

const handleResize = () => { chartInstance?.resize() }

watch(() => props.data, () => {
  if (chartInstance) chartInstance.setOption(getOption())
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
