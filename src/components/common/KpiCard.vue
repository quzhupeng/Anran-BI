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

    <!-- 模块内日期筛选器（报单收入、线上营销收入） -->
    <div v-if="showModuleDatePicker" class="flex items-center gap-2 mb-3">
      <label class="text-xs text-dashboard-muted">日期范围：</label>
      <div class="flex items-center gap-1.5 bg-dashboard-dark/50 rounded-lg border border-dashboard-border px-2 py-1">
        <input
          type="date"
          :value="moduleStartDate"
          @change="moduleStartDate = $event.target.value"
          class="bg-transparent text-xs text-dashboard-text focus:outline-none w-[110px]"
        />
        <span class="text-dashboard-muted text-xs">至</span>
        <input
          type="date"
          :value="moduleEndDate"
          @change="moduleEndDate = $event.target.value"
          class="bg-transparent text-xs text-dashboard-text focus:outline-none w-[110px]"
        />
      </div>
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

    <!-- 图表区域 -->
    <div
      :class="showAuxChart ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_520px] gap-4 items-stretch' : ''"
    >
      <!-- 左侧主图表 -->
      <div class="h-80">
        <!-- 报单收入：仅实际值柱状图 -->
        <ComboBarChart
          v-if="chartMode === 'actual-only'"
          :data="moduleDailyData"
          :targets="[]"
          :labels="moduleDateLabels"
          :height="320"
          :hideTargetAndRate="true"
        />
        <!-- 线上营销收入：每日面积图 -->
        <DailyAreaChart
          v-else-if="chartMode === 'area'"
          :data="moduleDailyData"
          :labels="moduleDateLabels"
          :height="320"
        />
        <!-- 利润：月度目标达成趋势图 -->
        <ComboBarChart
          v-else-if="chartMode === 'monthly'"
          :data="monthlyActuals"
          :targets="monthlyTargets"
          :labels="monthLabels"
          :height="320"
        />
        <!-- 默认 -->
        <ComboBarChart
          v-else
          :data="dailyData"
          :targets="dailyTargets"
          :labels="dateLabels"
          :height="320"
          :isAccumulated="daysInRange > 31"
        />
      </div>

      <!-- 右侧辅助图表 -->
      <!-- 报单收入：区域达成排名 -->
      <div
        v-if="showRegionRank"
        class="h-80 rounded-lg border border-dashboard-border bg-dashboard-dark/35 p-5"
      >
        <div class="text-xl font-bold text-dashboard-text mb-4">区域达成排名</div>
        <RegionCompletionRank :data="regionCompletionData" />
      </div>

      <!-- 线上营销收入：渠道贡献分析 -->
      <div
        v-else-if="showChannelPie"
        class="h-80 rounded-lg border border-dashboard-border bg-dashboard-dark/35 p-5"
      >
        <div class="text-xl font-bold text-dashboard-text mb-4">渠道贡献分析</div>
        <ChannelPieChart :data="channelContributionData" />
      </div>

      <!-- 利润：费用预算执行 -->
      <div
        v-else-if="showExpenseBudget"
        class="h-80 rounded-lg border border-dashboard-border bg-dashboard-dark/35 p-5"
      >
        <div class="text-xl font-bold text-dashboard-text mb-4">主要费用项预算执行情况</div>
        <ExpenseBudgetChart :data="expenseBudgetData" />
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
import { computed, ref } from 'vue'
import StatusLight from './StatusLight.vue'
import ComboBarChart from './ComboBarChart.vue'
import DailyAreaChart from './DailyAreaChart.vue'
import RegionCompletionRank from './RegionCompletionRank.vue'
import ChannelPieChart from './ChannelPieChart.vue'
import ExpenseBudgetChart from './ExpenseBudgetChart.vue'
import { useGlobalFilter } from '../../composables/useGlobalFilter'

const props = defineProps({
  title: String,
  unit: String,
  showTab: { type: Boolean, default: false },
  monthData: Object,
  accumulatedData: Object,
  subMetric: Object
})

const { state, getMonthsInRange, getMonthLabels } = useGlobalFilter()

// ---------- 模块内日期筛选器 ----------
const showModuleDatePicker = computed(() => props.title === '报单收入' || props.title === '线上营销收入')

