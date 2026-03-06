<template>
  <div class="gradient-border p-4">
    <h2 class="text-sm font-semibold text-dashboard-text mb-4 flex items-center gap-2">
      <span>💰</span>
      核心财务指标
      <span class="text-xs text-dashboard-muted font-normal ml-2 hidden sm:inline">置顶展示</span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <!-- 利润卡片（含达成率子指标） -->
      <KpiCard
        title="利润"
        unit="元"
        :monthData="financeCardsData.profit.currentMonth"
        :accumulatedData="financeCardsData.profit.accumulated"
        :subMetric="financeCardsData.profit.currentMonth.subMetrics"
      />

      <button
        class="min-h-[256px] rounded-lg border border-dashed border-primary-500/50 bg-primary-900/10 hover:bg-primary-900/20 transition-colors flex items-center justify-center"
      >
        <div class="text-center">
          <div class="text-3xl text-primary-300 leading-none">+</div>
          <div class="text-sm font-medium text-primary-300 mt-2">添加指标</div>
          <div class="text-xs text-dashboard-muted mt-1">支持自定义扩展</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import KpiCard from '../common/KpiCard.vue'
import { financeCardsData } from '../../composables/useMockData'
</script>
