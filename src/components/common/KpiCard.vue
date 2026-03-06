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
    
    <!-- 柱状图+折线组合图表 + 右侧扩展图 -->
    <div
      :class="showAuxChart ? 'grid grid-cols-1 lg:grid-cols-[1fr_190px] gap-3 items-stretch' : ''"
    >
      <div class="h-36">
        <ComboBarChart
          :data="dailyData"
          :targets="dailyTargets"
          :labels="dateLabels"
          :height="136"
          :isAccumulated="daysInRange > 31"
        />
      </div>

      <div
        v-if="showRegionRank"
        class="h-36 rounded-lg border border-dashboard-border bg-dashboard-dark/35 p-2"
      >
        <div class="text-[11px] text-dashboard-muted mb-1">区域达成排名</div>
        <RegionCompletionRank :data="regionCompletionData" />
      </div>

      <div
        v-else-if="showMarketingFunnel"
        class="h-36 rounded-lg border border-dashboard-border bg-dashboard-dark/35 p-2"
      >
        <div class="text-[11px] text-dashboard-muted mb-1">营销漏斗（流量→成交）</div>
        <MarketingFunnelChart :data="marketingFunnelData" />
      </div>
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
import RegionCompletionRank from './RegionCompletionRank.vue'
import MarketingFunnelChart from './MarketingFunnelChart.vue'
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

const normalizeDate = (dateString, fallback) => {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? fallback : date
}

const dateRange = computed(() => {
  const fallbackEnd = new Date()
  const fallbackStart = new Date(fallbackEnd)
  fallbackStart.setDate(fallbackEnd.getDate() - 29)
  const start = normalizeDate(state.startDate, fallbackStart)
  const end = normalizeDate(state.endDate, fallbackEnd)
  return start <= end ? { from: start, to: end } : { from: end, to: start }
})

const daysInRange = computed(() => {
  const diff = Math.floor((dateRange.value.to - dateRange.value.from) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, Math.min(366, Number.isNaN(diff) ? 30 : diff))
})

const dateLabels = computed(() => {
  return Array.from({ length: daysInRange.value }, (_, index) => {
    const date = new Date(dateRange.value.from)
    date.setDate(date.getDate() + index)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
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
  const weeklyDistribution = [0.84, 0.9, 0.98, 1.05, 1.15, 1.1, 0.98]

  const rawFactors = []
  for (let i = 0; i < days; i++) {
    const weeklyFactor = weeklyDistribution[i % 7]
    const waveFactor = 1 + 0.12 * Math.sin((i + seed) / 5) + 0.06 * Math.cos((i + seed) / 8)
    rawFactors.push(weeklyFactor * waveFactor)
  }

  const avgFactor = rawFactors.reduce((sum, item) => sum + item, 0) / rawFactors.length
  return rawFactors.map((factor) => dayBase * (factor / avgFactor))
})

const completionBase = computed(() => actual.value / (target.value || 1))

// 生成每日数据（模拟数据，增强起伏，避免达成率过直）
const dailyData = computed(() => {
  const days = daysInRange.value
  const seed = titleSeed.value
  const rawRatios = []
  for (let i = 0; i < days; i++) {
    const trend = days > 20 ? ((i / (days - 1 || 1)) - 0.5) * 0.12 : 0
    const harmonic = 0.18 * Math.sin((i + seed) / 1.9) + 0.12 * Math.cos((i + seed) / 3.4)
    const pulse = i % 9 === 0 ? -0.22 : i % 13 === 0 ? 0.17 : 0
    rawRatios.push(1 + harmonic + pulse + trend)
  }
  const avg = rawRatios.reduce((sum, value) => sum + value, 0) / rawRatios.length
  return rawRatios.map((ratio, index) => {
    const normalized = completionBase.value * (ratio / avg)
    const clipped = Math.max(0.56, Math.min(1.42, normalized))
    return Math.round(targetCurve.value[index] * clipped)
  })
})

const dailyTargets = computed(() => {
  return targetCurve.value.map(item => Math.round(item))
})

const showRegionRank = computed(() => props.title === '报单收入')
const showMarketingFunnel = computed(() => props.title === '线上营销收入')
const showAuxChart = computed(() => showRegionRank.value || showMarketingFunnel.value)

const regionCompletionData = computed(() => {
  const baseRate = completionBase.value * 100
  const regionalTargets = [
    { name: '华北', target: target.value * 0.32, offset: -6 },
    { name: '华南', target: target.value * 0.34, offset: 2 },
    { name: '华东', target: target.value * 0.34, offset: 5 }
  ]
  return regionalTargets.map((region, index) => {
    const seedWave = Math.sin((titleSeed.value + index * 11) / 8) * 3.5
    const rate = Math.max(72, Math.min(128, baseRate + region.offset + seedWave))
    const actualValue = region.target * (rate / 100)
    return {
      name: region.name,
      target: Math.round(region.target),
      actual: Math.round(actualValue),
      rate
    }
  })
})

const marketingFunnelData = computed(() => {
  const deals = Math.max(520, Math.round(actual.value / 18000))
  const opportunities = Math.round(deals / 0.28)
  const qualifiedLeads = Math.round(opportunities / 0.36)
  const leads = Math.round(qualifiedLeads / 0.32)
  const traffic = Math.round(leads / 0.12)
  return [
    { name: '流量曝光', value: traffic },
    { name: '线索收集', value: leads },
    { name: '有效线索', value: qualifiedLeads },
    { name: '意向商机', value: opportunities },
    { name: '成交报单', value: deals }
  ]
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
