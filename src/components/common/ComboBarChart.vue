<template>
  <div ref="chartRef" class="w-full" :style="{ height: height + 'px' }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  // 实际值数据（柱状图）
  data: {
    type: Array,
    default: () => []
  },
  // 计划值（并排柱）
  targets: {
    type: Array,
    default: () => []
  },
  height: {
    type: Number,
    default: 140
  },
  // 是否为累计视图
  isAccumulated: {
    type: Boolean,
    default: false
  }
})

const chartRef = ref(null)
let chartInstance = null

// 生成日期标签
const dayLabels = computed(() => {
  const count = props.data.length
  if (props.isAccumulated) {
    return Array.from({ length: count }, (_, i) => `${i + 1}期`)
  }
  return Array.from({ length: count }, (_, i) => `${i + 1}日`)
})

const getOption = () => {
  const actuals = props.data.map(d => typeof d === 'object' ? d.value : d)
  const targets = props.targets.length > 0 ? props.targets : props.data.map(() => 0)
  const achievementRates = actuals.map((value, i) => {
    const target = targets[i]
    if (!target) return 0
    return Number(((value / target) * 100).toFixed(1))
  })

  return {
    grid: {
      left: 45,
      right: 42,
      top: 28,
      bottom: 45
    },
    legend: {
      right: 5,
      top: 0,
      textStyle: { color: '#cbd5e1', fontSize: 10 },
      itemHeight: 8,
      itemWidth: 10,
      data: ['计划值', '实际值', '达成率']
    },
    xAxis: {
      type: 'category',
      data: dayLabels.value,
      axisLine: { 
        show: true, 
        lineStyle: { color: '#475569' } 
      },
      axisTick: { show: false },
      axisLabel: { 
        show: true, 
        color: '#94a3b8', 
        fontSize: 11,
        interval: Math.max(0, Math.floor(dayLabels.value.length / 8))
      }
    },
    yAxis: [
      {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { 
          show: true,
          lineStyle: { color: 'rgba(51, 65, 85, 0.3)', type: 'dashed' } 
        },
        axisLabel: { 
          show: true, 
          color: '#94a3b8', 
          fontSize: 10,
          formatter: (val) => {
            if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M'
            if (val >= 10000) return (val / 10000).toFixed(0) + '万'
            if (val >= 1000) return (val / 1000).toFixed(0) + 'K'
            return val
          }
        }
      },
      {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        min: 0,
        max: 150,
        axisLabel: {
          color: '#a5b4fc',
          fontSize: 10,
          formatter: '{value}%'
        }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        start: dayLabels.value.length > 10 ? 45 : 0,
        end: 100
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        start: dayLabels.value.length > 10 ? 45 : 0,
        end: 100,
        bottom: 10,
        height: 12,
        borderColor: '#1e293b',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        fillerColor: 'rgba(56, 189, 248, 0.25)',
        handleStyle: { color: '#38bdf8' },
        moveHandleSize: 4
      }
    ],
    series: [
      // 柱状图 - 计划值
      {
        name: '计划值',
        type: 'bar',
        data: targets,
        barWidth: 8,
        itemStyle: {
          color: '#475569',
          borderRadius: [3, 3, 0, 0]
        }
      },
      // 柱状图 - 实际值
      {
        name: '实际值',
        type: 'bar',
        data: actuals,
        barWidth: 8,
        itemStyle: {
          color: '#22d3ee',
          borderRadius: [3, 3, 0, 0]
        }
      },
      // 折线图 - 达成率
      {
        name: '达成率',
        type: 'line',
        yAxisIndex: 1,
        data: achievementRates,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          color: '#facc15',
          width: 2
        },
        itemStyle: {
          color: '#fde047'
        },
        smooth: true
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params) => {
        const day = params[0].axisValue
        const target = params[0]?.value || 0
        const actual = params[1]?.value || 0
        const rate = target > 0 ? ((actual / target) * 100).toFixed(1) : 0
        
        let actualStr = actual >= 10000 ? (actual / 10000).toFixed(1) + '万' : actual.toLocaleString()
        let targetStr = target >= 10000 ? (target / 10000).toFixed(1) + '万' : target.toLocaleString()
        
        return `<div style="padding: 4px 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${day}</div>
          <div style="color: #94a3b8;">实际: <span style="color: #e2e8f0;">${actualStr}</span></div>
          <div style="color: #94a3b8;">目标: <span style="color: #f59e0b;">${targetStr}</span></div>
          <div style="color: #94a3b8;">达成率: <span style="color: ${rate >= 95 ? '#22c55e' : rate >= 85 ? '#eab308' : '#ef4444'};">${rate}%</span></div>
        </div>`
      }
    }
  }
}

const initChart = () => {
  if (!chartRef.value || !props.data.length) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(getOption())
}

const handleResize = () => {
  chartInstance?.resize()
}

watch(() => [props.data, props.targets], () => {
  if (chartInstance) {
    chartInstance.setOption(getOption())
  }
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
