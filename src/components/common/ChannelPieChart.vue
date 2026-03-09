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
  const total = props.data.reduce((sum, item) => sum + item.value, 0)
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params) => {
        const valStr = params.value >= 10000
          ? (params.value / 10000).toFixed(1) + '万'
          : params.value.toLocaleString()
        return `<div style="padding:4px 8px;"><div style="font-weight:600;">${params.name}</div><div style="color:#94a3b8;">金额: <span style="color:#22d3ee;">${valStr}</span></div><div style="color:#94a3b8;">占比: <span style="color:#fbbf24;">${params.percent}%</span></div></div>`
      }
    },
    legend: {
      orient: 'vertical',
      right: 4,
      top: 'center',
      textStyle: { color: '#cbd5e1', fontSize: 10 },
      itemHeight: 8,
      itemWidth: 10,
      formatter: (name) => {
        const item = props.data.find(d => d.name === name)
        if (!item) return name
        const pct = ((item.value / total) * 100).toFixed(0)
        return `${name} ${pct}%`
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#e2e8f0'
          }
        },
        labelLine: { show: false },
        data: props.data.map((item, idx) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: ['#22d3ee', '#6366f1', '#f59e0b', '#64748b'][idx] || '#475569'
          }
        }))
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
