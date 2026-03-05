<template>
  <div ref="chartRef" class="w-full h-12"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { getMiniTrendOption } from '../../composables/useCharts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  isPositive: {
    type: Boolean,
    default: true
  }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance) return
  chartInstance.setOption(getMiniTrendOption(props.data, props.isPositive))
}

const handleResize = () => {
  chartInstance?.resize()
}

watch(() => props.data, updateChart, { deep: true })
watch(() => props.isPositive, updateChart)

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
