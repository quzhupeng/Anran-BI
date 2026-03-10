// Mock数据 - 基于PDF中的BSC指标体系

// BSC核心指标数据（含当月和累计）
export const bscIndicators = {
  finance: {
    name: '财务维度',
    indicators: [
      { id: 'f1', name: '报单收入', weight: 25, target: 65000000, actual: 58200000, unit: '元', accTarget: 180000000, accActual: 152000000 },
      { id: 'f2', name: '利润', weight: 5, target: 13200000, actual: 12600000, unit: '元', accTarget: 78000000, accActual: 75200000 },
      { id: 'f3', name: '线上营销收入', weight: 5, target: 8000000, actual: 8640000, unit: '元', accTarget: 48000000, accActual: 48600000 }
    ]
  },
  customer: {
    name: '客户维度',
    indicators: [
      { id: 'c1', name: '报单人数', weight: 10, target: 150000, actual: 142500, unit: '人', accTarget: 420000, accActual: 398000 },
      { id: 'c2', name: '合高合格人次', weight: 5, target: 50000, actual: 47500, unit: '人次', accTarget: 140000, accActual: 128000 },
      { id: 'c3', name: '新人经营率', weight: 5, target: 85, actual: 72.3, unit: '%', accTarget: 85, accActual: 74.6 }
    ]
  },
  operation: {
    name: '内部运营维度',
    indicators: [
      { id: 'o1', name: '新上市产品销售总额', weight: 10, target: 12000000, actual: 10800000, unit: '元', accTarget: 36000000, accActual: 31200000 },
      { id: 'o2', name: '产成品库存周转天数', weight: 10, target: 45, actual: 52, unit: '天', inverse: true, accTarget: 45, accActual: 49 },
      { id: 'o3', name: '流程遵从率', weight: 5, target: 95, actual: 91.2, unit: '%', accTarget: 95, accActual: 92.8 }
    ]
  },
  learning: {
    name: '学习成长维度',
    indicators: [
      { id: 'l1', name: '潜质员工占比', weight: 10, target: 15, actual: 12.8, unit: '%', accTarget: 15, accActual: 13.2 },
      { id: 'l2', name: '关键岗位人才（管理）储备率', weight: 10, target: 80, actual: 68, unit: '%', accTarget: 80, accActual: 71 }
    ]
  }
}

// 计算达成状态
export const getStatus = (actual, target, inverse = false) => {
  const ratio = actual / target
  if (inverse) {
    if (ratio <= 1) return 'green'
    if (ratio <= 1.15) return 'yellow'
    return 'red'
  }
  if (ratio >= 0.95) return 'green'
  if (ratio >= 0.85) return 'yellow'
  return 'red'
}

// 核心财务卡片数据
export const financeCardsData = {
  baodan: {
    name: '报单收入',
    currentMonth: {
      actual: 58200000,
      target: 65000000,
      mom: 8.5,
      yoy: 15.2,
      trend: [52, 54, 56, 53, 55, 58.2]
    },
    accumulated: {
      actual: 152000000,
      target: 180000000,
      mom: 6.2,
      yoy: 12.8,
      trend: [85, 102, 118, 132, 143, 152]
    }
  },
  onlineMarketing: {
    name: '线上营销收入',
    currentMonth: {
      actual: 8640000,
      target: 8000000,
      mom: 12.3,
      yoy: 28.5,
      trend: [6.5, 7.0, 7.5, 7.8, 8.2, 8.64]
    },
    accumulated: {
      actual: 48600000,
      target: 48000000,
      mom: 8.6,
      yoy: 32.1,
      trend: [28, 33, 38, 42, 45.5, 48.6]
    }
  },
  profit: {
    name: '利润',
    currentMonth: {
      actual: 12600000,
      target: 13200000,
      mom: -1.8,
      yoy: 4.6,
      trend: [11.6, 11.8, 12.1, 12.0, 12.2, 12.6],
      subMetrics: {
        name: '利润达成率',
        actual: 95.5,
        target: 100,
        unit: '%'
      }
    },
    accumulated: {
      actual: 75200000,
      target: 78000000,
      mom: 2.1,
      yoy: 7.4,
      trend: [62, 65, 68, 70, 72, 75.2],
      subMetrics: {
        name: '利润达成率',
        actual: 96.4,
        target: 100,
        unit: '%'
      }
    }
  }
}

// 过程驱动指标（雷达图）
export const processIndicators = {
  current: {
    name: '本周进度',
    metrics: [
      { name: '市场活动执行数', value: 85, fullMark: 100 },
      { name: '培训覆盖人次', value: 72, fullMark: 100 },
      { name: '线上营销收入进度', value: 108, fullMark: 100 },
      { name: '新品销售额进度', value: 90, fullMark: 100 },
      { name: '销售预测准确率', value: 88, fullMark: 100 },
      { name: '人才培养计划完成率', value: 65, fullMark: 100 }
    ]
  }
}

