<template>
  <div
    class="gradient-border p-4 hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
    @click="handleDrillDown"
  >
    <!-- 卡片头部 -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <StatusLight :status="status" :pulse="status === 'red'" />
        <h3 class="text-sm font-medium text-dashboard-text">{{ title }}</h3>
        <span class="text-xs text-dashboard-muted opacity-0 group-hover:opacity-100 transition-opacity">
          点击下钻 →
        </span>
      </div>
      <TabSwitch v-if="showTab" v-model="activeTab" @click.stop />
    </div>
    
    <!-- 主要数值 -->
    <div class="mb-3">
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-bold metric-value text-dashboard-text">
          {{ formattedActual }}
        </span>
        <span class="text-sm text-dashboard-muted">{{ unit }}</span>
      </div>
      <div class="flex items-center gap-4 mt-1">
        <span class="text-xs text-dashboard-muted">目标: {{ formattedTarget }} {{ unit }}</span>
        <span class="text-xs" :class="changeClass(mom)">
          环比 {{ formatChange(mom) }}
        </span>
        <span class="text-xs" :class="changeClass(yoy)">
          同比 {{ formatChange(yoy) }}
        </span>
      </div>
    </div>
    
    <!-- 柱状图+折线组合图表 -->
    <div class="h-32">
      <ComboBarChart
        :data="dailyData"
        :targets="dailyTargets"
        :height="120"
        :isAccumulated="activeTab === 'accumulated'"
      />
    </div>
    
    <!-- 子指标 -->
    <div v-if="currentSubMetric" class="mt-3 pt-3 border-t border-dashboard-border">
      <div class="flex items-center justify-between">
        <span class="text-xs text-dashboard-muted">{{ currentSubMetric.name }}</span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium" :class="getSubMetricClass()">
            {{ currentSubMetric.actual }}{{ currentSubMetric.unit || '%' }}
          </span>
          <span class="text-xs text-dashboard-muted">
            / 目标 {{ currentSubMetric.target }}{{ currentSubMetric.unit || '%' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StatusLight from './StatusLight.vue'
import TabSwitch from './TabSwitch.vue'
import ComboBarChart from './ComboBarChart.vue'

const props = defineProps({
  title: String,
  unit: String,
  showTab: { type: Boolean, default: true },
  monthData: Object,
  accumulatedData: Object,
  subMetric: Object
})

const activeTab = ref('month')

const currentData = computed(() => {
  return activeTab.value === 'month' ? props.monthData : props.accumulatedData
})

const actual = computed(() => currentData.value?.actual || 0)
const target = computed(() => currentData.value?.target || 0)
const mom = computed(() => currentData.value?.mom || 0)
const yoy = computed(() => currentData.value?.yoy || 0)
const currentSubMetric = computed(() => currentData.value?.subMetrics || props.subMetric)

const status = computed(() => {
  const rate = actual.value / target.value
  if (rate >= 0.95) return 'green'
  if (rate >= 0.85) return 'yellow'
  return 'red'
})

// 生成每日数据（模拟数据）
const dailyData = computed(() => {
  // 当月显示15天，累计显示12个月
  const days = activeTab.value === 'month' ? 15 : 12
  const baseActual = actual.value
  const baseTarget = target.value

  const data = []
  for (let i = 0; i < days; i++) {
    // 生成有一定波动的每日数据
    const ratio = 0.85 + Math.random() * 0.25  // 85%-110%之间波动
    const dailyTarget = baseTarget / days
    const dailyActual = dailyTarget * ratio
    data.push(Math.round(dailyActual))
  }
  return data
})

const dailyTargets = computed(() => {
  const days = activeTab.value === 'month' ? 15 : 12
  const baseTarget = target.value
  const dailyTarget = baseTarget / days
  return Array(days).fill(Math.round(dailyTarget))
})

const formattedActual = computed(() => formatLargeNumber(actual.value))
const formattedTarget = computed(() => formatLargeNumber(target.value))

const formatLargeNumber = (num) => {
  if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(2) + '万'
  return num.toLocaleString()
}

const formatChange = (value) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value}%`
}

const changeClass = (value) => {
  return value >= 0 ? 'text-status-green font-medium' : 'text-status-red font-medium'
}

const getSubMetricClass = () => {
  if (!currentSubMetric.value) return ''
  const rate = currentSubMetric.value.actual / currentSubMetric.value.target
  if (rate >= 0.95) return 'text-status-green'
  if (rate >= 0.85) return 'text-status-yellow'
  return 'text-status-red'
}

const emit = defineEmits(['drillDown'])

const handleDrillDown = () => {
  emit('drillDown', {
    name: props.title,
    actual: actual.value,
    target: target.value,
    unit: props.unit,
    achievement: (actual.value / target.value * 100).toFixed(1)
  })
}
</script>
