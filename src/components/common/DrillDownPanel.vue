<template>
  <!-- 下钻面板 -->
  <teleport to="body">
    <transition name="slide-fade">
      <div v-if="visible" class="fixed inset-y-0 right-0 w-[480px] z-40 flex">
        <!-- 遮罩层 -->
        <div 
          class="absolute inset-0 -left-full bg-black/30 backdrop-blur-sm"
          @click="handleClose"
        ></div>
        
        <!-- 面板主体 -->
        <div class="relative w-full bg-dashboard-card border-l border-dashboard-border shadow-2xl flex flex-col overflow-hidden">
          <!-- 头部 -->
          <div class="flex items-center justify-between p-4 border-b border-dashboard-border bg-dashboard-dark/50">
            <div class="flex items-center gap-3">
              <button 
                v-if="breadcrumb.length > 1"
                @click="goBack"
                class="text-dashboard-muted hover:text-dashboard-text transition-colors"
              >
                ← 返回
              </button>
              <h3 class="text-lg font-semibold text-dashboard-text">{{ title }}</h3>
            </div>
            <button 
              @click="handleClose"
              class="w-8 h-8 rounded-lg bg-dashboard-dark/50 border border-dashboard-border text-dashboard-muted hover:text-dashboard-text transition-all flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          
          <!-- 面包屑导航 -->
          <div class="px-4 py-2 bg-dashboard-dark/30 border-b border-dashboard-border/50">
            <div class="flex items-center gap-2 text-xs">
              <template v-for="(item, index) in breadcrumb" :key="index">
                <button 
                  @click="navigateTo(index)"
                  class="hover:text-primary-400 transition-colors"
                  :class="index === breadcrumb.length - 1 ? 'text-primary-400' : 'text-dashboard-muted'"
                >
                  {{ item.label }}
                </button>
                <span v-if="index < breadcrumb.length - 1" class="text-dashboard-muted">/</span>
              </template>
            </div>
          </div>
          
          <!-- 内容区域 -->
          <div class="flex-1 overflow-auto p-4 space-y-4">
            <!-- 当前层级数据卡片 -->
            <div class="bg-dashboard-dark/50 rounded-xl p-4 border border-dashboard-border">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <div class="text-sm text-dashboard-muted">{{ currentLevel.label }}</div>
                  <div class="text-2xl font-bold text-dashboard-text metric-value">
                    {{ formatValue(currentLevel.value) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-dashboard-muted">目标达成率</div>
                  <div 
                    class="text-lg font-semibold"
                    :class="getAchievementClass(currentLevel.achievement)"
                  >
                    {{ currentLevel.achievement }}%
                  </div>
                </div>
              </div>
              
              <!-- 进度条 -->
              <div class="h-2 bg-dashboard-dark rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-500"
                  :class="getAchievementBgClass(currentLevel.achievement)"
                  :style="{ width: Math.min(currentLevel.achievement, 100) + '%' }"
                ></div>
              </div>
            </div>
            
            <!-- 贡献度排名 -->
            <div v-if="contributionData.length > 0">
              <h4 class="text-sm font-medium text-dashboard-text mb-3">📊 贡献度排名</h4>
              <div class="space-y-2">
                <div 
                  v-for="(item, index) in contributionData" 
                  :key="item.name"
                  @click="drillDown(item)"
                  class="bg-dashboard-dark/30 rounded-lg p-3 border border-dashboard-border/50 hover:border-primary-500/50 cursor-pointer transition-all group"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span 
                        class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                        :class="getRankClass(index)"
                      >
                        {{ index + 1 }}
                      </span>
                      <div>
                        <div class="text-sm font-medium text-dashboard-text">{{ item.name }}</div>
                        <div class="text-xs text-dashboard-muted">{{ item.fullName }}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <div class="text-right">
                        <div class="text-sm font-semibold" :class="getAchievementClass(item.achievement)">
                          {{ item.contribution }}%
                        </div>
                        <div class="text-xs text-dashboard-muted">贡献度</div>
                      </div>
                      <span class="text-dashboard-muted group-hover:text-primary-400 transition-colors">→</span>
                    </div>
                  </div>
                  
                  <!-- 迷你进度条 -->
                  <div class="mt-2 h-1 bg-dashboard-dark rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all"
                      :class="getAchievementBgClass(item.achievement)"
                      :style="{ width: Math.min(item.achievement, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 趋势图 -->
            <div v-if="showTrend">
              <h4 class="text-sm font-medium text-dashboard-text mb-3">📈 趋势对比</h4>
              <div ref="chartRef" class="w-full h-48"></div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="pt-4 border-t border-dashboard-border flex gap-3">
              <button 
                @click="createTask"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors text-sm"
              >
                ✉️ 创建改进任务
              </button>
              <button 
                @click="exportData"
                class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-dashboard-dark/50 border border-dashboard-border text-dashboard-muted hover:text-dashboard-text transition-colors text-sm"
              >
                📊 导出数据
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  visible: Boolean,
  indicatorData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'createTask'])

// 面包屑导航
const breadcrumb = ref([
  { label: '全国', value: 'all', level: 'root' }
])

