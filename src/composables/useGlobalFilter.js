// 全局筛选状态管理
import { reactive, readonly, computed } from 'vue'

const computeEndDate = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return `${monthStr}-${String(lastDay).padStart(2, '0')}`
}

const getDefaultMonthRange = () => {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return {
    startMonth: currentMonth,
    endMonth: currentMonth
  }
}

const defaultRange = getDefaultMonthRange()

// 全局筛选状态
const state = reactive({
  // 时间周期（按月）
  timeRange: 'custom',
  startMonth: defaultRange.startMonth,
  endMonth: defaultRange.endMonth,
  // 兼容旧字段 - 自动从月份计算
  startDate: defaultRange.startMonth + '-01',
  endDate: computeEndDate(defaultRange.endMonth),
  // 业务体系
  businessSystem: 'all',
  // 业务部（大区）
  region: 'all',
  // 数据刷新时间戳
  lastRefresh: Date.now()
})

// 同步月份到日期
const syncDatesFromMonths = () => {
  state.startDate = state.startMonth + '-01'
  state.endDate = computeEndDate(state.endMonth)
}

// 时间周期选项
export const timeRangeOptions = [
  { value: 'today', label: '本日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季' },
  { value: 'ytd', label: '累计' }
]

// 业务体系选项
export const businessSystemOptions = [
  { value: 'all', label: '全部体系' },
  { value: 'diamond', label: '钻石体系' },
  { value: 'huaqi', label: '华旗体系' },
  { value: 'qili', label: '齐力体系' },
  { value: 'zhonghe', label: '众合体系' }
]

// 业务部选项
export const regionOptions = [
  { value: 'all', label: '全部' },
  { value: 'east', label: '华东' },
  { value: 'south', label: '华南' },
  { value: 'north', label: '华北' }
]

// 获取筛选月份范围内的月数
export const getMonthsInRange = () => {
  const [startYear, startMonth] = state.startMonth.split('-').map(Number)
  const [endYear, endMonth] = state.endMonth.split('-').map(Number)
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1
}

// 获取筛选范围内的月份标签列表
export const getMonthLabels = () => {
  const [startYear, startMonth] = state.startMonth.split('-').map(Number)
  const count = getMonthsInRange()
  const labels = []
  for (let i = 0; i < count; i++) {
    const m = ((startMonth - 1 + i) % 12) + 1
    labels.push(`${m}月`)
  }
  return labels
}

// 修改筛选条件
export const setFilter = (key, value) => {
  if (typeof key === 'object' && key !== null) {
    Object.keys(key).forEach((field) => {
      if (field in state) {
        state[field] = key[field]
      }
    })
    // 同步日期
    if ('startMonth' in key || 'endMonth' in key) {
      syncDatesFromMonths()
    }
    state.lastRefresh = Date.now()
    return
  }

  if (key in state) {
    state[key] = value
    // 同步日期
    if (key === 'startMonth' || key === 'endMonth') {
      syncDatesFromMonths()
    }
    state.lastRefresh = Date.now()
  }
}

// 刷新所有数据
export const refreshAll = () => {
  state.lastRefresh = Date.now()
}

// 重置筛选条件
export const resetFilters = () => {
  const range = getDefaultMonthRange()
  state.timeRange = 'custom'
  state.startMonth = range.startMonth
  state.endMonth = range.endMonth
  state.businessSystem = 'all'
  state.region = 'all'
  syncDatesFromMonths()
  state.lastRefresh = Date.now()
}

// 获取当前筛选条件的描述文本
export const getFilterDescription = computed(() => {
  const systemLabel = businessSystemOptions.find(o => o.value === state.businessSystem)?.label || ''
  const regionLabel = regionOptions.find(o => o.value === state.region)?.label || ''
  const monthRange = state.startMonth === state.endMonth
    ? state.startMonth
    : `${state.startMonth} 至 ${state.endMonth}`
  return `${monthRange} | ${systemLabel} | ${regionLabel}`
})

// 导出只读状态和方法
export const useGlobalFilter = () => {
  return {
    state: readonly(state),
    timeRangeOptions,
    timeOptions: timeRangeOptions,
    businessSystemOptions,
    businessOptions: businessSystemOptions,
    regionOptions,
    setFilter,
    refreshAll,
    resetFilters,
    getFilterDescription,
    getMonthsInRange,
    getMonthLabels
  }
}
