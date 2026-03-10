<template>
  <div class="gradient-border p-4">
    <h2 class="text-base font-semibold text-dashboard-text mb-4 flex items-center gap-2 tracking-wide">
      <span>📊</span>
      经营概览
    </h2>

    <!-- 桌面端：4列网格 -->
    <div class="hidden lg:grid grid-cols-4 gap-4">
      <div
        v-for="(dimension, key) in bscData"
        :key="key"
        class="bg-dashboard-dark/50 rounded-lg p-3 border border-dashboard-border hover:border-primary-500/30 transition-colors"
      >
        <!-- 维度标题 -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ dimensionIcons[key] }}</span>
            <span class="text-base font-semibold text-dashboard-text">{{ dimensionNames[key] }}</span>
          </div>
          <StatusLight
            :status="getDimensionStatus(dimension)"
            :pulse="getDimensionStatus(dimension) === 'red'"
          />
        </div>

        <!-- 表头：当月 / 累计 -->
        <div class="flex items-center gap-1 mb-2 text-[11px] text-dashboard-muted pl-[85px]">
          <span class="flex-1 text-center">当月</span>
          <span class="flex-1 text-center">累计</span>
        </div>

        <!-- 指标列表 -->
        <div class="space-y-2.5">
          <div
            v-for="indicator in dimension.indicators"
            :key="indicator.id"
            class="group relative"
          >
            <div class="flex items-center gap-1">
              <span class="text-sm font-medium text-dashboard-muted whitespace-nowrap w-[80px] flex-shrink-0 truncate" :title="indicator.name">
                {{ indicator.name }}
              </span>
              <!-- 当月数据 -->
              <div class="flex-1 flex items-center justify-center gap-1 bg-dashboard-dark/40 rounded px-1.5 py-0.5">
                <span class="font-semibold text-dashboard-text text-sm">
                  {{ formatValue(indicator) }}
                </span>
                <StatusLight
                  :status="getIndicatorStatus(indicator)"
                  size="small"
                />
              </div>
              <!-- 累计数据 -->
              <div class="flex-1 flex items-center justify-center gap-1 bg-dashboard-dark/40 rounded px-1.5 py-0.5">
                <span class="font-semibold text-dashboard-text text-sm">
                  {{ formatAccValue(indicator) }}
                </span>
                <StatusLight
                  :status="getAccIndicatorStatus(indicator)"
                  size="small"
                />
              </div>
              <!-- 异常指标：派发任务按钮 -->
              <button
                v-if="getIndicatorStatus(indicator) === 'red'"
                @click.stop="handleDispatch(indicator)"
                class="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-status-red/15 text-status-red hover:bg-status-red/25 transition-colors whitespace-nowrap"
                title="一键派发任务"
              >
                ✉️ 派发
              </button>
            </div>
            <!-- 悬浮提示 -->
            <div class="absolute left-0 -top-16 z-50 hidden group-hover:block bg-dashboard-dark border border-dashboard-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap text-xs">
              <div class="mb-1">
                <span class="text-dashboard-muted">当月：</span>
                <span class="text-primary-300 font-medium">{{ formatValue(indicator) }}</span>
                <span class="text-dashboard-muted"> / 目标 </span>
                <span class="text-primary-300">{{ formatTargetValue(indicator) }}</span>
                <span class="text-dashboard-muted ml-1">达成率：</span>
                <span class="font-medium" :class="getAchievementClass(indicator)">{{ formatAchievement(indicator) }}</span>
              </div>
              <div>
                <span class="text-dashboard-muted">累计：</span>
                <span class="text-primary-300 font-medium">{{ formatAccValue(indicator) }}</span>
                <span class="text-dashboard-muted"> / 目标 </span>
                <span class="text-primary-300">{{ formatAccTargetValue(indicator) }}</span>
                <span class="text-dashboard-muted ml-1">达成率：</span>
                <span class="font-medium" :class="getAccAchievementClass(indicator)">{{ formatAccAchievement(indicator) }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 移动端：横向滑动卡片 -->
    <div class="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
      <div class="flex gap-3 pb-2" style="width: max-content;">
        <div
          v-for="(dimension, key) in bscData"
          :key="key"
          class="bg-dashboard-dark/50 rounded-lg p-3 border border-dashboard-border min-w-[240px] w-[240px]"
        >
          <!-- 维度标题 -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ dimensionIcons[key] }}</span>
              <span class="text-sm font-semibold text-dashboard-text">{{ dimensionNames[key] }}</span>
            </div>
            <StatusLight
              :status="getDimensionStatus(dimension)"
              :pulse="getDimensionStatus(dimension) === 'red'"
            />
          </div>

          <!-- 表头 -->
          <div class="flex items-center gap-1 mb-2 text-[10px] text-dashboard-muted pl-[70px]">
            <span class="flex-1 text-center">当月</span>
            <span class="flex-1 text-center">累计</span>
          </div>

          <!-- 指标列表 -->
          <div class="space-y-2">
            <div
              v-for="indicator in dimension.indicators"
              :key="indicator.id"
              class="group relative"
            >
              <div class="flex items-center gap-1 text-xs">
                <span class="text-dashboard-muted truncate w-[65px] flex-shrink-0" :title="indicator.name">
                  {{ indicator.name }}
                </span>
                <div class="flex-1 flex items-center justify-center gap-0.5 bg-dashboard-dark/40 rounded px-1 py-0.5">
                  <span class="font-semibold text-dashboard-text text-xs">
                    {{ formatValue(indicator) }}
                  </span>
                  <StatusLight
                    :status="getIndicatorStatus(indicator)"
                    size="small"
                  />
                </div>
                <div class="flex-1 flex items-center justify-center gap-0.5 bg-dashboard-dark/40 rounded px-1 py-0.5">
                  <span class="font-semibold text-dashboard-text text-xs">
                    {{ formatAccValue(indicator) }}
                  </span>
                  <StatusLight
                    :status="getAccIndicatorStatus(indicator)"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatusLight from '../common/StatusLight.vue'