const getDefaultModuleDates = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 29)
  const fmt = (d) => d.toISOString().split('T')[0]
  return { start: fmt(start), end: fmt(end) }
}

const defaultModuleDates = getDefaultModuleDates()
const moduleStartDate = ref(defaultModuleDates.start)
const moduleEndDate = ref(defaultModuleDates.end)

const moduleDaysInRange = computed(() => {
  const s = new Date(moduleStartDate.value)
  const e = new Date(moduleEndDate.value)
  const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, Math.min(366, Number.isNaN(diff) ? 30 : diff))
})

const moduleDateLabels = computed(() => {
  return Array.from({ length: moduleDaysInRange.value }, (_, index) => {
    const date = new Date(moduleStartDate.value)
    date.setDate(date.getDate() + index)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
})

// ---------- 全局筛选日期范围（兼容旧逻辑） ----------
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

// ---------- 图表模式 ----------
const chartMode = computed(() => {
  if (props.title === '报单收入') return 'actual-only'
  if (props.title === '线上营销收入') return 'area'
  if (props.title === '利润') return 'monthly'
  return 'default'
})

// ---------- 数据计算 ----------
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
  const days = showModuleDatePicker.value ? moduleDaysInRange.value : daysInRange.value
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

const generateDailyData = (days) => {
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
}

// 模块级每日数据（用于报单收入、线上营销收入）
const moduleDailyData = computed(() => generateDailyData(moduleDaysInRange.value))

// 全局筛选每日数据
const dailyData = computed(() => generateDailyData(daysInRange.value))

const dailyTargets = computed(() => {
  return targetCurve.value.map(item => Math.round(item))
})

// ---------- 月度数据（利润模块） ----------
const monthLabels = computed(() => getMonthLabels())

const monthlyActuals = computed(() => {
  const months = getMonthsInRange()
  const seed = titleSeed.value
  const monthlyBase = actual.value
  const results = []
  for (let i = 0; i < months; i++) {
    const wave = 1 + 0.08 * Math.sin((i + seed) / 2.5) + 0.04 * Math.cos((i + seed) / 1.8)
    results.push(Math.round(monthlyBase * wave))
  }
  return results
})

const monthlyTargets = computed(() => {
  const months = getMonthsInRange()
  const monthlyBase = target.value
  return Array.from({ length: months }, () => Math.round(monthlyBase))
})

// ---------- 辅助图表控制 ----------
const showRegionRank = computed(() => props.title === '报单收入')
const showChannelPie = computed(() => props.title === '线上营销收入')
const showExpenseBudget = computed(() => props.title === '利润')
const showAuxChart = computed(() => showRegionRank.value || showChannelPie.value || showExpenseBudget.value)

// 区域排名数据（降序）
const regionCompletionData = computed(() => {
  const baseRate = completionBase.value * 100
  const regionalTargets = [
    { name: '华北', target: target.value * 0.32, offset: -6 },
    { name: '华南', target: target.value * 0.34, offset: 2 },
    { name: '华东', target: target.value * 0.34, offset: 5 }
  ]
  const result = regionalTargets.map((region, index) => {
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
  // 按达成率降序排列
  return result.sort((a, b) => b.rate - a.rate)
})

// 渠道贡献数据
const channelContributionData = computed(() => {
  const totalVal = actual.value
  return [
    { name: 'CPS小程序', value: Math.round(totalVal * 0.38) },
    { name: '直播带货', value: Math.round(totalVal * 0.28) },
    { name: '推客系统', value: Math.round(totalVal * 0.22) },
    { name: '其他', value: Math.round(totalVal * 0.12) }
  ]
})

// 费用预算执行数据
const expenseBudgetData = computed(() => {
  return [
    { name: '市场推广费', target: 3200000, actual: 2860000 },
    { name: '会议费', target: 1500000, actual: 1620000 },
    { name: '差旅费', target: 1200000, actual: 1080000 },
    { name: '培训费', target: 800000, actual: 720000 },
    { name: '办公费', target: 600000, actual: 540000 }
  ]
})

// ---------- 格式化 ----------
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

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
}
</style>
