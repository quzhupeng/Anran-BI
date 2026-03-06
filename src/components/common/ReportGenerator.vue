<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-dashboard-card border border-dashboard-border rounded-2xl shadow-2xl w-[900px] max-h-[90vh] overflow-auto" @click.stop>
          <!-- 头部 -->
          <div class="flex items-center justify-between p-6 border-b border-dashboard-border">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📊</span>
              <div>
                <h3 class="text-xl font-bold text-dashboard-text">经营分析报告</h3>
                <p class="text-xs text-dashboard-muted mt-1">{{ reportConfig.timeRange }} | {{ reportConfig.businessScope }}</p>
              </div>
            </div>
            <button @click="handleClose" class="text-dashboard-muted hover:text-dashboard-text text-2xl transition-colors">✕</button>
          </div>
          
          <!-- 报告配置 -->
          <div class="p-4 border-b border-dashboard-border bg-dashboard-dark/30">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-dashboard-muted">时间范围:</span>
                <select v-model="reportConfig.timeRange" class="bg-dashboard-dark border border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-dashboard-text">
                  <option value="本月">本月</option>
                  <option value="本季度">本季度</option>
                  <option value="全年累计">全年累计</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-dashboard-muted">报告类型:</span>
                <select v-model="reportConfig.reportType" class="bg-dashboard-dark border border-dashboard-border rounded-lg px-3 py-1.5 text-sm text-dashboard-text">
                  <option value="summary">执行摘要</option>
                  <option value="detailed">详细分析</option>
                  <option value="board">董事会汇报</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- 报告预览 -->
          <div class="p-6 space-y-6 overflow-auto">
            <!-- 执行摘要 -->
            <section class="bg-dashboard-dark/50 rounded-xl p-4 border border-dashboard-border">
              <h4 class="text-sm font-semibold text-dashboard-text flex items-center gap-2">
                <span>📋</span> 执行摘要
              </h4>
              <div class="space-y-3 text-sm text-dashboard-text leading-relaxed mt-3">
                <p v-html="reportSummary"></p>
              </div>
            </section>
            
            <!-- BSC综览 -->
            <section class="bg-dashboard-dark/50 rounded-xl p-4 border border-dashboard-border">
              <h4 class="text-sm font-semibold text-dashboard-text flex items-center gap-2 mb-4">
                <span>🎯</span> BSC 四维度综览
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="dimension in bscDimensions" :key="dimension.name" class="p-3 rounded-lg border border-dashboard-border/50">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-dashboard-text">{{ dimension.name }}</span>
                    <span :class="getDimensionStatusClass(dimension.status)">
                      {{ dimension.achievement }}%
                    </span>
                  </div>
                  <div class="space-y-1 text-xs text-dashboard-muted">
                    <div v-for="indicator in dimension.indicators.slice(0, 2)" :key="indicator.name">
                      <span>{{ indicator.name }}: {{ indicator.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- 预警事项 -->
            <section class="bg-dashboard-dark/50 rounded-xl p-4 border border-dashboard-border">
              <h4 class="text-sm font-semibold text-dashboard-text flex items-center gap-2 mb-4">
                <span>⚠️</span> 重点预警事项
              </h4>
              <div class="space-y-2">
                <div v-for="alert in reportAlerts" :key="alert.id" class="flex items-start gap-3 p-3 rounded-lg bg-status-red/10 border border-status-red/30">
                  <span class="text-status-red text-lg">🚨</span>
                  <div class="flex-1">
                    <h5 class="text-sm font-medium text-dashboard-text">{{ alert.title }}</h5>
                    <p class="text-xs text-dashboard-muted">{{ alert.detail }}</p>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- 改进建议 -->
            <section class="bg-dashboard-dark/50 rounded-xl p-4 border border-dashboard-border">
              <h4 class="text-sm font-semibold text-dashboard-text flex items-center gap-2 mb-4">
                <span>💡</span> 下月改进建议
              </h4>
              <div class="space-y-2">
                <div v-for="suggestion in improvementSuggestions" :key="suggestion.id" class="flex items-start gap-2">
                  <span class="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold">{{ suggestion.priority }}</span>
                  <div class="flex-1">
                    <span class="text-sm text-dashboard-text">{{ suggestion.content }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          <!-- 底部操作 -->
          <div class="flex items-center justify-between p-4 border-t border-dashboard-border bg-dashboard-dark/50">
            <div class="flex items-center gap-3">
              <button @click="copyToClipboard" class="px-4 py-2 rounded-lg bg-dashboard-dark border border-dashboard-border text-sm text-dashboard-muted hover:text-dashboard-text transition-colors flex items-center gap-2">
                <span>📋</span> 复制内容
              </button>
              <button @click="exportPDF" class="px-4 py-2 rounded-lg bg-dashboard-dark border border-dashboard-border text-sm text-dashboard-muted hover:text-dashboard-text transition-colors flex items-center gap-2">
                <span>📄</span> 导出PDF
              </button>
              <button @click="exportPPT" class="px-4 py-2 rounded-lg bg-dashboard-dark border border-dashboard-border text-sm text-dashboard-muted hover:text-dashboard-text transition-colors flex items-center gap-2">
                <span>📊</span> 导出PPT
              </button>
            </div>
            <div class="flex items-center gap-3">
              <button @click="handleClose" class="px-6 py-2 rounded-lg text-sm text-dashboard-muted hover:text-dashboard-text transition-colors">
                取消
              </button>
              <button @click="generateReport" class="px-8 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-2">
                <span>✨</span>
                生成完整报告
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'generated'])

const reportConfig = reactive({
  timeRange: '本月',
  businessScope: '全部业务体系',
  reportType: 'summary'
})

// BSC维度数据
const bscDimensions = computed(() => {
  return [
    {
      name: '财务维度',
      status: 'yellow',
      achievement: 92.5,
      indicators: [
        { name: '报单收入', value: '4750万' },
        { name: '利润达成率', value: '92.5%' }
      ]
    },
    {
      name: '客户维度',
      status: 'red',
      achievement: 72.3,
      indicators: [
        { name: '新人经营率', value: '72.3%' },
        { name: '合高合格人次', value: '4.8万' }
      ]
    },
    {
      name: '内部运营',
      status: 'yellow',
      achievement: 91.2,
      indicators: [
        { name: '库存周转天数', value: '52天' },
        { name: '流程遵从率', value: '91.2%' }
      ]
    },
    {
      name: '学习成长',
      status: 'yellow',
      achievement: 68.0,
      indicators: [
        { name: '潜质员工占比', value: '12.8%' },
        { name: '人才储备率', value: '68%' }
      ]
    }
  ]
})

// 报告摘要
const reportSummary = computed(() => {
  const totalAchievement = bscDimensions.value.reduce((sum, d) => sum + parseFloat(d.achievement), 0) / bscDimensions.value.length
  const redCount = bscDimensions.value.filter(d => d.status === 'red').length
  const yellowCount = bscDimensions.value.filter(d => d.status === 'yellow').length
  
  return `
    <strong>【${ reportConfig.timeRange }}经营概况】</strong> 综合达成率<strong>${ totalAchievement.toFixed(1) }%</strong>。
    财务维度达成率95%（目标95%）；利润达成率92.5%仍低于目标4个百分点。
    <br/><br/>
    <strong class="text-status-red">客户维度达成率72.3%（目标85%），新人经营率未达标</strong>，连续2个月未达标，需重点关注新人帮扶计划。
    <br/><br/>
    内部运营达成率91.2%（目标95%），库存周转52天超出目标7天，需优化库存管理。
    <br/><br/>
    学习成长达成率68.0%（目标80%），人才储备率68%告急，需加速人才培养。
    <br/><br/>
    <strong>⚠️ 预警指标：${ redCount }项红灯、${ yellowCount }项黄灯</strong>
  `
})

// 预警事项
const reportAlerts = computed(() => {
  return [
    { id: 1, title: '新人经营率连续2月未达标', detail: '当前72.3%，目标85%，差距12.7个百分点' },
    { id: 2, title: '产成品库存周转天数超标', detail: '当前52天，目标≤45天，超出7天' },
    { id: 3, title: '关键岗位人才储备率告急', detail: '当前68%，目标80%，需加速人才培养' }
  ]
})

// 改进建议
const improvementSuggestions = computed(() => {
  return [
    { id: 1, priority: '1', content: '建立新人专项帮扶计划，每周进行业务指导' },
    { id: 2, priority: '2', content: '优化销售预测模型，启动库存清理专项行动' },
    { id: 3, priority: '3', content: '重新规划人才盘点与培养计划，明确晋升路径' },
    { id: 4, priority: '4', content: '加强流程培训宣导，建立定期检查考核机制' }
  ]
})

const getDimensionStatusClass = (status) => {
  const classes = {
    green: 'text-status-green bg-status-green/20 px-2 py-0.5 rounded-full',
    yellow: 'text-status-yellow bg-status-yellow/20 px-2 py-0.5 rounded-full',
    red: 'text-status-red bg-status-red/20 px-2 py-0.5 rounded-full'
  }
  return classes[status] || ''
}

const handleClose = () => {
  emit('update:visible', false)
}

const copyToClipboard = () => {
  alert('报告内容已复制到剪贴板')
}

const exportPDF = () => {
  alert('PDF导出功能开发中...\n将支持导出为可编辑的PDF文档')
}

const exportPPT = () => {
  alert('PPT导出功能开发中...\n将支持导出为可编辑的PPT文档')
}

const generateReport = () => {
  alert('✅ 完整报告生成中...\n\n报告将包含：\n• 执行摘要\n• BSC四维度详细分析\n• 预警事项汇总\n• 改进建议\n• 行动跟踪表')
  emit('generated', { timeRange: reportConfig.timeRange, type: reportConfig.reportType })
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
