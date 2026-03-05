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
      <div class="text-xs text-dashboard-muted mt-1">
        目标: {{ formattedTarget }} {{ unit }}
      </div>
    </div>
    
    <!-- 变化指标 -->
    <div class="flex items-center gap-4 mb-3">
      <div class="flex items-center gap-1">
        <span class="text-xs text-dashboard-muted">环比</span>
        <span :class="changeClass(mom)">{{ formatChange(mom) }}</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-xs text-dashboard-muted">同比</span>
        <span :class="changeClass(yoy)">{{ formatChange(yoy) }}</span>
      </div>
    </div>
    
    <!-- 迷你趋势图 -->
    <MiniTrendChart :data="trendData" :isPositive="mom >= 0" />
    
    <!-- 子指标 -->
    <div v-if="subMetric" class="mt-3 pt-3 border-t border-dashboard-border">
      <div class="flex items-center justify-between">
        <span class="text-xs text-dashboard-muted">{{ subMetric.name }}</span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium" :class="getSubMetricClass()">
            {{ subMetric.actual }}{{ subMetric.unit || '%' }}
          </span>
          <span class="text-xs text-dashboard-muted">
            / 目标 {{ subMetric.target }}{{ subMetric.unit || '%' }}
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
import MiniTrendChart from './MiniTrendChart.vue'

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
const trendData = computed(() => currentData.value?.trend || [])

const status = computed(() => {
  const rate = actual.value / target.value
  if (rate >= 0.95) return 'green'
  if (rate >= 0.85) return 'yellow'
  return 'red'
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
  return value >= 0 ? 'text-status-green text-xs font-medium' : 'text-status-red text-xs font-medium'
}

const getSubMetricClass = () => {
  if (!props.subMetric) return ''
  const rate = props.subMetric.actual / props.subMetric.target
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
