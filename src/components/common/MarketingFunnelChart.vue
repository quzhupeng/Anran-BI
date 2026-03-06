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

const getOption = () => ({
  color: ['#22d3ee', '#38bdf8', '#818cf8', '#34d399'],
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderColor: '#334155',
    textStyle: { color: '#e2e8f0', fontSize: 12 },
    formatter: (params) => {
      const value = params?.value || 0
      return `${params.name}<br/>数量：${value.toLocaleString()}`
    }
  },
  series: [
    {
      type: 'funnel',
      left: '10%',
      top: 10,
      bottom: 10,
      width: '80%',
      min: 0,
      max: props.data[0]?.value || 1,
      minSize: '20%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        color: '#e2e8f0',
        formatter: ({ name, value }) => `${name}\n${value.toLocaleString()}`,
        fontSize: 10
      },
      labelLine: { show: false },
      itemStyle: {
        borderColor: '#0f172a',
        borderWidth: 1
      },
      emphasis: {
        label: { fontSize: 11 }
      },
      data: props.data
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