// 当前层级
const currentLevel = ref({
  label: '全国',
  value: 47500000,
  target: 50000000,
  achievement: 95.0
})

// 贡献度数据
const contributionData = ref([])

// 是否显示趋势图
const showTrend = ref(true)

// 图表引用
const chartRef = ref(null)
let chartInstance = null

// 标题计算
const title = computed(() => {
  return props.indicatorData?.name || '指标分析'
})

// 格式化数值
const formatValue = (value) => {
  if (value >= 100000000) return (value / 100000000).toFixed(2) + '亿'
  if (value >= 10000) return (value / 10000).toFixed(2) + '万'
  return value.toLocaleString()
}

// 获取达成率样式
const getAchievementClass = (achievement) => {
  if (achievement >= 95) return 'text-status-green'
  if (achievement >= 85) return 'text-status-yellow'
  return 'text-status-red'
}

const getAchievementBgClass = (achievement) => {
  if (achievement >= 95) return 'bg-status-green'
  if (achievement >= 85) return 'bg-status-yellow'
  return 'bg-status-red'
}

// 获取排名样式
const getRankClass = (index) => {
  if (index === 0) return 'bg-yellow-500/20 text-yellow-500'
  if (index === 1) return 'bg-gray-400/20 text-gray-400'
  if (index === 2) return 'bg-amber-600/20 text-amber-600'
  return 'bg-dashboard-dark text-dashboard-muted'
}

// 初始化数据
const initData = () => {
  // 模拟区域贡献数据
  contributionData.value = [
    { name: 'east', fullName: '华东区', value: 16625000, target: 17500000, achievement: 95.0, contribution: 35.0 },
    { name: 'south', fullName: '华南区', value: 11875000, target: 12500000, achievement: 95.0, contribution: 25.0 },
    { name: 'north', fullName: '华北区', value: 9500000, target: 10000000, achievement: 95.0, contribution: 20.0 },
    { name: 'central', fullName: '华中区', value: 4750000, target: 5000000, achievement: 95.0, contribution: 10.0 },
    { name: 'southwest', fullName: '西南区', value: 4750000, target: 5000000, achievement: 95.0, contribution: 10.0 }
  ]
  
  updateChart()
}

// 下钻
const drillDown = (item) => {
  breadcrumb.value.push({ 
    label: item.fullName, 
    value: item.name,
    level: 'region'
  })
  
  currentLevel.value = {
    label: item.fullName,
    value: item.value,
    target: item.target,
    achievement: item.achievement
  }
  
  // 模拟下一层数据（体系）
  contributionData.value = [
    { name: 'diamond', fullName: '钻石体系', value: item.value * 0.6, target: item.target * 0.55, achievement: 98.2, contribution: 60 },
    { name: 'huaqi', fullName: '华旗体系', value: item.value * 0.35, target: item.target * 0.35, achievement: 95.0, contribution: 35 },
    { name: 'innovation', fullName: '创新业务', value: item.value * 0.05, target: item.target * 0.1, achievement: 47.5, contribution: 5 }
  ]
  
  showTrend.value = true
  updateChart()
}

// 返回上一级
const goBack = () => {
  if (breadcrumb.value.length > 1) {
    breadcrumb.value.pop()
    // 重新加载数据
    initData()
  }
}

// 导航到指定层级
const navigateTo = (index) => {
  if (index < breadcrumb.value.length - 1) {
    breadcrumb.value = breadcrumb.value.slice(0, index + 1)
    initData()
  }
}

// 更新图表
const updateChart = () => {
  if (!chartRef.value) return
  
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  const actual = contributionData.value.slice(0, 3).map(d => (d.value / 10000).toFixed(0))
  const target = contributionData.value.slice(0, 3).map(d => (d.target / 10000).toFixed(0))
  
  chartInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0' }
    },
    legend: {
      data: ['实际', '目标'],
      textStyle: { color: '#94a3b8' },
      top: 0
    },
    grid: {
      left: 40,
      right: 20,
      top: 30,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: contributionData.value.slice(0, 3).map(d => d.fullName),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.5)' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    series: [
      {
        name: '实际',
        type: 'bar',
        data: actual,
        itemStyle: { color: '#38bdf8', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '目标',
        type: 'line',
        data: target,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#eab308', width: 2 },
        itemStyle: { color: '#eab308' }
      }
    ]
  })
}

// 创建任务
const createTask = () => {
  emit('createTask', {
    indicator: title.value,
    currentValue: currentLevel.value.achievement + '%',
    target: '100%',
    gap: (currentLevel.value.achievement - 100).toFixed(1) + '%',
    level: breadcrumb.value
  })
  handleClose()
}

// 导出数据
const exportData = () => {
  alert('数据导出功能开发中...')
}

// 关闭面板
const handleClose = () => {
  emit('update:visible', false)
}

// 监听显示状态
watch(() => props.visible, (val) => {
  if (val) {
    breadcrumb.value = [{ label: '全国', value: 'all', level: 'root' }]
    initData()
  } else {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-from > div:last-child,
.slide-fade-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
