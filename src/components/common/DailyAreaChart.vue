<template>
  <div ref="chartRef" class="w-full" :style="{ height: height + 'px' }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  labels: { type: Array, default: () => [] },
  height: { type: Number, default: 204 }
})

const chartRef = ref(null)
let chartInstance = null

const dayLabels = computed(() => {
  if (props.labels.length) return props.labels
  return Array.from({ length: props.data.length }, (_, i) => `${i + 1}日`)
})

const getOption = () => {
  const actuals = props.data.map(d => typeof d === 'object' ? d.value : d)
  return {
    grid: { left: 45, right: 16, top: 20, bottom: 45 },
    legend: {
      right: 5, top: 0,
      textStyle: { color: '#cbd5e1', fontSize: 10 },
      itemHeight: 8, itemWidth: 10,
      data: ['每日收入']
    },
    xAxis: {
      type: 'category',
      data: dayLabels.value,
      boundaryGap: false,
      axisLine: { show: true, lineStyle: { color: '#475569' } },
      axisTick: { show: false },
      axisLabel: {
        show: true, color: '#94a3b8', fontSize: 11,
        interval: Math.max(0, Math.floor(dayLabels.value.length / 8))
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: 'rgba(51, 65, 85, 0.3)', type: 'dashed' }
      },
      axisLabel: {
        show: true, color: '#94a3b8', fontSize: 10,
        formatter: (val) => {
          if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M'
          if (val >= 10000) return (val / 10000).toFixed(0) + '万'
          if (val >= 1000) return (val / 1000).toFixed(0) + 'K'
          return val
        }
      }
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, start: 0, end: 100 },
      {
        type: 'slider', xAxisIndex: 0, start: 0, end: 100,
        bottom: 10, height: 12,
        borderColor: '#1e293b',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        fillerColor: 'rgba(56, 189, 248, 0.25)',
        handleStyle: { color: '#38bdf8' },
        moveHandleSize: 4
      }
    ],
    series: [
      {
        name: '每日收入',
        type: 'line',
        data: actuals,
        smooth: true,
        symbol: 'circle',
        symbolSize: 3,
        showSymbol: false,
        lineStyle: { color: '#22d3ee', width: 2 },
        itemStyle: { color: '#22d3ee' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 211, 238, 0.35)' },
            { offset: 1, color: 'rgba(34, 211, 238, 0.02)' }
          ])
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params) => {
        const p = params[0]
        let valStr = p.value >= 10000 ? (p.value / 10000).toFixed(1) + '万' : p.value.toLocaleString()
        return `<div style="padding:4px 8px;"><div style="font-weight:600;margin-bottom:4px;">${p.axisValue}</div><div style="color:#94a3b8;">收入: <span style="color:#22d3ee;">${valStr}</span></div></div>`
      }
    }
  }
}

const initChart = () => {
  if (!chartRef.value || !props.data.length) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(getOption())
}

const handleResize = () => { chartInstance?.resize() }

watch(() => [props.data, props.labels], () => {
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
