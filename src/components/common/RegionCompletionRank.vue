<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)
let chartInstance = null

const getOption = () => {
  const sorted = [...props.data].sort((a, b) => b.rate - a.rate)
  return {
    grid: {
      left: 50,
      right: 16,
      top: 8,
      bottom: 20
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 140,
      axisLabel: {
        color: '#94a3b8',
        fontSize: 10,
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: { color: 'rgba(51, 65, 85, 0.28)', type: 'dashed' }
      }
    },
    yAxis: {
      type: 'category',
      data: sorted.map((item) => item.name),
      inverse: true,
      axisLabel: {
        color: '#cbd5e1',
        fontSize: 11
      },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params) => {
        const data = params?.[0]?.data || {}
        return [
          `<div>${data.name}</div>`,
          `<div style="color:#94a3b8">达成率：<span style="color:#22d3ee">${data.rate?.toFixed?.(1) ?? data.value}%</span></div>`,
          `<div style="color:#94a3b8">实际：<span style="color:#e2e8f0">${(data.actual || 0).toLocaleString()}</span></div>`,
          `<div style="color:#94a3b8">目标：<span style="color:#fbbf24">${(data.target || 0).toLocaleString()}</span></div>`
        ].join('')
      }
    },
    series: [
      {
        type: 'bar',
        barWidth: 10,
        data: sorted.map((item, idx) => ({
          name: item.name,
          value: Number(item.rate.toFixed(1)),
          rate: item.rate,
          actual: item.actual,
          target: item.target,
          itemStyle: {
            color: idx === 0 ? '#22d3ee' : idx === 1 ? '#38bdf8' : '#6366f1',
            borderRadius: [0, 4, 4, 0]
          }
        })),
        label: {
          show: true,
          position: 'right',
          color: '#cbd5e1',
          fontSize: 10,
          formatter: ({ value }) => `${value}%`
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

const updateChart = () => {
  if (!chartInstance) return
  chartInstance.setOption(getOption())
}

const handleResize = () => {
  chartInstance?.resize()
}

watch(() => props.data, updateChart, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
