<template>
  <div class="gradient-border p-4">
    <h2 class="text-sm font-semibold text-dashboard-text mb-4 flex items-center gap-2">
      <span>📊</span>
      BSC 平衡计分卡综览
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
            <span class="text-sm font-medium text-dashboard-text">{{ dimensionNames[key] }}</span>
          </div>
          <StatusLight
            :status="getDimensionStatus(dimension)"
            :pulse="getDimensionStatus(dimension) === 'red'"
          />
        </div>

        <!-- 指标列表 -->
        <div class="space-y-2">
          <div
            v-for="indicator in dimension.indicators"
            :key="indicator.id"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-dashboard-muted truncate mr-2" style="max-width: 120px;">
              {{ indicator.name }}
            </span>
            <div class="flex items-center gap-2">
              <span class="font-medium text-dashboard-text">
                {{ formatValue(indicator) }}
              </span>
              <StatusLight
                :status="getIndicatorStatus(indicator)"
                :title="`${indicator.actual}/${indicator.target}`"
              />
            </div>
          </div>
        </div>

        <!-- 维度权重 -->
        <div class="mt-3 pt-2 border-t border-dashboard-border">
          <div class="flex items-center justify-between text-xs">
            <span class="text-dashboard-muted">权重合计</span>
            <span class="text-primary-400 font-medium">
              {{ getTotalWeight(dimension) }}%
            </span>
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
          class="bg-dashboard-dark/50 rounded-lg p-3 border border-dashboard-border min-w-[200px] w-[200px]"
        >
          <!-- 维度标题 -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ dimensionIcons[key] }}</span>
              <span class="text-sm font-medium text-dashboard-text">{{ dimensionNames[key] }}</span>
            </div>
            <StatusLight
              :status="getDimensionStatus(dimension)"
              :pulse="getDimensionStatus(dimension) === 'red'"
            />
          </div>

          <!-- 指标列表 -->
          <div class="space-y-2">
            <div
              v-for="indicator in dimension.indicators"
              :key="indicator.id"
              class="flex items-center justify-between text-xs"
            >
              <span class="text-dashboard-muted truncate mr-1" style="max-width: 90px;">
                {{ indicator.name }}
              </span>
              <div class="flex items-center gap-1">
                <span class="font-medium text-dashboard-text text-xs">
                  {{ formatValue(indicator) }}
                </span>
                <StatusLight
                  :status="getIndicatorStatus(indicator)"
                  size="small"
                />
              </div>
            </div>
          </div>

          <!-- 维度权重 -->
          <div class="mt-3 pt-2 border-t border-dashboard-border">
            <div class="flex items-center justify-between text-xs">
              <span class="text-dashboard-muted">权重</span>
              <span class="text-primary-400 font-medium">
                {{ getTotalWeight(dimension) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StatusLight from '../common/StatusLight.vue'
import { bscIndicators } from '../../composables/useMockData'

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

const formatValue = (indicator) => {
  if (indicator.unit === '%') {
    return `${indicator.actual}%`
  }
  if (indicator.actual >= 10000) {
    return (indicator.actual / 10000).toFixed(1) + '万'
  }
  return indicator.actual.toLocaleString()
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

const getDimensionStatus = (dimension) => {
  const statuses = dimension.indicators.map(getIndicatorStatus)
  if (statuses.includes('red')) return 'red'
  if (statuses.includes('yellow')) return 'yellow'
  return 'green'
}

const getTotalWeight = (dimension) => {
  return dimension.indicators.reduce((sum, i) => sum + i.weight, 0)
}
</script>
