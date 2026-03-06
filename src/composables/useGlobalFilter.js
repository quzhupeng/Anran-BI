// 全局筛选状态管理
import { reactive, readonly, computed } from 'vue'

const getDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 29)
  const formatDate = (date) => date.toISOString().split('T')[0]
  return {
    startDate: formatDate(start),
    endDate: formatDate(end)
  }
}

const defaultRange = getDefaultDateRange()

// 全局筛选状态
const state = reactive({
  // 时间周期
  timeRange: 'custom', // 保留字段兼容移动端筛选
  startDate: defaultRange.startDate,
  endDate: defaultRange.endDate,
  // 业务体系
  businessSystem: 'all', // all | diamond | huaqi | innovation
  // 大区
  region: 'all', // all | east | south | north | central | southwest | northwest | northeast
  // 数据刷新时间戳
  lastRefresh: Date.now()
})

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
  { value: 'innovation', label: '创新业务' }
]

// 大区选项
export const regionOptions = [
  { value: 'all', label: '全国' },
  { value: 'east', label: '华东区' },
  { value: 'south', label: '华南区' },
  { value: 'north', label: '华北区' },
  { value: 'central', label: '华中区' },
  { value: 'southwest', label: '西南区' },
  { value: 'northwest', label: '西北区' },
  { value: 'northeast', label: '东北区' }
]

// 修改筛选条件
export const setFilter = (key, value) => {
  if (typeof key === 'object' && key !== null) {
    Object.keys(key).forEach((field) => {
      if (field in state) {
        state[field] = key[field]
      }
    })
    state.lastRefresh = Date.now()
    return
  }

  if (key in state) {
    state[key] = value
    state.lastRefresh = Date.now()
  }
}

// 刷新所有数据
export const refreshAll = () => {
  state.lastRefresh = Date.now()
}

// 重置筛选条件
export const resetFilters = () => {
  const range = getDefaultDateRange()
  state.timeRange = 'custom'
  state.startDate = range.startDate
  state.endDate = range.endDate
  state.businessSystem = 'all'
  state.region = 'all'
  state.lastRefresh = Date.now()
}

// 获取当前筛选条件的描述文本
export const getFilterDescription = computed(() => {
  const systemLabel = businessSystemOptions.find(o => o.value === state.businessSystem)?.label || ''
  const regionLabel = regionOptions.find(o => o.value === state.region)?.label || ''
  return `${state.startDate} 至 ${state.endDate} | ${systemLabel} | ${regionLabel}`
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
    getFilterDescription
  }
}
