<template>
  <div ref="chartRef" class="w-full" :style="{ height: height + 'px' }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  // 实际值数据（柱状图高度）
  data: {
    type: Array,
    default: () => []
  },
  // 目标值（用于计算达成率，决定柱子颜色）
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
  if (props.isAccumulated) {
    return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  }
  const count = Math.min(props.data.length, 15)
  return Array.from({ length: count }, (_, i) => `${i + 1}日`)
})

const getOption = () => {
  const actuals = props.data.map(d => typeof d === 'object' ? d.value : d)
  const targets = props.targets.length > 0 ? props.targets : props.data.map(() => 0)
  
  // 根据达成率决定柱子颜色
  const getBarColor = (actual, target) => {
    if (target <= 0) return '#38bdf8' // 蓝色 - 无目标数据
    const rate = actual / target
    if (rate >= 0.95) return '#22c55e' // 绿色 - 达标
    if (rate >= 0.85) return '#eab308' // 黄色 - 接近
    return '#ef4444' // 红色 - 未达标
  }
  
  // 柱状图数据带颜色
  const barData = actuals.map((value, i) => ({
    value,
    itemStyle: {
      color: getBarColor(value, targets[i]),
      borderRadius: [3, 3, 0, 0]
    }
  }))

  return {
    grid: {
      left: 45,
      right: 15,
      top: 15,
      bottom: 25
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
        interval: 0  // 显示所有标签
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
    series: [
      // 柱状图 - 实际值
      {
        type: 'bar',
        data: barData,
        barWidth: 12,
        barCategoryGap: '30%'
      },
      // 折线图 - 趋势线（跟随实际值）
      {
        type: 'line',
        data: actuals,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          color: '#38bdf8',
          width: 2
        },
        itemStyle: {
          color: '#38bdf8'
        },
        smooth: false
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params) => {
        const day = params[0].axisValue
        const actual = params[0].value
        const target = targets[params[0].dataIndex] || 0
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
