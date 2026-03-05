<template>
  <div class="gradient-border p-4">
    <h2 class="text-sm font-semibold text-dashboard-text mb-4 flex items-center gap-2">
      <span>🚦</span>
      红绿灯预警墙
      <span class="text-xs text-dashboard-muted font-normal ml-2 hidden sm:inline">BSC 11项核心指标状态</span>
    </h2>

    <!-- 桌面端：11列网格 -->
    <div class="hidden lg:grid grid-cols-11 gap-2">
      <div
        v-for="indicator in allIndicators"
        :key="indicator.id"
        class="relative group"
      >
        <!-- 指标卡片 -->
        <div
          class="p-3 rounded-lg border-2 transition-all cursor-pointer"
          :class="[
            indicator.status === 'red'
              ? 'bg-status-red/10 border-status-red hover:bg-status-red/20'
              : indicator.status === 'yellow'
                ? 'bg-status-yellow/10 border-status-yellow hover:bg-status-yellow/20'
                : 'bg-status-green/10 border-status-green hover:bg-status-green/20'
          ]"
        >
          <!-- 状态灯 -->
          <div class="flex justify-center mb-2">
            <span
              class="w-4 h-4 rounded-full"
              :class="[
                indicator.status === 'red' ? 'bg-status-red status-pulse' :
                indicator.status === 'yellow' ? 'bg-status-yellow' : 'bg-status-green'
              ]"
            ></span>
          </div>

          <!-- 指标名称 -->
          <div class="text-xs text-center text-dashboard-text font-medium truncate">
            {{ indicator.name }}
          </div>

          <!-- 达成率 -->
          <div
            class="text-xs text-center mt-1 font-bold"
            :class="[
              indicator.status === 'red' ? 'text-status-red' :
              indicator.status === 'yellow' ? 'text-status-yellow' : 'text-status-green'
            ]"
          >
            {{ indicator.achievement }}%
          </div>
        </div>

        <!-- 悬浮详情 -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div class="bg-dashboard-card border border-dashboard-border rounded-lg p-3 shadow-lg min-w-48">
            <div class="text-xs text-dashboard-text font-medium mb-2">{{ indicator.name }}</div>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-dashboard-muted">实际值:</span>
                <span class="text-dashboard-text">{{ formatValue(indicator) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-dashboard-muted">目标值:</span>
                <span class="text-dashboard-text">{{ formatTarget(indicator) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-dashboard-muted">达成率:</span>
                <span :class="[
                  indicator.status === 'red' ? 'text-status-red' :
                  indicator.status === 'yellow' ? 'text-status-yellow' : 'text-status-green'
                ]">{{ indicator.achievement }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-dashboard-muted">权重:</span>
                <span class="text-primary-400">{{ indicator.weight }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端：横向滚动 -->
    <div class="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
      <div class="flex gap-2 pb-2" style="width: max-content;">
        <div
          v-for="indicator in allIndicators"
          :key="indicator.id"
          class="min-w-[80px] w-[80px]"
          @click="selectedIndicator = indicator"
        >
          <!-- 指标卡片 -->
          <div
            class="p-2 rounded-lg border-2 transition-all cursor-pointer"
            :class="[
              indicator.status === 'red'
                ? 'bg-status-red/10 border-status-red'
                : indicator.status === 'yellow'
                  ? 'bg-status-yellow/10 border-status-yellow'
                  : 'bg-status-green/10 border-status-green'
            ]"
          >
            <!-- 状态灯 -->
            <div class="flex justify-center mb-1">
              <span
                class="w-3 h-3 rounded-full"
                :class="[
                  indicator.status === 'red' ? 'bg-status-red status-pulse' :
                  indicator.status === 'yellow' ? 'bg-status-yellow' : 'bg-status-green'
                ]"
              ></span>
            </div>

            <!-- 指标名称 -->
            <div class="text-xs text-center text-dashboard-text font-medium truncate">
              {{ indicator.name }}
            </div>

            <!-- 达成率 -->
            <div
              class="text-xs text-center mt-1 font-bold"
              :class="[
                indicator.status === 'red' ? 'text-status-red' :
                indicator.status === 'yellow' ? 'text-status-yellow' : 'text-status-green'
              ]"
            >
              {{ indicator.achievement }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="mt-4 pt-4 border-t border-dashboard-border flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-status-red"></span>
        <span class="text-xs text-dashboard-muted">红灯 <strong class="text-status-red">{{ redCount }}</strong> 项</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-status-yellow"></span>
        <span class="text-xs text-dashboard-muted">黄灯 <strong class="text-status-yellow">{{ yellowCount }}</strong> 项</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-status-green"></span>
        <span class="text-xs text-dashboard-muted">绿灯 <strong class="text-status-green">{{ greenCount }}</strong> 项</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { bscIndicators } from '../../composables/useMockData'

const selectedIndicator = ref(null)

const allIndicators = computed(() => {
  const result = []
  Object.entries(bscIndicators).forEach(([dimension, data]) => {
    data.indicators.forEach(ind => {
      const achievement = ind.inverse 
        ? (ind.target / ind.actual * 100).toFixed(1)
        : (ind.actual / ind.target * 100).toFixed(1)
      
      let status = 'green'
      const rate = ind.actual / ind.target
      if (ind.inverse) {
        if (rate > 1.15) status = 'red'
        else if (rate > 1) status = 'yellow'
      } else {
        if (rate < 0.85) status = 'red'
        else if (rate < 0.95) status = 'yellow'
      }
      
      result.push({
        ...ind,
        dimension: data.name,
        achievement,
        status
      })
    })
  })
  return result
})

const redCount = computed(() => allIndicators.value.filter(i => i.status === 'red').length)
const yellowCount = computed(() => allIndicators.value.filter(i => i.status === 'yellow').length)
const greenCount = computed(() => allIndicators.value.filter(i => i.status === 'green').length)

const formatValue = (indicator) => {
  if (indicator.unit === '%') return `${indicator.actual}%`
  if (indicator.actual >= 10000) return (indicator.actual / 10000).toFixed(1) + '万'
  return indicator.actual.toLocaleString()
}

const formatTarget = (indicator) => {
  if (indicator.unit === '%') return `${indicator.target}%`
  if (indicator.target >= 10000) return (indicator.target / 10000).toFixed(1) + '万'
  return indicator.target.toLocaleString()
}
</script>