import { bscIndicators } from '../../composables/useMockData'

const emit = defineEmits(['dispatch-task'])

const bscData = bscIndicators

const dimensionNames = {
  finance: '财务维度',
  customer: '客户维度',
  operation: '内部运营',
  learning: '学习成长'
}

const dimensionIcons = {
  finance: '💰',
  customer: '👥',
  operation: '⚙️',
  learning: '📚'
}

// --- 当月格式化 ---
const formatValue = (indicator) => {
  if (indicator.unit === '%') return `${indicator.actual}%`
  if (indicator.unit === '天') return `${indicator.actual}天`
  if (indicator.actual >= 100000000) return (indicator.actual / 100000000).toFixed(1) + '亿'
  if (indicator.actual >= 10000) return (indicator.actual / 10000).toFixed(1) + '万'
  return indicator.actual.toLocaleString()
}

const formatTargetValue = (indicator) => {
  if (indicator.unit === '%') return `${indicator.target}%`
  if (indicator.unit === '天') return `${indicator.target}天`
  if (indicator.target >= 100000000) return (indicator.target / 100000000).toFixed(2) + '亿'
  if (indicator.target >= 10000) return (indicator.target / 10000).toFixed(1) + '万'
  return indicator.target.toLocaleString()
}

const formatAchievement = (indicator) => {
  const rate = (indicator.actual / indicator.target * 100).toFixed(1)
  return `${rate}%`
}

// --- 累计格式化 ---
const formatAccValue = (indicator) => {
  const val = indicator.accActual ?? indicator.actual
  if (indicator.unit === '%') return `${val}%`
  if (indicator.unit === '天') return `${val}天`
  if (val >= 100000000) return (val / 100000000).toFixed(1) + '亿'
  if (val >= 10000) return (val / 10000).toFixed(1) + '万'
  return val.toLocaleString()
}

const formatAccTargetValue = (indicator) => {
  const val = indicator.accTarget ?? indicator.target
  if (indicator.unit === '%') return `${val}%`
  if (indicator.unit === '天') return `${val}天`
  if (val >= 100000000) return (val / 100000000).toFixed(2) + '亿'
  if (val >= 10000) return (val / 10000).toFixed(1) + '万'
  return val.toLocaleString()
}

const formatAccAchievement = (indicator) => {
  const accActual = indicator.accActual ?? indicator.actual
  const accTarget = indicator.accTarget ?? indicator.target
  const rate = (accActual / accTarget * 100).toFixed(1)
  return `${rate}%`
}

// --- 状态判断 ---
const getAchievementClass = (indicator) => {
  const rate = indicator.actual / indicator.target
  const inverse = indicator.inverse
  if (inverse) {
    if (rate <= 1) return 'text-status-green'
    if (rate <= 1.15) return 'text-status-yellow'
    return 'text-status-red'
  }
  if (rate >= 0.95) return 'text-status-green'
  if (rate >= 0.85) return 'text-status-yellow'
  return 'text-status-red'
}

const getAccAchievementClass = (indicator) => {
  const accActual = indicator.accActual ?? indicator.actual
  const accTarget = indicator.accTarget ?? indicator.target
  const rate = accActual / accTarget
  const inverse = indicator.inverse
  if (inverse) {
    if (rate <= 1) return 'text-status-green'
    if (rate <= 1.15) return 'text-status-yellow'
    return 'text-status-red'
  }
  if (rate >= 0.95) return 'text-status-green'
  if (rate >= 0.85) return 'text-status-yellow'
  return 'text-status-red'
}

const getIndicatorStatus = (indicator) => {
  const rate = indicator.actual / indicator.target
  const inverse = indicator.inverse
  if (inverse) {
    if (rate <= 1) return 'green'
    if (rate <= 1.15) return 'yellow'
    return 'red'
  }
  if (rate >= 0.95) return 'green'
  if (rate >= 0.85) return 'yellow'
  return 'red'
}

const getAccIndicatorStatus = (indicator) => {
  const accActual = indicator.accActual ?? indicator.actual
  const accTarget = indicator.accTarget ?? indicator.target
  const rate = accActual / accTarget
  const inverse = indicator.inverse
  if (inverse) {
    if (rate <= 1) return 'green'
    if (rate <= 1.15) return 'yellow'
    return 'red'
  }
  if (rate >= 0.95) return 'green'
  if (rate >= 0.85) return 'yellow'
  return 'red'
}

const getDimensionStatus = (dimension) => {
  const statuses = dimension.indicators.map(getIndicatorStatus)
  if (statuses.includes('red')) return 'red'
  if (statuses.includes('yellow')) return 'yellow'
  return 'green'
}

const handleDispatch = (indicator) => {
  const rate = (indicator.actual / indicator.target * 100).toFixed(1)
  emit('dispatch-task', {
    indicator: indicator.name,
    currentValue: formatValue(indicator),
    target: formatTargetValue(indicator),
    gap: `${(rate - 100).toFixed(1)}%`,
    department: '直销事业部',
    owner: '',
    chartSnapshot: `${indicator.name} 当月达成率 ${rate}%`
  })
}

</script>
