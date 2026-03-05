<template>
  <div class="gradient-border p-4">
    <h2 class="text-sm font-semibold text-dashboard-text mb-4 flex items-center gap-2">
      <span>💰</span>
      核心财务指标
      <span class="text-xs text-dashboard-muted font-normal ml-2 hidden sm:inline">置顶展示</span>
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- 报单收入卡片 -->
      <KpiCard
        title="报单收入"
        unit="元"
        :monthData="financeCardsData.baodan.currentMonth"
        :accumulatedData="financeCardsData.baodan.accumulated"
      />

      <!-- 线上营销收入卡片 -->
      <KpiCard
        title="线上营销收入"
        unit="元"
        :monthData="financeCardsData.onlineMarketing.currentMonth"
        :accumulatedData="financeCardsData.onlineMarketing.accumulated"
      />

      <!-- 利润达成率卡片（含子指标） -->
      <KpiCard
        title="利润达成率"
        unit="%"
        :monthData="financeCardsData.profit.currentMonth"
        :accumulatedData="financeCardsData.profit.accumulated"
        :subMetric="financeCardsData.profit.currentMonth.subMetrics"
      />
    </div>
  </div>
</template>

<script setup>
import KpiCard from '../common/KpiCard.vue'
import { financeCardsData } from '../../composables/useMockData'
</script>
