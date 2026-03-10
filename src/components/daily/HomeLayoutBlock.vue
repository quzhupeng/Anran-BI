<template>
  <BSCOverview
    v-if="componentId === 'metric-overview'"
    @dispatch-task="$emit('dispatch-task', $event)"
  />

  <CoreFinanceCards
    v-else-if="componentId === 'metric-finance'"
    @drillDown="$emit('drill-down', $event)"
  />

  <CoreCustomerMetrics v-else-if="componentId === 'metric-customer'" />

  <AlertCenter
    v-else-if="componentId === 'chart-alert'"
    @open-report="$emit('open-report')"
    @open-alert-config="$emit('open-alert-config')"
    @dispatch-alert="$emit('dispatch-alert', $event)"
  />

  <ProcessRadar v-else-if="componentId === 'chart-radar'" />

  <KpiCard
    v-else-if="componentId === 'metric-kpi'"
    title="报单收入"
    unit="元"
    :monthData="financeCardsData.baodan.currentMonth"
    :accumulatedData="financeCardsData.baodan.accumulated"
    @drillDown="$emit('drill-down', $event)"
  />

  <div v-else-if="componentId === 'metric-region'" class="gradient-border p-4 h-full flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-dashboard-text flex items-center gap-2">
        <span>🏆</span>
        区域达成排名
      </h2>
      <span class="text-xs text-dashboard-muted">本月达成率</span>
    </div>
    <div class="flex-1 min-h-[220px]">
      <RegionCompletionRank :data="regionCompletionData" />
    </div>
  </div>

  <div v-else-if="componentId === 'chart-combo'" class="gradient-border p-4 h-full flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-dashboard-text flex items-center gap-2">
        <span>📊</span>
        收入趋势对比
      </h2>
      <span class="text-xs text-dashboard-muted">实际 / 计划 / 达成率</span>
    </div>
    <div class="flex-1 min-h-[260px]">
      <ComboBarChart
        :data="monthlyTrendData.baodan.actual"
        :targets="monthlyTrendData.baodan.target"
        :labels="monthlyTrendData.months"
        :height="260"
      />
    </div>
  </div>

  <div v-else-if="componentId === 'chart-funnel'" class="gradient-border p-4 h-full flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-dashboard-text flex items-center gap-2">
        <span>🔻</span>
        营销漏斗
      </h2>
      <span class="text-xs text-dashboard-muted">流量到成交转化</span>
    </div>
    <div class="flex-1 min-h-[260px]">
      <MarketingFunnelChart :data="marketingFunnelData" />
    </div>
  </div>

  <div v-else-if="componentId === 'chart-trend'" class="gradient-border p-4 h-full flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-dashboard-text flex items-center gap-2">
        <span>📉</span>
        迷你趋势
      </h2>
      <span class="text-xs text-dashboard-muted">关键指标快照</span>
    </div>

    <div class="space-y-3 mt-auto">
      <div
        v-for="trend in miniTrends"
        :key="trend.label"
        class="rounded-lg border border-dashboard-border bg-dashboard-dark/35 p-3"
      >
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="text-dashboard-text">{{ trend.label }}</span>
          <span :class="trend.isPositive ? 'text-status-green' : 'text-status-red'">
            {{ trend.value }}
          </span>
        </div>
        <MiniTrendChart :data="trend.data" :isPositive="trend.isPositive" />
      </div>
    </div>
  </div>

  <div v-else class="h-full rounded-xl border border-dashed border-dashboard-border bg-dashboard-dark/30 p-4 flex flex-col justify-between">
    <div>
      <div class="text-sm font-semibold text-dashboard-text">{{ item.componentName || '布局容器' }}</div>
      <div class="text-xs text-dashboard-muted mt-1">当前为预留布局容器，可在“自定义首页”中继续替换为业务模块。</div>
    </div>
    <div class="text-[11px] text-primary-300">{{ item.width }} × {{ item.height }} 网格</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BSCOverview from './BSCOverview.vue'
import CoreFinanceCards from './CoreFinanceCards.vue'
import CoreCustomerMetrics from './CoreCustomerMetrics.vue'
import AlertCenter from './AlertCenter.vue'
import ProcessRadar from './ProcessRadar.vue'
import KpiCard from '../common/KpiCard.vue'
import RegionCompletionRank from '../common/RegionCompletionRank.vue'
import ComboBarChart from '../common/ComboBarChart.vue'
import MarketingFunnelChart from '../common/MarketingFunnelChart.vue'
import MiniTrendChart from '../common/MiniTrendChart.vue'
import { financeCardsData, monthlyTrendData } from '../../composables/useMockData'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['open-report', 'open-alert-config', 'drill-down', 'dispatch-task', 'dispatch-alert'])

const componentId = computed(() => props.item?.componentId)

const regionCompletionData = computed(() => {
  const target = financeCardsData.baodan.currentMonth.target
  const actual = financeCardsData.baodan.currentMonth.actual
  const baseRate = (actual / (target || 1)) * 100
  const regions = [
    { name: '华东', target: Math.round(target * 0.34), offset: 4.6 },
    { name: '华南', target: Math.round(target * 0.31), offset: -2.1 },
    { name: '华北', target: Math.round(target * 0.35), offset: 1.3 }
  ]

  return regions.map((region) => {
    const rate = Math.max(72, Math.min(128, baseRate + region.offset))
    return {
      name: region.name,
      target: region.target,
      actual: Math.round(region.target * rate / 100),
      rate
    }
  })
})

const marketingFunnelData = computed(() => {
  const deals = Math.max(520, Math.round(financeCardsData.onlineMarketing.currentMonth.actual / 18000))
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

const miniTrends = computed(() => [
  {
    label: '报单收入',
    value: '+8.5%',
    data: financeCardsData.baodan.currentMonth.trend,
    isPositive: true
  },
  {
    label: '线上营销收入',
    value: '+12.3%',
    data: financeCardsData.onlineMarketing.currentMonth.trend,
    isPositive: true
  },
  {
    label: '利润',
    value: '-1.8%',
    data: financeCardsData.profit.currentMonth.trend,
    isPositive: false
  }
])
</script>