// 智能预警数据
export const alertData = [
  { id: 1, level: 'red', title: '利润指标连续3天环比下降', detail: '最近3天利润由428万降至391万，触发连续下降规则', time: '2小时前', icon: '⚠️' },
  { id: 2, level: 'yellow', title: '线上营销收入低于团队平均值15%', detail: '当前较同规模团队均值低16.8%，建议核查投放转化', time: '5小时前', icon: '⚡' },
  { id: 3, level: 'yellow', title: '报单人数波动异常', detail: '近7日波动系数12.4%，高于预设阈值10%', time: '1天前', icon: '📊' },
  { id: 4, level: 'red', title: '关键岗位人才储备率低于红线', detail: '连续2周低于70%，已触发组织韧性风险规则', time: '2天前', icon: '👥' },
  { id: 5, level: 'yellow', title: '库存周转天数高于区域均值', detail: '当前52天，较区域均值高15.6%', time: '3天前', icon: '📋' }
]

// 行动跟踪表数据（经营分析会模式）
export const actionTrackerData = [
  {
    id: 1,
    indicator: '新人经营率',
    rootCause: '新人培训跟进机制不完善，缺乏持续的团队帮扶',
    action: '建立新人专项帮扶计划，每周进行业务指导',
    owner: '张经理',
    status: '进行中',
    deadline: '2026-03-15'
  },
  {
    id: 2,
    indicator: '产成品库存周转天数',
    rootCause: '销售预测偏差较大，促销清库计划执行不力',
    action: '优化销售预测模型，启动库存清理专项行动',
    owner: '李总监',
    status: '待启动',
    deadline: '2026-03-10'
  },
  {
    id: 5,
    indicator: '流程遵从率',
    rootCause: '流程培训与宣导不足，缺乏定期检查与考核机制',
    action: '加强流程培训宣导，建立定期检查考核机制',
    owner: '赵主任',
    status: '待启动',
    deadline: '2026-03-25'
  },
  {
    id: 3,
    indicator: '关键岗位人才（管理）储备率',
    rootCause: '人才培养计划推进缓慢，晋升通道不清晰',
    action: '重新规划人才盘点与培养计划，明确晋升路径',
    owner: '王部长',
    status: '进行中',
    deadline: '2026-03-20'
  },
  {
    id: 4,
    indicator: '潜质员工占比',
    rootCause: '内部竞聘与轮岗机制缺乏，人才识别能力不足',
    action: '开展潜质员工专项评估，启动轮岗交流计划',
    owner: '刘主管',
    status: '已完成',
    deadline: '2026-03-01'
  }
]

// 上月PDCA追踪数据
export const lastMonthPdcaData = [
  {
    id: 'pdca-1',
    indicator: '报单收入',
    action: '华东区重点客户二次回访覆盖率提升至90%',
    owner: '张经理',
    deadline: '2026-02-28',
    status: '已完成',
    result: '华东区回访覆盖率达92%，报单收入环比提升8.5%',
    effectiveness: 'high'
  },
  {
    id: 'pdca-2',
    indicator: '新人经营率',
    action: '启动新人导师制，每周1对1帮扶',
    owner: '王部长',
    deadline: '2026-02-25',
    status: '部分完成',
    result: '导师配对完成85%，新人经营率由70.1%提升至72.3%，仍低于目标',
    effectiveness: 'medium'
  },
  {
    id: 'pdca-3',
    indicator: '产成品库存周转天数',
    action: '启动滞销品促销清库专项',
    owner: '李总监',
    deadline: '2026-02-20',
    status: '已完成',
    result: '清理滞销库存380万元，周转天数由56天降至52天，目标45天',
    effectiveness: 'medium'
  },
  {
    id: 'pdca-4',
    indicator: '线上营销收入',
    action: '优化高转化人群投放包，重配预算',
    owner: '刘主管',
    deadline: '2026-02-28',
    status: '已完成',
    result: '线上营销收入超额完成108%，投放ROI提升23%',
    effectiveness: 'high'
  },
  {
    id: 'pdca-5',
    indicator: '关键岗位人才储备率',
    action: '完成年度人才盘点与晋升路径设计',
    owner: '王部长',
    deadline: '2026-02-28',
    status: '未完成',
    result: '人才盘点完成60%，晋升路径设计延期至3月中旬',
    effectiveness: 'low'
  }
]

// 月度趋势数据
export const monthlyTrendData = {
  months: ['8月', '9月', '10月', '11月', '12月', '1月'],
  baodan: {
    actual: [42, 44, 46, 43, 45, 47.5],
    target: [45, 45, 45, 45, 45, 50]
  },
  profit: {
    actual: [95, 94, 93, 94.5, 93, 92.5],
    target: [100, 100, 100, 100, 100, 100]
  }
}

// 差距分析数据
export const gapAnalysisData = {
  indicators: [
    { name: '新人经营率', gap: -12.7, impact: 'high' },
    { name: '产成品库存周转天数', gap: 7, impact: 'high', inverse: true },
    { name: '关键岗位人才储备率', gap: -12, impact: 'medium' },
    { name: '潜质员工占比', gap: -2.2, impact: 'medium' },
    { name: '流程遵从率', gap: -3.8, impact: 'low' }
  ],
  processCauses: [
    { name: '新人培训覆盖率', value: 68, target: 90 },
    { name: '销售预测准确率', value: 82, target: 95 },
    { name: '人才培养计划完成率', value: 65, target: 85 },
    { name: '流程培训宣导次数', value: 4, target: 6 }
  ]
}

// 格式化数字
export const formatNumber = (num, unit = '') => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿' + unit
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万' + unit
  }
  return num.toLocaleString() + unit
}
