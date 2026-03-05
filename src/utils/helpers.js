// 工具函数

// 状态颜色映射
export const statusColors = {
  green: { bg: 'bg-status-green', text: 'text-status-green', border: 'border-status-green' },
  yellow: { bg: 'bg-status-yellow', text: 'text-status-yellow', border: 'border-status-yellow' },
  red: { bg: 'bg-status-red', text: 'text-status-red', border: 'border-status-red' }
}

// 根据达成率获取状态
export const getStatusByRate = (rate, inverse = false) => {
  if (inverse) {
    if (rate <= 1) return 'green'
    if (rate <= 1.15) return 'yellow'
    return 'red'
  }
  if (rate >= 0.95) return 'green'
  if (rate >= 0.85) return 'yellow'
  return 'red'
}

// 格式化大数字
export const formatLargeNumber = (num) => {
  if (num >= 100000000) {
    return { value: (num / 100000000).toFixed(2), unit: '亿' }
  }
  if (num >= 10000) {
    return { value: (num / 10000).toFixed(2), unit: '万' }
  }
  return { value: num.toLocaleString(), unit: '' }
}

// 格式化百分比变化
export const formatChange = (value) => {
  const sign = value >= 0 ? '+' : ''
  return {
    text: `${sign}${value}%`,
    isPositive: value >= 0,
    class: value >= 0 ? 'text-status-green' : 'text-status-red'
  }
}

// 计算达成率
export const calculateAchievement = (actual, target) => {
  return ((actual / target) * 100).toFixed(1)
}

// 获取BSC维度中文名称
export const bscDimensionNames = {
  finance: '财务',
  customer: '客户',
  operation: '内部运营',
  learning: '学习成长'
}

// 获取BSC维度图标
export const bscDimensionIcons = {
  finance: '💰',
  customer: '👥',
  operation: '⚙️',
  learning: '📚'
}

// 延迟函数
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
