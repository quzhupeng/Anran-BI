<template>
  <div
    class="gradient-border p-4 hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
    @click="handleDrillDown"
  >
    <!-- 卡片头部 -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <StatusLight :status="status" :pulse="status === 'red'" />
        <h3 class="text-sm font-semibold text-dashboard-text">{{ title }}</h3>
        <span class="text-xs text-dashboard-muted opacity-0 group-hover:opacity-100 transition-opacity">
          点击下钻 →
        </span>
      </div>
      <span
        class="text-[11px] text-dashboard-muted"
        :title="`目标值：${formattedTarget}${unit}，达成率：${formattedAchievement}`"
      >
        悬浮查看目标/达成率
      </span>
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
        <span class="text-xs text-primary-300">达成率 {{ formattedAchievement }}</span>
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
        :isAccumulated="daysInRange > 31"
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
import { computed } from 'vue'
import StatusLight from './StatusLight.vue'
import ComboBarChart from './ComboBarChart.vue'
import { useGlobalFilter } from '../../composables/useGlobalFilter'

const props = defineProps({
  title: String,
  unit: String,
  showTab: { type: Boolean, default: false },
  monthData: Object,
  accumulatedData: Object,
  subMetric: Object
})

const { state } = useGlobalFilter()

const daysInRange = computed(() => {
  const start = new Date(state.startDate)
  const end = new Date(state.endDate)
  const from = start <= end ? start : end
  const to = start <= end ? end : start
  const diff = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(7, Math.min(90, Number.isNaN(diff) ? 30 : diff))
})

const currentData = computed(() => (daysInRange.value > 31 ? props.accumulatedData : props.monthData) || props.monthData || props.accumulatedData)

const actual = computed(() => currentData.value?.actual || 0)
const target = computed(() => currentData.value?.target || 0)
const mom = computed(() => currentData.value?.mom || 0)
const yoy = computed(() => currentData.value?.yoy || 0)
const currentSubMetric = computed(() => currentData.value?.subMetrics || props.subMetric)
const formattedAchievement = computed(() => `${((actual.value / (target.value || 1)) * 100).toFixed(1)}%`)

const status = computed(() => {
  const rate = actual.value / target.value
  if (rate >= 0.95) return 'green'
  if (rate >= 0.85) return 'yellow'
  return 'red'
})

const titleSeed = computed(() => {
  return Array.from(props.title || '').reduce((sum, char) => sum + char.charCodeAt(0), 0)
})

const targetCurve = computed(() => {
  const days = daysInRange.value
  const seed = titleSeed.value
  const baseTarget = target.value
  const dayBase = baseTarget / days
  const weeklyDistribution = [0.86, 0.92, 0.97, 1.04, 1.12, 1.08, 1.01]

  const rawFactors = []
  for (let i = 0; i < days; i++) {
    const weeklyFactor = weeklyDistribution[i % 7]
    const waveFactor = 1 + 0.08 * Math.sin((i + seed) / 6) + 0.04 * Math.cos((i + seed) / 9)
    rawFactors.push(weeklyFactor * waveFactor)
  }

  const avgFactor = rawFactors.reduce((sum, item) => sum + item, 0) / rawFactors.length
  return rawFactors.map((factor) => dayBase * (factor / avgFactor))
})

// 生成每日数据（模拟数据）
const dailyData = computed(() => {
  const days = daysInRange.value
  const seed = titleSeed.value

  const data = []
  for (let i = 0; i < days; i++) {
    const trend = days > 40 ? ((i / days) - 0.5) * 0.08 : 0
    const harmonic = 0.14 * Math.sin((i + seed) / 2.4) + 0.1 * Math.cos((i + seed) / 4.8)
    const pulse = i % 11 === 0 ? -0.16 : i % 13 === 0 ? 0.12 : 0
    const ratio = Math.max(0.62, Math.min(1.28, 0.92 + harmonic + pulse + trend))
    const dailyActual = targetCurve.value[i] * ratio
    data.push(Math.round(dailyActual))
  }
  return data
})

const dailyTargets = computed(() => {
  return targetCurve.value.map(item => Math.round(item))
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
