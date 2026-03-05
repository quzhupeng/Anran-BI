// ECharts通用配置

// 通用主题配置
export const chartTheme = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#94a3b8',
    fontFamily: 'Inter, PingFang SC, sans-serif'
  },
  title: {
    textStyle: {
      color: '#e2e8f0',
      fontSize: 14,
      fontWeight: 600
    }
  },
  legend: {
    textStyle: {
      color: '#94a3b8'
    }
  },
  tooltip: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderColor: '#334155',
    textStyle: {
      color: '#e2e8f0'
    }
  }
}

// 迷你趋势图配置
export const getMiniTrendOption = (data, isPositive = true) => ({
  ...chartTheme,
  grid: {
    left: 0,
    right: 0,
    top: 5,
    bottom: 5
  },
  xAxis: {
    type: 'category',
    show: false,
    data: data.map((_, i) => i)
  },
  yAxis: {
    type: 'value',
    show: false,
    min: (value) => value.min * 0.95,
    max: (value) => value.max * 1.05
  },
  series: [{
    type: 'line',
    data: data,
    smooth: true,
    symbol: 'none',
    lineStyle: {
      width: 2,
      color: isPositive ? '#22c55e' : '#ef4444'
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: isPositive ? [
          { offset: 0, color: 'rgba(34, 197, 94, 0.3)' },
          { offset: 1, color: 'rgba(34, 197, 94, 0)' }
        ] : [
          { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
          { offset: 1, color: 'rgba(239, 68, 68, 0)' }
        ]
      }
    }
  }]
})

// 雷达图配置
export const getRadarOption = (data) => ({
  ...chartTheme,
  radar: {
    indicator: data.metrics.map(m => ({
      name: m.name,
      max: m.fullMark
    })),
    shape: 'polygon',
    center: ['50%', '50%'],
    radius: '55%',
    splitNumber: 4,
    axisName: {
      color: '#94a3b8',
      fontSize: 10,
      overflow: 'truncate',
      width: 60
    },
    axisNameGap: 8,
    splitLine: {
      lineStyle: {
        color: 'rgba(51, 65, 85, 0.6)'
      }
    },
    splitArea: {
      areaStyle: {
        color: ['rgba(30, 41, 59, 0.3)', 'rgba(30, 41, 59, 0.1)']
      }
    },
    axisLine: {
      lineStyle: {
        color: 'rgba(51, 65, 85, 0.6)'
      }
    }
  },
  series: [{
    type: 'radar',
    data: [{
      value: data.metrics.map(m => m.value),
      name: data.name,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2,
        color: '#38bdf8'
      },
      areaStyle: {
        color: 'rgba(56, 189, 248, 0.2)'
      },
      itemStyle: {
        color: '#38bdf8',
        borderColor: '#38bdf8'
      }
    }]
  }]
})

// 环形图配置
export const getGaugeOption = (value, name, target = 100) => {
  const percentage = Math.min(value / target * 100, 100)
  const color = percentage >= 95 ? '#22c55e' : percentage >= 85 ? '#eab308' : '#ef4444'
  
  return {
    ...chartTheme,
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      itemStyle: {
        color: color
      },
      progress: {
        show: true,
        width: 12,
        roundCap: true
      },
      pointer: {
        show: false
      },
      axisLine: {
        lineStyle: {
          width: 12,
          color: [[1, 'rgba(51, 65, 85, 0.5)']]
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      anchor: {
        show: false
      },
      title: {
        show: true,
        offsetCenter: [0, '30%'],
        fontSize: 12,
        color: '#94a3b8'
      },
      detail: {
        valueAnimation: true,
        fontSize: 24,
        fontWeight: 600,
        offsetCenter: [0, '-10%'],
        formatter: '{value}%',
        color: '#e2e8f0'
      },
      data: [{
        value: percentage.toFixed(1),
        name: name
      }]
    }]
  }
}

// 对比条形图配置（差距分析）
export const getGapBarOption = (data) => ({
  ...chartTheme,
  grid: {
    left: 120,
    right: 60,
    top: 10,
    bottom: 10
  },
  xAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: {
      lineStyle: { color: 'rgba(51, 65, 85, 0.5)' }
    },
    axisLabel: {
      color: '#94a3b8',
      formatter: '{value}%'
    }
  },
  yAxis: {
    type: 'category',
    data: data.map(d => d.name),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#e2e8f0',
      fontSize: 12
    }
  },
  series: [{
    type: 'bar',
    data: data.map(d => ({
      value: d.gap,
      itemStyle: {
        color: d.gap < 0 ? '#ef4444' : d.inverse ? '#ef4444' : '#22c55e',
        borderRadius: [0, 4, 4, 0]
      }
    })),
    barWidth: 16,
    label: {
      show: true,
      position: 'right',
      formatter: '{c}%',
      color: '#94a3b8',
      fontSize: 11
    }
  }]
})

// 柱状图配置（过程指标原因分析）
export const getProcessBarOption = (data) => ({
  ...chartTheme,
  grid: {
    left: 100,
    right: 40,
    top: 10,
    bottom: 20
  },
  xAxis: {
    type: 'value',
    max: 100,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: {
      lineStyle: { color: 'rgba(51, 65, 85, 0.5)' }
    },
    axisLabel: {
      color: '#94a3b8',
      formatter: '{value}%'
    }
  },
  yAxis: {
    type: 'category',
    data: data.map(d => d.name),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#e2e8f0',
      fontSize: 11
    }
  },
  series: [
    {
      name: '当前值',
      type: 'bar',
      data: data.map(d => d.value),
      barWidth: 12,
      itemStyle: {
        color: '#38bdf8',
        borderRadius: [0, 4, 4, 0]
      }
    },
    {
      name: '目标线',
      type: 'scatter',
      data: data.map(d => [d.target, d.name]),
      symbol: 'triangle',
      symbolSize: 8,
      itemStyle: {
        color: '#eab308'
      }
    }
  ]
})

// 仪表盘四象限配置
export const getQuadrantOption = (data) => {
  const indicators = []
  const values = []
  
  Object.entries(data).forEach(([key, dimension]) => {
    dimension.indicators.forEach(ind => {
      indicators.push(ind.name)
      values.push(ind.actual / ind.target * 100)
    })
  })
  
  return {
    ...chartTheme,
    radar: {
      indicator: indicators.map(name => ({ name, max: 120 })),
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#94a3b8',
        fontSize: 10
      },
      splitLine: {
        lineStyle: { color: 'rgba(51, 65, 85, 0.6)' }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(30, 41, 59, 0.3)', 'rgba(30, 41, 59, 0.1)']
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: values,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2, color: '#38bdf8' },
        areaStyle: { color: 'rgba(56, 189, 248, 0.15)' },
        itemStyle: { color: '#38bdf8' }
      }]
    }]
  }
}
